// @flow
import Texture from './texture';
import Color from '../style-spec/util/color';
import DepthMode from '../gl/depth_mode';
import StencilMode from '../gl/stencil_mode';
import {
    ipfillExtrusionUniformValues,
    ipfillExtrusionPatternUniformValues,
    ipextrusionTextureUniformValues,

    // From ipline
    ipfillExtrusionOutlineUniformValues,
    ipfillExtrusionOutlinePatternUniformValues,
    ipfillExtrusionOutlineSDFUniformValues,
    ipfillExtrusionOutlineGradientUniformValues
} from './program/ipfill_extrusion_program';

// export default drawIPFillExtrusion;
// export default drawIPLine2;
export default finalDraw2;

function finalDraw2(painter, sourceCache, layer, coords) {
    if (layer.paint.get('ipfill-extrusion-opacity') === 0) {
        return;
    }

    // console.log(painter.renderPass);
    if (painter.renderPass === 'translucent') {
        drawExtrusionTexture(painter, layer);
    } else if (painter.renderPass === 'offscreen') {
        drawToExtrusionFramebuffer(painter, layer);

        const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, [0, 1]),
            stencilMode = StencilMode.disabled,
            colorMode = painter.colorModeForRenderPass();

        const context = painter.context;
        const gl = context.gl;
        const patternProperty = layer.paint.get('ipfill-extrusion-pattern');
        const image = patternProperty.constantOr((1));
        const crossfade = layer.getCrossfadeParameters();

        // For ipline
        const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
        const width = layer.paint.get('ipfill-extrusion-outline-width');
        if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;

        // const outlineDepthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadOnly, [0, 1]);
        const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
        const outlinePatternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
        const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');

        let firstTile = true;

        if (gradient) {
            context.activeTexture.set(gl.TEXTURE0);
            let gradientTexture = layer.gradientTexture;
            if (!layer.gradient) return;
            if (!gradientTexture) gradientTexture = layer.gradientTexture = new Texture(context, layer.gradient, gl.RGBA);
            gradientTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
        }

        // For ipline

        for (const coord of coords) {
            const tile = sourceCache.getTile(coord);
            const bucket = (tile.getBucket(layer));
            if (!bucket) continue;

            const programConfiguration = bucket.programConfigurations.get(layer.id);
            const program = painter.useProgram(image ? 'ipfillExtrusionPattern' : 'ipfillExtrusion', programConfiguration);

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

            const uniformValues = image ?
                ipfillExtrusionPatternUniformValues(matrix, painter, coord, crossfade, tile) :
                ipfillExtrusionUniformValues(matrix, painter);


            program.draw(context, context.gl.TRIANGLES, depthMode, stencilMode, colorMode,
                uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
                bucket.segments, layer.paint, painter.transform.zoom,
                programConfiguration);

            if (image && !tile.patternsLoaded()) continue;
            drawIPExtrusionOutlineTile(painter, layer, coord, firstTile, tile, {
                // depthMode: outlineDepthMode,
                depthMode: depthMode,
                colorMode: colorMode,
                dasharray: dasharray,
                patternProperty: outlinePatternProperty,
                gradient: gradient,
                image: image,
                crossfade: crossfade,
            });
            firstTile = false;
        }
    }

    // const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
    // const width = layer.paint.get('ipfill-extrusion-outline-width');
    // if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;
    //
    //
    // const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    // const colorMode = painter.colorModeForRenderPass();
    // const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
    // const patternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
    // const image = patternProperty.constantOr((1));
    // const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');
    // const crossfade = layer.getCrossfadeParameters();
    //
    // const context = painter.context;
    // const gl = context.gl;
    //
    // let firstTile = true;

    // if (gradient) {
    //     context.activeTexture.set(gl.TEXTURE0);
    //     let gradientTexture = layer.gradientTexture;
    //     if (!layer.gradient) return;
    //     if (!gradientTexture) gradientTexture = layer.gradientTexture = new Texture(context, layer.gradient, gl.RGBA);
    //     gradientTexture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);
    // }

    // for (const coord of coords) {
    //     const tile = sourceCache.getTile(coord);
    //     if (image && !tile.patternsLoaded()) continue;
    //     drawIPExtrusionOutlineTile(painter, layer, coord, firstTile, tile, {
    //         depthMode: depthMode,
    //         colorMode: colorMode,
    //         dasharray: dasharray,
    //         patternProperty: patternProperty,
    //         gradient: gradient,
    //         image: image,
    //         crossfade: crossfade,
    //     });
    //     firstTile = false;
    // }
}

function finalDraw(painter, sourceCache, layer, coords) {
    if (layer.paint.get('ipfill-extrusion-opacity') === 0) {
        return;
    }

    if (painter.renderPass === 'offscreen') {
        drawToExtrusionFramebuffer(painter, layer);

        const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, [0, 1]),
            stencilMode = StencilMode.disabled,
            colorMode = painter.colorModeForRenderPass();

        drawExtrusionTiles(painter, sourceCache, layer, coords, depthMode, stencilMode, colorMode);
    } else if (painter.renderPass === 'translucent') {
        drawExtrusionTexture(painter, layer);
    }

    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
    const width = layer.paint.get('ipfill-extrusion-outline-width');
    if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;


    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const colorMode = painter.colorModeForRenderPass();
    const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
    const patternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
    const image = patternProperty.constantOr((1));
    const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');
    const crossfade = layer.getCrossfadeParameters();

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
        drawIPExtrusionOutlineTile(painter, layer, coord, firstTile, tile, {
            depthMode: depthMode,
            colorMode: colorMode,
            dasharray: dasharray,
            patternProperty: patternProperty,
            gradient: gradient,
            image: image,
            crossfade: crossfade,
        });
        firstTile = false;
    }
}

// From ipline

function drawIPLine2(painter, sourceCache, layer, coords) {
    // console.log("drawIPLine");
    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
    const width = layer.paint.get('ipfill-extrusion-outline-width');
    if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;


    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const colorMode = painter.colorModeForRenderPass();
    const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
    const patternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
    const image = patternProperty.constantOr((1));
    const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');
    const crossfade = layer.getCrossfadeParameters();

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
        drawIPExtrusionOutlineTile(painter, layer, coord, firstTile, tile, {
            depthMode: depthMode,
            colorMode: colorMode,
            dasharray: dasharray,
            patternProperty: patternProperty,
            gradient: gradient,
            image: image,
            crossfade: crossfade,
        });
        firstTile = false;
    }
}

function drawIPExtrusionOutlineTile(painter, layer, coord, firstTile, tile, options) {
    const bucket = (tile.getBucket(layer));
    if (!bucket) return;

    const context = painter.context;
    const gl = context.gl;

    const depthMode = options.depthMode;
    const colorMode = options.colorMode;
    const dasharray = options.dasharray;
    const patternProperty = options.patternProperty;
    const image = options.image;
    const gradient = options.gradient;
    const crossfade = options.crossfade;

    const programId =
        dasharray ? 'lineSDF' :
            image ? 'linePattern' :
                gradient ? 'lineGradient' : 'ipfillExtrusionOutline';

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

    program.draw(context, gl.TRIANGLES, depthMode,
        painter.stencilModeForClipping(coord), colorMode, uniformValues,
        layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
        layer.paint, painter.transform.zoom, programConfiguration);
}

function drawIPLine(painter, sourceCache, layer, coords) {
    // console.log("drawIPLine");
    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('ipfill-extrusion-outline-opacity');
    const width = layer.paint.get('ipfill-extrusion-outline-width');
    if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;

    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const colorMode = painter.colorModeForRenderPass();

    const dasharray = layer.paint.get('ipfill-extrusion-outline-dasharray');
    const patternProperty = layer.paint.get('ipfill-extrusion-outline-pattern');
    const image = patternProperty.constantOr((1));

    const gradient = layer.paint.get('ipfill-extrusion-outline-gradient');
    const crossfade = layer.getCrossfadeParameters();

    const programId =
        dasharray ? 'lineSDF' :
            image ? 'linePattern' :
                gradient ? 'lineGradient' : 'ipfillExtrusionOutline';

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
        // console.log("draw_ipline.useProgram: "+programId)
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

        program.draw(context, gl.TRIANGLES, depthMode,
            painter.stencilModeForClipping(coord), colorMode, uniformValues,
            layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer, bucket.segments,
            layer.paint, painter.transform.zoom, programConfiguration);

        firstTile = false;
    }
}

// From ipline

function drawIPFillExtrusion(painter, source, layer, coords) {
    if (layer.paint.get('ipfill-extrusion-opacity') === 0) {
        return;
    }

    if (painter.renderPass === 'offscreen') {
        drawToExtrusionFramebuffer(painter, layer);

        const depthMode = new DepthMode(painter.context.gl.LEQUAL, DepthMode.ReadWrite, [0, 1]),
            stencilMode = StencilMode.disabled,
            colorMode = painter.colorModeForRenderPass();

        drawExtrusionTiles(painter, source, layer, coords, depthMode, stencilMode, colorMode);

    } else if (painter.renderPass === 'translucent') {
        drawExtrusionTexture(painter, layer);
    }
}

function drawToExtrusionFramebuffer(painter, layer) {
    const context = painter.context;
    const gl = context.gl;

    let renderTarget = layer.viewportFrame;

    if (painter.depthRboNeedsClear) {
        painter.setupOffscreenDepthRenderbuffer();
    }

    if (!renderTarget) {
        const texture = new Texture(context, {width: painter.width, height: painter.height, data: null}, gl.RGBA);
        texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE);

        renderTarget = layer.viewportFrame = context.createFramebuffer(painter.width, painter.height);
        renderTarget.colorAttachment.set(texture.texture);
    }

    context.bindFramebuffer.set(renderTarget.framebuffer);
    renderTarget.depthAttachment.set(painter.depthRbo);

    if (painter.depthRboNeedsClear) {
        context.clear({depth: 1});
        painter.depthRboNeedsClear = false;
    }

    context.clear({color: Color.transparent});
}

function drawExtrusionTexture(painter, layer) {
    const renderedTexture = layer.viewportFrame;
    if (!renderedTexture) return;

    const context = painter.context;
    const gl = context.gl;

    context.activeTexture.set(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderedTexture.colorAttachment.get());

    painter.useProgram('extrusionTexture').draw(context, gl.TRIANGLES,
        DepthMode.disabled, StencilMode.disabled,
        painter.colorModeForRenderPass(),
        ipextrusionTextureUniformValues(painter, layer, 0),
        layer.id, painter.viewportBuffer, painter.quadTriangleIndexBuffer,
        painter.viewportSegments, layer.paint, painter.transform.zoom);
}

function drawExtrusionTiles(painter, source, layer, coords, depthMode, stencilMode, colorMode) {
    const context = painter.context;
    const gl = context.gl;
    const patternProperty = layer.paint.get('ipfill-extrusion-pattern');
    const image = patternProperty.constantOr((1));
    const crossfade = layer.getCrossfadeParameters();

    for (const coord of coords) {
        const tile = source.getTile(coord);
        const bucket = (tile.getBucket(layer));
        if (!bucket) continue;

        const programConfiguration = bucket.programConfigurations.get(layer.id);
        const program = painter.useProgram(image ? 'ipfillExtrusionPattern' : 'ipfillExtrusion', programConfiguration);

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

        const uniformValues = image ?
            ipfillExtrusionPatternUniformValues(matrix, painter, coord, crossfade, tile) :
            ipfillExtrusionUniformValues(matrix, painter);


        program.draw(context, context.gl.TRIANGLES, depthMode, stencilMode, colorMode,
            uniformValues, layer.id, bucket.layoutVertexBuffer, bucket.indexBuffer,
            bucket.segments, layer.paint, painter.transform.zoom,
            programConfiguration);
    }
}
