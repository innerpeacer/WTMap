let yOffsetMap = {
    "simhei": -12,
    "msyh": -17,
    "simsun": -12,
    "Kaiti": -12,
    "Fangsong": -12,
    // "STHUPO": -13,
    // "STXINWEI": -12,
    // "DFPHeiStd-W3": -12,
    // "AaPangYaer": -17,
};

class style_glyph_y_offset {

}

style_glyph_y_offset.getYOffset = function (fontStack) {
    for (let font in yOffsetMap) {
        if (fontStack && fontStack.indexOf(font) == 0) {
            return yOffsetMap[font];
        }
    }
    return -17;
};

export default style_glyph_y_offset;
