#pragma mapbox: define highp vec4 outline_color
#pragma mapbox: define lowp float outline_blur
#pragma mapbox: define lowp float outline_opacity

varying vec2 v_width2;
varying vec2 v_normal;
varying float v_gamma_scale;

void main() {
    // This is ipfill_extrusion_outline.fragment.glsl
    #pragma mapbox: initialize highp vec4 outline_color
    #pragma mapbox: initialize lowp float outline_blur
    #pragma mapbox: initialize lowp float outline_opacity

    // Calculate the distance of the pixel from the line in pixels.
    float dist = length(v_normal) * v_width2.s;

    // Calculate the antialiasing fade factor. This is either when fading in
    // the line in case of an offset line (v_width2.t) or when fading out
    // (v_width2.s)
    float blur2 = (outline_blur + 1.0 / DEVICE_PIXEL_RATIO) * v_gamma_scale;
    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);

    gl_FragColor = outline_color * (alpha * outline_opacity);

#ifdef OVERDRAW_INSPECTOR
    gl_FragColor = vec4(1.0);
#endif
}
