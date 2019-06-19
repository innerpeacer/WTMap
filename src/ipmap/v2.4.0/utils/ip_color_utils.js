function parseColor(color) {
    return `#${color.substr(3, 6)}`;
}

function parseOpacity(color) {
    return parseInt(color.substr(1, 2), 16) / 255.0;
}

class ip_color_utils {

}

ip_color_utils.parseColor = parseColor;
ip_color_utils.parseOpacity = parseOpacity;

export default ip_color_utils;