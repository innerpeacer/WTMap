import {clone} from '../utils/ip_util';

const default_style = {
    'version': 8,
    'name': 'WTMap',
    'sources': {},
    'sprite': '/WTMapResource/sprites/WTMapSprite',
    'glyphs': '/WTMapResource/glyphs/{fontstack}/{range}.pbf',
    'layers': [],
    'light': {
        'anchor': 'viewport',
        'color': 'white',
        'intensity': 0.2
    },
};

function getStyle(host, sprite, glyphs) {
    let style = clone(default_style);
    style.sprite = sprite ? sprite : (host + style.sprite);
    style.glyphs = glyphs ? glyphs : (host + style.glyphs);
    return style;
}

// module.exports = default_style;
export {getStyle}
