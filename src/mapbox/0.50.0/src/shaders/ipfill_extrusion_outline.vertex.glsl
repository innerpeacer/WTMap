#define ANTIALIASING 1.0 / DEVICE_PIXEL_RATIO / 2.0
#define scale 0.015873016

attribute vec4 a_pos_normal;
attribute vec4 a_data;

uniform mat4 u_matrix;
uniform mediump float u_ratio;
uniform vec2 u_gl_units_to_pixels;

varying vec2 v_normal;
varying vec2 v_width2;
varying float v_gamma_scale;
varying highp float v_linesofar;

#pragma mapbox: define highp vec4 outline_color
#pragma mapbox: define lowp float outline_blur
#pragma mapbox: define lowp float outline_opacity
#pragma mapbox: define mediump float outline_gap_width
#pragma mapbox: define lowp float outline_offset
#pragma mapbox: define mediump float outline_width
#pragma mapbox: define mediump float outline_height

void main() {
// This is ipfill_extrusion_outline.vertex.glsl
    #pragma mapbox: initialize highp vec4 outline_color
    #pragma mapbox: initialize lowp float outline_blur
    #pragma mapbox: initialize lowp float outline_opacity
    #pragma mapbox: initialize mediump float outline_gap_width
    #pragma mapbox: initialize lowp float outline_offset
    #pragma mapbox: initialize mediump float outline_width
    #pragma mapbox: initialize mediump float outline_height

    outline_height = max(0.0, outline_height) + 0.01;
//    outline_height = 10.0;

    vec2 a_extrude = a_data.xy - 128.0;
    float a_direction = mod(a_data.z, 4.0) - 1.0;

    v_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * 2.0;

    vec2 pos = a_pos_normal.xy;

    // x is 1 if it's a round cap, 0 otherwise
    // y is 1 if the normal points up, and -1 if it points down
    mediump vec2 normal = a_pos_normal.zw;
    v_normal = normal;

    // these transformations used to be applied in the JS and native code bases.
    // moved them into the shader for clarity and simplicity.
    outline_gap_width = outline_gap_width / 2.0;
    float halfwidth = outline_width / 2.0;
    outline_offset = -1.0 * outline_offset;

    float inset = outline_gap_width + (outline_gap_width > 0.0 ? ANTIALIASING : 0.0);
    float outset = outline_gap_width + halfwidth * (outline_gap_width > 0.0 ? 2.0 : 1.0) + (halfwidth == 0.0 ? 0.0 : ANTIALIASING);

    mediump vec2 dist = outset * a_extrude * scale;

    mediump float u = 0.5 * a_direction;
    mediump float t = 1.0 - abs(u);
    mediump vec2 offset2 = outline_offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);

    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);
//    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;
    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, outline_height, 1.0) + projected_extrude;

    // calculate how much the perspective view squishes or stretches the extrude
    float extrude_length_without_perspective = length(dist);
    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_gl_units_to_pixels);
    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;

    v_width2 = vec2(outset, inset);
}
