// @flow
import {unit_base_layer} from './unit_base_layer';
import {extend, clone} from '../../../dependencies';
import {IPMap} from '../../map/map';

const DefaultIPExtrusionLayer = {
    'layout': {
        'ipfill-extrusion-outline-join': 'round'
    },
    'paint': {
        'ipfill-extrusion-base': ['/', ['get', 'extrusion-base'], 10],
        'ipfill-extrusion-height': ['/', ['get', 'extrusion-height'], 10],
        'ipfill-extrusion-outline-height': ['/', ['get', 'extrusion-height'], 10]
    },
    'filter': false
};

class unit_extrusion_layer extends unit_base_layer {
    constructor(props: Object) {
        super(props);

        this.layer = extend(clone(DefaultIPExtrusionLayer), this.layer);
        let symbol = this.symbol;
        this.setLayoutProperties({
            'visibility': this.use3D ? 'visible' : 'none'
        });
        this.setPaintProperties({
            'ipfill-extrusion-color': symbol.fillColor,
            'ipfill-extrusion-opacity': symbol.fillOpacity,
            'ipfill-extrusion-outline-color': symbol.outlineColor,
            'ipfill-extrusion-outline-opacity': symbol.outlineOpacity,
            'ipfill-extrusion-outline-width': symbol.outlineWidth
        });
    }

    _switch3D(map: IPMap, use3D: boolean) {
        use3D ? this.show(map) : this.hide(map);
    }

    createDefaultFilter(floor: number): any {
        return ['all',
            ['has', 'extrusion'],
            ['==', 'extrusion', true],
            ['==', 'floor', floor || 0],
            ['==', 'symbolID', this.symbol.symbolID || -1]
        ];
    }
}

export {unit_extrusion_layer};
