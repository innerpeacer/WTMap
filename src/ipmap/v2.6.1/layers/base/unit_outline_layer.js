// @flow
import {unit_base_layer} from './unit_base_layer';
import {extend, clone} from '../../../dependencies';

const DefaultOutlineLayer = {
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {},
    'filter': false
};

class unit_outline_layer extends unit_base_layer {
    constructor(props: Object) {
        super(props);

        let symbol = this.symbol;
        this.layer = extend(clone(DefaultOutlineLayer), this.layer);
        this.layer.id = this.layerID = `${this.name}-outline-${this.symbol.UID}`;
        this.layer.type = 'line';
        this.setPaintProperties({
            'line-color': symbol.outlineColor,
            'line-opacity': symbol.outlineOpacity,
            'line-width': symbol.outlineWidth
        });
    }

    createDefaultFilter(floor: number): any {
        return [
            'all',
            ['==', 'floor', floor || 0],
            ['==', 'layer', this.layerNumber || 0],
            ['==', 'symbolID', this.symbol.symbolID || -1]
        ];
    }
}

export {unit_outline_layer};
