// @flow
import {clone} from '../../dependencies.js';

const default_style = {
    'version': 8,
    'name': 'WTMap',
    'sources': {},
    'layers': [],
    'light': {
        'anchor': 'viewport',
        'color': 'white',
        'intensity': 0.2
    }
};

function getStyle(host: string, resourceRoot: string, spriteName: string): string {
    let style = clone(default_style);
    style.sprite = `${host}/${resourceRoot}/sprites/${spriteName}`;
    style.glyphs = `${host}/${resourceRoot}/glyphs/{fontstack}/{range}.pbf`;
    return style;
}

function getSpritePath(host: string, resourceRoot: string, spriteName: string): string {
    return `${host}/${resourceRoot}/sprites/${spriteName}`;
}

// module.exports = default_style;
export {getStyle, getSpritePath};
