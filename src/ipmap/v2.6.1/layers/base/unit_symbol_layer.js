// @flow
import {unit_base_layer} from './unit_base_layer';
import {extend, clone} from '../../../dependencies';
import type {IPMap} from '../../map/map';

const DefaultSymbolLayer = {
    'paint': {
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
    },
    'layout': {
        'symbol-z-order': 'source',
        'text-offset': [0.6, 0.1],
        'text-padding': 2
    },
    'filter': false
};

function _getHeight(use3D) {
    return use3D ? ['/', ['get', 'extrusion-height'], 10] : 0;
}

class unit_symbol_layer extends unit_base_layer {
    constructor(props: Object) {
        super(props);

        this.layer = extend(clone(DefaultSymbolLayer), this.layer);
        let symbol = this.symbol;

        let height = _getHeight(this.use3D);
        this.setPaintProperties({
            'symbol-height': height
        });

        if (symbol.iconVisible) {
            this.setLayoutProperties({
                'icon-image': ['concat', ['get', 'ICON'], '_normal'],
                'icon-anchor': 'bottom',
                'icon-size': symbol.iconSize
            });

            this.setPaintProperties({
                'icon-opacity': ['case', ['boolean', ['feature-state', 'hidden']], 0, 1]
            });
        }

        if (symbol.textVisible) {
            this.setPaintProperties({
                'text-color': symbol.textColor,
                'text-opacity': ['case', ['boolean', ['feature-state', 'hidden']], 0, 1]
            });
            this.setLayoutProperties({
                'text-field': ['get', 'NAME'],
                'text-font': [`${symbol.textFont}-${this.buildingID}`],
                'text-size': symbol.textSize
            });

            if (symbol.iconVisible) {
                this.setLayoutProperties({
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'icon-anchor': 'bottom',
                    'text-radial-offset': 0.9,
                    'text-justify': 'auto'
                });
                this.setPaintProperties({
                    'text-translate': [0, -12],
                    'text-translate-anchor': 'viewport'
                });
            } else {
                this.setLayoutProperties({
                    'text-anchor': 'center',
                    'text-offset': [symbol.textOffsetX, symbol.textOffsetY]
                });
            }
        }

        if (symbol.otherLayout) {
            this.setLayoutProperties(symbol.otherLayout);
        }

        if (symbol.otherPaint) {
            this.setPaintProperties(symbol.otherPaint);
        }
    }

    _switch3D(map: IPMap, use3D: boolean) {
        map.setPaintProperty(this.layerID, 'symbol-height', _getHeight(use3D));
    }

    setFont(map: IPMap, fontName: string) {
        map.setLayoutProperty(this.layerID, 'text-font', [`${fontName}-${this.buildingID}`]);
    }

    switchLanguage(map: IPMap, options: Object) {
        if (!options || !options.lang) return;
        if (this.symbol.textVisible) {
            if (options.lang === 'cn') {
                map.setLayoutProperty(this.layerID, 'text-field', ['get', 'NAME']);
            } else if (options.lang === 'en') {
                map.setLayoutProperty(this.layerID, 'text-field', ['get', 'NAME_EN']);
            } else if (options.lang === 'other') {
                map.setLayoutProperty(this.layerID, 'text-field', ['get', 'NAME_OTHER']);
            }
        }
    }

    createDefaultFilter(floor: number): any {
        return [
            'all',
            ['==', 'floor', floor || 0],
            ['==', 'symbolID', this.symbol.symbolID || -1]
        ];
    }

}

export {unit_symbol_layer};
