// @flow
import {unit_base_layer} from './unit_base_layer';
import {extend, clone} from '../../../dependencies';

const DefaultFillLayer = {
    'layout': {},
    'paint': {},
    'filter': false
};

class unit_fill_layer extends unit_base_layer {
    constructor(props: Object) {
        super(props);

        this.layer = extend(clone(DefaultFillLayer), this.layer);
        this.setPaintProperties({
            'fill-color': this.symbol.fillColor,
            'fill-opacity': this.symbol.fillOpacity
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

export {unit_fill_layer};
