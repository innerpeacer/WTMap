// @flow

import {patternUniformValues} from './pattern';
import {
    Uniform1i,
    Uniform1f,
    Uniform2f,
    Uniform3f,
    Uniform4f,
    UniformMatrix4f
} from '../uniform_binding';

import pixelsToTileUnits from '../../source/pixels_to_tile_units';
import {mat3, vec3, mat4} from 'gl-matrix';
import {extend} from '../../util/util';
import browser from '../../util/browser';

// From ipline

const ipfillExtrusionOutlineUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_ratio': new Uniform1f(context, locations.u_ratio),
    'u_gl_units_to_pixels': new Uniform2f(context, locations.u_gl_units_to_pixels)
});

const ipfillExtrusionOutlineGradientUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_ratio': new Uniform1f(context, locations.u_ratio),
    'u_gl_units_to_pixels': new Uniform2f(context, locations.u_gl_units_to_pixels),
    'u_image': new Uniform1i(context, locations.u_image)
});

const ipfillExtrusionOutlinePatternUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_texsize': new Uniform2f(context, locations.u_texsize),
    'u_ratio': new Uniform1f(context, locations.u_ratio),
    'u_image': new Uniform1i(context, locations.u_image),
    'u_gl_units_to_pixels': new Uniform2f(context, locations.u_gl_units_to_pixels),
    'u_scale': new Uniform4f(context, locations.u_scale),
    'u_fade': new Uniform1f(context, locations.u_fade)
});

const ipfillExtrusionOutlineSDFUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_ratio': new Uniform1f(context, locations.u_ratio),
    'u_gl_units_to_pixels': new Uniform2f(context, locations.u_gl_units_to_pixels),
    'u_patternscale_a': new Uniform2f(context, locations.u_patternscale_a),
    'u_patternscale_b': new Uniform2f(context, locations.u_patternscale_b),
    'u_sdfgamma': new Uniform1f(context, locations.u_sdfgamma),
    'u_image': new Uniform1i(context, locations.u_image),
    'u_tex_y_a': new Uniform1f(context, locations.u_tex_y_a),
    'u_tex_y_b': new Uniform1f(context, locations.u_tex_y_b),
    'u_mix': new Uniform1f(context, locations.u_mix)
});

const ipfillExtrusionOutlineUniformValues = (painter, tile, layer) => {
    // console.log("ipfill_extrusion_program.ipfillExtrusionOutlineUniformValues");
    const transform = painter.transform;

    return {
        'u_matrix': calculateMatrix(painter, tile, layer),
        'u_ratio': 1 / pixelsToTileUnits(tile, 1, transform.zoom),
        'u_gl_units_to_pixels': [
            1 / transform.pixelsToGLUnits[0],
            1 / transform.pixelsToGLUnits[1]
        ]
    };
};


const ipfillExtrusionOutlineGradientUniformValues = (painter, tile, layer) => {
    // console.log("ipfill_extrusion_program.ipfillExtrusionOutlineGradientUniformValues");
    return extend(iplineUniformValues(painter, tile, layer), {
        'u_image': 0
    });
};

const ipfillExtrusionOutlinePatternUniformValues = (painter, tile, layer, crossfade) => {
    // console.log("ipfill_extrusion_program.ipfillExtrusionOutlinePatternUniformValues");
    const transform = painter.transform;
    const tileZoomRatio = calculateTileRatio(tile, transform);
    return {
        'u_matrix': calculateMatrix(painter, tile, layer),
        'u_texsize': tile.imageAtlasTexture.size,
        // camera zoom ratio
        'u_ratio': 1 / pixelsToTileUnits(tile, 1, transform.zoom),
        'u_image': 0,
        // this assumes all images in the icon atlas texture have the same pixel ratio
        'u_scale': [browser.devicePixelRatio, tileZoomRatio, crossfade.fromScale, crossfade.toScale],
        'u_fade': crossfade.t,
        'u_gl_units_to_pixels': [
            1 / transform.pixelsToGLUnits[0],
            1 / transform.pixelsToGLUnits[1]
        ]
    };
};

const ipfillExtrusionOutlineSDFUniformValues = (painter, tile, layer, dasharray, crossfade) => {
    // console.log("ipfill_extrusion_program.ipfillExtrusionOutlineSDFUniformValues");
    const transform = painter.transform;
    const lineAtlas = painter.lineAtlas;
    const tileRatio = calculateTileRatio(tile, transform);

    const round = layer.layout.get('ipfill-extrusion-outline-cap') === 'round';

    const posA = lineAtlas.getDash(dasharray.from, round);
    const posB = lineAtlas.getDash(dasharray.to, round);

    const widthA = posA.width * crossfade.fromScale;
    const widthB = posB.width * crossfade.toScale;

    return extend(lineUniformValues(painter, tile, layer), {
        'u_patternscale_a': [tileRatio / widthA, -posA.height / 2],
        'u_patternscale_b': [tileRatio / widthB, -posB.height / 2],
        'u_sdfgamma': lineAtlas.width / (Math.min(widthA, widthB) * 256 * browser.devicePixelRatio) / 2,
        'u_image': 0,
        'u_tex_y_a': posA.y,
        'u_tex_y_b': posB.y,
        'u_mix': crossfade.t
    });
};

function calculateTileRatio(tile: Tile, transform: Transform) {
    return 1 / pixelsToTileUnits(tile, 1, transform.tileZoom);
}

function calculateMatrix(painter, tile, layer) {
    return painter.translatePosMatrix(
        tile.tileID.posMatrix,
        tile,
        layer.paint.get('ipfill-extrusion-outline-translate'),
        layer.paint.get('ipfill-extrusion-outline-translate-anchor')
    );
}
// From ipline


const ipfillExtrusionUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_lightpos': new Uniform3f(context, locations.u_lightpos),
    'u_lightintensity': new Uniform1f(context, locations.u_lightintensity),
    'u_lightcolor': new Uniform3f(context, locations.u_lightcolor)
});

const ipfillExtrusionPatternUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_lightpos': new Uniform3f(context, locations.u_lightpos),
    'u_lightintensity': new Uniform1f(context, locations.u_lightintensity),
    'u_lightcolor': new Uniform3f(context, locations.u_lightcolor),
    'u_height_factor': new Uniform1f(context, locations.u_height_factor),
    // pattern uniforms
    'u_image': new Uniform1i(context, locations.u_image),
    'u_texsize': new Uniform2f(context, locations.u_texsize),
    'u_pixel_coord_upper': new Uniform2f(context, locations.u_pixel_coord_upper),
    'u_pixel_coord_lower': new Uniform2f(context, locations.u_pixel_coord_lower),
    'u_scale': new Uniform4f(context, locations.u_scale),
    'u_fade': new Uniform1f(context, locations.u_fade)
});

const ipextrusionTextureUniforms = (context, locations) => ({
    'u_matrix': new UniformMatrix4f(context, locations.u_matrix),
    'u_world': new Uniform2f(context, locations.u_world),
    'u_image': new Uniform1i(context, locations.u_image),
    'u_opacity': new Uniform1f(context, locations.u_opacity)
});

const ipfillExtrusionUniformValues = (matrix, painter) => {
    const light = painter.style.light;
    const _lp = light.properties.get('position');
    const lightPos = [_lp.x, _lp.y, _lp.z];
    const lightMat = mat3.create();
    if (light.properties.get('anchor') === 'viewport') {
        mat3.fromRotation(lightMat, -painter.transform.angle);
    }
    vec3.transformMat3(lightPos, lightPos, lightMat);

    const lightColor = light.properties.get('color');

    return {
        'u_matrix': matrix,
        'u_lightpos': lightPos,
        'u_lightintensity': light.properties.get('intensity'),
        'u_lightcolor': [lightColor.r, lightColor.g, lightColor.b]
    };
};

const ipfillExtrusionPatternUniformValues = (matrix, painter, coord, crossfade, tile) => {
    return extend(fillExtrusionUniformValues(matrix, painter), patternUniformValues(crossfade, painter, tile), {
            'u_height_factor': -Math.pow(2, coord.overscaledZ) / tile.tileSize / 8
        });
};

const ipextrusionTextureUniformValues = (painter, layer, textureUnit) => {
    const matrix = mat4.create();
    mat4.ortho(matrix, 0, painter.width, painter.height, 0, 0, 1);

    const gl = painter.context.gl;

    return {
        'u_matrix': matrix,
        'u_world': [gl.drawingBufferWidth, gl.drawingBufferHeight],
        'u_image': textureUnit,
        'u_opacity': layer.paint.get('ipfill-extrusion-opacity')
    };
};

export {
    ipfillExtrusionUniforms,
    ipfillExtrusionPatternUniforms,
    ipextrusionTextureUniforms,
    ipfillExtrusionUniformValues,
    ipfillExtrusionPatternUniformValues,
    ipextrusionTextureUniformValues,

    // From iplineiplineUniforms,
    ipfillExtrusionOutlineUniforms,
    ipfillExtrusionOutlineGradientUniforms,
    ipfillExtrusionOutlinePatternUniforms,
    ipfillExtrusionOutlineSDFUniforms,
    ipfillExtrusionOutlineUniformValues,
    ipfillExtrusionOutlineGradientUniformValues,
    ipfillExtrusionOutlinePatternUniformValues,
    ipfillExtrusionOutlineSDFUniformValues
};
