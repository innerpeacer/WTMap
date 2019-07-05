// @flow

import DepthMode from '../gl/depth_mode';
import StencilMode from '../gl/stencil_mode';
import ColorMode from '../gl/color_mode';
import CullFaceMode from '../gl/cull_face_mode';
import Texture from './texture';
import {
    ipfillExtrusionUniformValues,
    ipfillExtrusionPatternUniformValues,

    ipfillExtrusionOutlineUniformValues,
    ipfillExtrusionOutlinePatternUniformValues,
    ipfillExtrusionOutlineSDFUniformValues,
    ipfillExtrusionOutlineGradientUniformValues
} from './program/ipfill_extrusion_program';

// export default draw;
// export default drawIPLine;
import {flagOutline} from "../debug_flag";
export default (flagOutline ? drawIPLine : draw);

function draw(painter, source, layer, coords) {
    const opacity = layer.paint.get('ipfill-extrusion-opacity');
    if (opacity === 0) {
        return;
    }

    if (painter.renderPass === 'translucent') {
        // console.log("Draw extrusion in translucent");
        const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, painter.depthRangeFor3D);

        if (opacity === 1 && !layer.paint.get('ipfill-extrusion-pattern').constantOr((1))) {
            const colorMode = painter.colorModeForRenderPass();
            drawExtrusionTiles(painter, source, layer, coords, depthMode, StencilMode.disabled, colorMode);

        } else {
            // Draw transparent buildings in two passes so that only the closest surface is drawn.
            // First draw all the extrusions into only the depth buffer. No colors are drawn.
            drawExtrusionTiles(painter, source, layer, coords, depthMode,
                StencilMode.disabled,
                ColorMode.disabled);

            // Then draw all the extrusions a second type, only coloring fragments if they have the
            // same depth value as the closest fragment in the previous pass. Use the stencil buffer
            // to prevent the second draw in cases where we have coincident polygons.
            drawExtrusionTiles(painter, source, layer, coords, depthMode,
                painter.stencilModeFor3D(),
                painter.colorModeForRenderPass());
        }

        // console.log("Draw extrusion outline in translucent")
        const outlineOpacity = layer.paint.get('ipfill-extrusion-outline-opacity');
        const outlineWidth = layer.paint.get('ipfill-extrusion-outline-width');
        if (outlineOpacity.constantOr(1) === 0 || outlineWidth.constantOr(1) === 0) return;
        drawExtrusionOutlineTiles(painter, source, layer, coords);
    }
}

function drawIPExtrusion(painter, source, layer, coords) {
    const opacity = layer.paint.get('ipfill-extrusion-opacity');
    if (opacity === 0) {
        return;
    }

    if (painter.renderPass === 'translucent') {
        const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, painter.depthRangeFor3D);

        if (opacity === 1 && !layer.paint.get('ipfill-extrusion-pattern').constantOr((1))) {
            const colorMode = painter.colorModeForRenderPass();
            drawExtrusionTiles(painter, source, layer, coords, depthMode, StencilMode.disabled, colorMode);

        } else {
            // Draw transparent buildings in two passes so that only the closest surface is drawn.
            // First draw all the extrusions into only the depth buffer. No colors are drawn.
            drawExtrusionTiles(painter, source, layer, coords, depthMode,
                StencilMode.disabled,
                ColorMode.disabled);

            // Then draw all the extrusions a second type, only coloring fragments if they have the
            // same depth value as the closest fragment in the previous pass. Use the stencil buffer
            // to prevent the second draw in cases where we have coincident polygons.
            drawExtrusionTiles(painter, source, layer, coords, depthMode,
                painter.stencilModeFor3D(),
                painter.colorModeForRenderPass());
        }
    }
}

function drawExtrusionTiles(painter, source, layer, coords, depthMode, stencilMode, colorMode) {
    const context = painter.context;
    const gl = context.gl;
    const patternProperty = layer.paint.get('ipfill-extrusion-pattern');
    const image = patternProperty.constantOr((1));
    const crossfade = layer.getCrossfadeParameters();
    const opacity = layer.paint.get('ipfill-extrusion-opacity');

    for (const coord of coords) {
        const tile = source.getTile(coord);
        const bucket = (tile.getBucket(layer));
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const program = painter.useProgram(image ? 'fillExtrusionPattern' : 'ipfillExtrusion', programConfiguration);

        if (image) {
            painter.context.activeTexture.set(gl.TEXTURE0);
            tile.imageAtlasTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            programConfiguration.updatePatternPaintBuffers(crossfade);
        }

        const constantPattern = patternProperty.constantOr(null);
        if (constantPattern && tile.imageAtlas) {
            const posTo = tile.imageAtlas.patternPositions[constantPattern.to];
            const posFrom = tile.imageAtlas.patternPositions[constantPattern.from];
            if (posTo && posFrom) programConfiguration.setConstantPatternPositions(posTo, posFrom);
        }

        const matrix = painter.translatePosMatrix(
            coord.posMatrix,
            tile,
            layer.paint.get('ipfill-extrusion-translate'),
            layer.paint.get('ipfill-extrusion-translate-anchor'));

        const shouldUseVerticalGradient = layer.paint.get('ipfill-extrusion-vertical-gradient');
        const uniformValues = image ?
            ipfillExtrusionPatternUniformValues(matrix, painter, shouldUseVerticalGradient, opacity, coord, crossfade, tile) :
            ipfillExtrusionUniformValues(matrix, painter, shouldUseVerticalGradient, opacity);


        program.draw(context, context.gl.TRIANGLES, depthMode, stencilMode, colorMode, CullFaceMode.backCCW,
            uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
            bucket.segments, layer.paint, painter.transform.zoom,
            programConfiguration);
    }
}

function drawExtrusionOutlineTiles(painter, sourceCache, layer, coords) {
    // const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, painter.depthRangeFor3D);
    const colorMode = painter.colorModeForRenderPass();

    const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
    const patternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
    const image = patternProperty.constantOr((1));

    const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');
    const crossfade = layer.getCrossfadeParameters();

    const programId = dasharray ? 'lineSDF' : (image ? 'linePattern' : (gradient ? 'lineGradient' : 'ipfillExtrusionOutline'));

    const context = painter.context;
    const gl = context.gl;

    let firstTile = true;

    if (gradient) {
        context.activeTexture.set(gl.TEXTURE0);

        let gradientTexture = layer.gradientTexture;
        if (!layer.gradient) return;
        if (!gradientTexture) gradientTexture = layer.gradientTexture = new Texture(context, layer.gradient, gl.RGBA);
        gradientTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    }

    for (const coord of coords) {
        const tile = sourceCache.getTile(coord);

        if (image && !tile.patternsLoaded()) continue;

        const bucket = (tile.getBucket(layer));
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const prevProgram = painter.context.program.get();
        const program = painter.useProgram(programId, programConfiguration);
        const programChanged = firstTile || program.program !== prevProgram;

        const constantPattern = patternProperty.constantOr(null);
        if (constantPattern && tile.imageAtlas) {
            const posTo = tile.imageAtlas.patternPositions[constantPattern.to];
            const posFrom = tile.imageAtlas.patternPositions[constantPattern.from];
            if (posTo && posFrom) programConfiguration.setConstantPatternPositions(posTo, posFrom);
        }

        const uniformValues = dasharray ? ipfillExtrusionOutlineSDFUniformValues(painter, tile, layer, dasharray, crossfade) :
            image ? ipfillExtrusionOutlinePatternUniformValues(painter, tile, layer, crossfade) :
                gradient ? ipfillExtrusionOutlineGradientUniformValues(painter, tile, layer) :
                    ipfillExtrusionOutlineUniformValues(painter, tile, layer);

        if (dasharray && (programChanged || painter.lineAtlas.dirty)) {
            context.activeTexture.set(gl.TEXTURE0);
            painter.lineAtlas.bind(context);
        } else if (image) {
            context.activeTexture.set(gl.TEXTURE0);
            tile.imageAtlasTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
            programConfiguration.updatePatternPaintBuffers(crossfade);
        }

        // program.draw(context, gl.TRIANGLES, depthMode,
        //     painter.stencilModeForClipping(coord), colorMode, CullFaceMode.disabled, uniformValues,
        //     layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
        //     layer.paint, painter.transform.zoom, programConfiguration);
        program.draw(context, gl.TRIANGLES, depthMode,
            StencilMode.disabled, colorMode, CullFaceMode.disabled, uniformValues,
            layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            layer.paint, painter.transform.zoom, programConfiguration);

        firstTile = false;
    }
}

// export default function drawLine(painter, sourceCache, layer, coords) {
function drawIPLine(painter, sourceCache, layer, coords) {
    // console.log("drawIPLine");
    if (painter.renderPass !== 'translucent') return;
    const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
    const width = layer.paint.get('ipfill-extrusion-outline-width');
    if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;
    drawExtrusionOutlineTiles(painter, sourceCache, layer, coords);
}
