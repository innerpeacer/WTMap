// @flow

import Point from '@mapbox/point-geometry';
import drawCollisionDebug from './draw_collision_debug';

import SegmentVector from '../data/segment';
import pixelsToTileUnits from '../source/pixels_to_tile_units';
import * as symbolProjection from '../symbol/projection';
import * as symbolSize from '../symbol/symbol_size';
import { mat4 } from 'gl-matrix';
const identityMat4 = mat4.identity(new Float32Array(16));
import properties from '../style/style_layer/symbol_style_layer_properties';
const symbolLayoutProperties = properties.layout;
import StencilMode from '../gl/stencil_mode';
import DepthMode from '../gl/depth_mode';
import CullFaceMode from '../gl/cull_face_mode';
import {addDynamicAttributes} from '../data/bucket/symbol_bucket';

import { getAnchorAlignment } from '../symbol/shaping';
import ONE_EM from '../symbol/one_em';
import { evaluateRadialOffset } from '../symbol/symbol_layout';

import {
    symbolIconUniformValues,
    symbolSDFUniformValues
} from './program/symbol_program';

import type Painter from './painter';
import type SourceCache from '../source/source_cache';
import type SymbolStyleLayer from '../style/style_layer/symbol_style_layer';
import type SymbolBucket, {SymbolBuffers} from '../data/bucket/symbol_bucket';
import type Texture from '../render/texture';
import type {OverscaledTileID} from '../source/tile_id';
import type {UniformValues} from './uniform_binding';
import type {SymbolSDFUniformsType} from '../render/program/symbol_program';
import type { CrossTileID, VariableOffset } from '../symbol/placement';

export default drawSymbols;

type SymbolTileRenderState = {
    segments: SegmentVector,
    sortKey: number,
    state: {
        program: any,
        buffers: SymbolBuffers,
        uniformValues: any,
        atlasTexture: Texture,
        atlasInterpolation: any,
        isSDF: boolean,
        hasHalo: boolean
    }
};

function drawSymbols(painter: Painter, sourceCache: SourceCache, layer: SymbolStyleLayer, coords: Array<OverscaledTileID>, variableOffsets: {[CrossTileID]: VariableOffset}) {
    if (painter.renderPass !== 'translucent') return;

    // Disable the stencil test so that labels aren't clipped to tile boundaries.
    const stencilMode = StencilMode.disabled;
    const colorMode = painter.colorModeForRenderPass();

    if (layer.paint.get('icon-opacity').constantOr(1) !== 0) {
        drawLayerSymbols(painter, sourceCache, layer, coords, false,
            layer.paint.get('icon-translate'),
            layer.paint.get('icon-translate-anchor'),
            layer.layout.get('icon-rotation-alignment'),
            layer.layout.get('icon-pitch-alignment'),
            layer.layout.get('icon-keep-upright'),
            stencilMode, colorMode, variableOffsets
        );
    }

    if (layer.paint.get('text-opacity').constantOr(1) !== 0) {
        drawLayerSymbols(painter, sourceCache, layer, coords, true,
            layer.paint.get('text-translate'),
            layer.paint.get('text-translate-anchor'),
            layer.layout.get('text-rotation-alignment'),
            layer.layout.get('text-pitch-alignment'),
            layer.layout.get('text-keep-upright'),
            stencilMode, colorMode, variableOffsets
        );
    }

    if (sourceCache.map.showCollisionBoxes) {
        drawCollisionDebug(painter, sourceCache, layer, coords);
    }
}

function calculateVariableRenderShift(anchor, width, height, radialOffset, textBoxScale, renderTextSize): Point {
    const {horizontalAlign, verticalAlign} = getAnchorAlignment(anchor);
    const shiftX = -(horizontalAlign - 0.5) * width;
    const shiftY = -(verticalAlign - 0.5) * height;
    const offset = evaluateRadialOffset(anchor, radialOffset);
    return new Point(
        (shiftX / textBoxScale + offset[0]) * renderTextSize,
        (shiftY / textBoxScale + offset[1]) * renderTextSize
    );
}

function updateVariableAnchors(bucket, rotateWithMap, pitchWithMap, variableOffsets, symbolSize,
                               transform, labelPlaneMatrix, posMatrix, tileScale, size) {
    const placedSymbols = bucket.text.placedSymbolArray;
    const dynamicLayoutVertexArray = bucket.text.dynamicLayoutVertexArray;
    dynamicLayoutVertexArray.clear();
    for (let s = 0; s < placedSymbols.length; s++) {
        const symbol: any = placedSymbols.get(s);
        const variableOffset = (!symbol.hidden && symbol.crossTileID) ? variableOffsets[symbol.crossTileID] : null;
        if (!variableOffset) {
            // These symbols are from a justification that is not being used, or a label that wasn't placed
            // so we don't need to do the extra math to figure out what incremental shift to apply.
            symbolProjection.hideGlyphs(symbol.numGlyphs, dynamicLayoutVertexArray);
        } else  {
            const tileAnchor = new Point(symbol.anchorX, symbol.anchorY);
            // const projectedAnchor = symbolProjection.project(tileAnchor, pitchWithMap ? posMatrix : labelPlaneMatrix);
            tileAnchor.z = symbol.symbolHeight || 0;
            const projectedAnchor = symbolProjection.project2(tileAnchor, pitchWithMap ? posMatrix : labelPlaneMatrix);
            const perspectiveRatio = 0.5 + 0.5 * (transform.cameraToCenterDistance / projectedAnchor.signedDistanceFromCamera);
            let renderTextSize = symbolSize.evaluateSizeForFeature(bucket.textSizeData, size, symbol) * perspectiveRatio / ONE_EM;
            if (pitchWithMap) {
                // Go from size in pixels to equivalent size in tile units
                renderTextSize *= bucket.tilePixelRatio / tileScale;
            }

            const { width, height, radialOffset, textBoxScale } = variableOffset;

            const shift = calculateVariableRenderShift(
                variableOffset.anchor, width, height, radialOffset, textBoxScale, renderTextSize);

            // Usual case is that we take the projected anchor and add the pixel-based shift
            // calculated above. In the (somewhat weird) case of pitch-aligned text, we add an equivalent
            // tile-unit based shift to the anchor before projecting to the label plane.
            const shiftedAnchor = pitchWithMap ?
                symbolProjection.project(tileAnchor.add(shift), labelPlaneMatrix).point :
                projectedAnchor.point.add(rotateWithMap ?
                    shift.rotate(-transform.angle) :
                    shift);

            for (let g = 0; g < symbol.numGlyphs; g++) {
                addDynamicAttributes(dynamicLayoutVertexArray, shiftedAnchor, 0);
            }
        }
    }
    bucket.text.dynamicLayoutVertexBuffer.updateData(dynamicLayoutVertexArray);
}

function drawLayerSymbols(painter, sourceCache, layer, coords, isText, translate, translateAnchor,
                          rotationAlignment, pitchAlignment, keepUpright, stencilMode, colorMode, variableOffsets) {

    const context = painter.context;
    const gl = context.gl;
    const tr = painter.transform;

    const rotateWithMap = rotationAlignment === 'map';
    const pitchWithMap = pitchAlignment === 'map';
    const alongLine = rotateWithMap && layer.layout.get('symbol-placement') !== 'point';
    // Line label rotation happens in `updateLineLabels`
    // Pitched point labels are automatically rotated by the labelPlaneMatrix projection
    // Unpitched point labels need to have their rotation applied after projection
    const rotateInShader = rotateWithMap && !pitchWithMap && !alongLine;

    const sortFeaturesByKey = layer.layout.get('symbol-sort-key').constantOr(1) !== undefined;

    const depthMode = painter.depthModeForSublayer(0, DepthMode.ReadOnly);

    let program;
    let size;
    const variablePlacement = layer.layout.get('text-variable-anchor');

    const tileRenderState: Array<SymbolTileRenderState> = [];

    for (const coord of coords) {
        const tile = sourceCache.getTile(coord);
        const bucket: SymbolBucket = (tile.getBucket(layer): any);
        if (!bucket) continue;
        const buffers = isText ? bucket.text : bucket.icon;
        if (!buffers || !buffers.segments.get().length) continue;
        const programConfiguration = buffers.programConfigurations.get(layer.id);

        const isSDF = isText || bucket.sdfIcons;

        const sizeData = isText ? bucket.textSizeData : bucket.iconSizeData;

        if (!program) {
            program = painter.useProgram(isSDF ? 'symbolSDF' : 'symbolIcon', programConfiguration);
            size = symbolSize.evaluateSizeForZoom(sizeData, tr.zoom, symbolLayoutProperties.properties[isText ? 'text-size' : 'icon-size']);
        }

        context.activeTexture.set(gl.TEXTURE0);

        let texSize: [number, number];
        let atlasTexture;
        let atlasInterpolation;
        if (isText) {
            atlasTexture = tile.glyphAtlasTexture;
            atlasInterpolation = gl.LINEAR;
            texSize = tile.glyphAtlasTexture.size;

        } else {
            const iconScaled = layer.layout.get('icon-size').constantOr(0) !== 1 || bucket.iconsNeedLinear;
            const iconTransformed = pitchWithMap || tr.pitch !== 0;

            atlasTexture = tile.imageAtlasTexture;
            atlasInterpolation = isSDF || painter.options.rotating || painter.options.zooming || iconScaled || iconTransformed ?
                gl.LINEAR :
                gl.NEAREST;
            texSize = tile.imageAtlasTexture.size;
        }

        const s = pixelsToTileUnits(tile, 1, painter.transform.zoom);
        const labelPlaneMatrix = symbolProjection.getLabelPlaneMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);
        const glCoordMatrix = symbolProjection.getGlCoordMatrix(coord.posMatrix, pitchWithMap, rotateWithMap, painter.transform, s);

        if (alongLine) {
            symbolProjection.updateLineLabels(bucket, coord.posMatrix, painter, isText, labelPlaneMatrix, glCoordMatrix, pitchWithMap, keepUpright);
        } else if (isText && size && variablePlacement) {
            const tileScale = Math.pow(2, tr.zoom - tile.tileID.overscaledZ);
            updateVariableAnchors(bucket, rotateWithMap, pitchWithMap, variableOffsets, symbolSize,
                                  tr, labelPlaneMatrix, coord.posMatrix, tileScale, size);
        }

        const matrix = painter.translatePosMatrix(coord.posMatrix, tile, translate, translateAnchor),
            uLabelPlaneMatrix = (alongLine || (isText && variablePlacement)) ? identityMat4 : labelPlaneMatrix,
            uglCoordMatrix = painter.translatePosMatrix(glCoordMatrix, tile, translate, translateAnchor, true);

        const hasHalo = isSDF && layer.paint.get(isText ? 'text-halo-width' : 'icon-halo-width').constantOr(1) !== 0;

        let uniformValues;
        if (isSDF) {
            uniformValues = symbolSDFUniformValues(sizeData.functionType,
                size, rotateInShader, pitchWithMap, painter, matrix,
                uLabelPlaneMatrix, uglCoordMatrix, isText, texSize, true);

        } else {
            uniformValues = symbolIconUniformValues(sizeData.functionType,
                size, rotateInShader, pitchWithMap, painter, matrix,
                uLabelPlaneMatrix, uglCoordMatrix, isText, texSize);
        }

        const state = {
            program,
            buffers,
            uniformValues,
            atlasTexture,
            atlasInterpolation,
            isSDF,
            hasHalo
        };

        if (sortFeaturesByKey) {
            const oldSegments = buffers.segments.get();
            for (const segment of oldSegments) {
                tileRenderState.push({
                    segments: new SegmentVector([segment]),
                    sortKey: ((segment.sortKey: any): number),
                    state
                });
            }
        } else {
            tileRenderState.push({
                segments: buffers.segments,
                sortKey: 0,
                state
            });
        }
    }

    if (sortFeaturesByKey) {
        tileRenderState.sort((a, b) => a.sortKey - b.sortKey);
    }

    for (const segmentState of tileRenderState) {
        const state = segmentState.state;

        state.atlasTexture.bind(state.atlasInterpolation, gl.CLAMP_TO_EDGE);

        if (state.isSDF) {
            const uniformValues = ((state.uniformValues: any): UniformValues<SymbolSDFUniformsType>);
            if (state.hasHalo) {
                uniformValues['u_is_halo'] = 1;
                drawSymbolElements(state.buffers, segmentState.segments, layer, painter, state.program, depthMode, stencilMode, colorMode, uniformValues);
            }
            uniformValues['u_is_halo'] = 0;
        }
        drawSymbolElements(state.buffers, segmentState.segments, layer, painter, state.program, depthMode, stencilMode, colorMode, state.uniformValues);
    }
}

function drawSymbolElements(buffers, segments, layer, painter, program, depthMode, stencilMode, colorMode, uniformValues) {
    const context = painter.context;
    const gl = context.gl;
    program.draw(context, gl.TRIANGLES, depthMode, stencilMode, colorMode, CullFaceMode.disabled,
        uniformValues, layer.id, buffers.layoutVertexBuffer,
        buffers.indexBuffer, segments, layer.paint,
        painter.transform.zoom, buffers.programConfigurations.get(layer.id),
        buffers.dynamicLayoutVertexBuffer, buffers.opacityVertexBuffer);
}
