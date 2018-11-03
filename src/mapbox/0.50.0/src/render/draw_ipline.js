// @flow

import DepthMode from '../gl/depth_mode';
import Texture from './texture';
import {
    iplineUniformValues,
    iplinePatternUniformValues,
    iplineSDFUniformValues,
    iplineGradientUniformValues
} from './program/ipline_program';


export default function drawIPLine(painter: Painter, sourceCache: SourceCache, layer: IPLineStyleLayer, coords: Array<OverscaledTileID>) {
    // console.log("drawIPLine")
    if (painter.renderPass !== 'translucent') return;

    const opacity = layer.paint.get('ipline-opacity');
    const width = layer.paint.get('ipline-width');
    if (opacity.constantOr(1) === 0 || width.constantOr(1) === 0) return;

    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);
    const colorMode = painter.colorModeForRenderPass();

    const dasharray = layer.paint.get('ipline-dasharray');
    const patternProperty = layer.paint.get('ipline-pattern');
    const image = patternProperty.constantOr((1: any));

    const gradient = layer.paint.get('ipline-gradient');
    const crossfade = layer.getCrossfadeParameters();

    const programId =
        dasharray ? 'lineSDF' :
        image ? 'linePattern' :
        gradient ? 'lineGradient' : 'ipline';

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

        const bucket: ? IPLineBucket = (tile.getBucket(layer): any);
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

        const uniformValues = dasharray ? iplineSDFUniformValues(painter, tile, layer, dasharray, crossfade) :
            image ? iplinePatternUniformValues(painter, tile, layer, crossfade) :
            gradient ? iplineGradientUniformValues(painter, tile, layer) :
            iplineUniformValues(painter, tile, layer);

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
        // once refactored so that bound texture state is managed, we'll also be able to remove this firstTile/programChanged logic
    }
    // console.log("drawIPLine Over")
}
