// @flow

import {fillExtrusionUniforms, fillExtrusionPatternUniforms, extrusionTextureUniforms} from './fill_extrusion_program';
import {
    ipfillExtrusionUniforms,
    ipfillExtrusionPatternUniforms,
    ipextrusionTextureUniforms,
    ipfillExtrusionOutlineUniforms
} from './ipfill_extrusion_program';
import {fillUniforms, fillPatternUniforms, fillOutlineUniforms, fillOutlinePatternUniforms} from './fill_program';
import {circleUniforms} from './circle_program';
import {collisionUniforms} from './collision_program';
import {debugUniforms} from './debug_program';
import {clippingMaskUniforms} from './clipping_mask_program';
import {heatmapUniforms, heatmapTextureUniforms} from './heatmap_program';
import {hillshadeUniforms, hillshadePrepareUniforms} from './hillshade_program';
import {lineUniforms, lineGradientUniforms, linePatternUniforms, lineSDFUniforms} from './line_program';
import {iplineUniforms, iplineGradientUniforms, iplinePatternUniforms, iplineSDFUniforms} from "./ipline_program"
import {rasterUniforms} from './raster_program';
import {symbolIconUniforms, symbolSDFUniforms} from './symbol_program';
import {backgroundUniforms, backgroundPatternUniforms} from './background_program';

export const programUniforms = {
    fillExtrusion: fillExtrusionUniforms,
    ipfillExtrusion: ipfillExtrusionUniforms,
    ipfillExtrusionOutline: ipfillExtrusionOutlineUniforms,
    fillExtrusionPattern: fillExtrusionPatternUniforms,
    extrusionTexture: extrusionTextureUniforms,
    fill: fillUniforms,
    fillPattern: fillPatternUniforms,
    fillOutline: fillOutlineUniforms,
    fillOutlinePattern: fillOutlinePatternUniforms,
    circle: circleUniforms,
    collisionBox: collisionUniforms,
    collisionCircle: collisionUniforms,
    debug: debugUniforms,
    clippingMask: clippingMaskUniforms,
    heatmap: heatmapUniforms,
    heatmapTexture: heatmapTextureUniforms,
    hillshade: hillshadeUniforms,
    hillshadePrepare: hillshadePrepareUniforms,
    line: lineUniforms,
    ipline: iplineUniforms,
    lineGradient: lineGradientUniforms,
    linePattern: linePatternUniforms,
    lineSDF: lineSDFUniforms,
    raster: rasterUniforms,
    symbolIcon: symbolIconUniforms,
    symbolSDF: symbolSDFUniforms,
    background: backgroundUniforms,
    backgroundPattern: backgroundPatternUniforms
};
