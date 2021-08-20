// @flow
import {unit_functional_layer} from './unit_functional_layer';
import {extend, clone} from '../../../dependencies';

const DefaultLocationLayer = {
    'paint': {},
    'layout': {
        'icon-size': 1,
        'icon-rotate': ['get', 'angle'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true
    }
};

class unit_location_layer extends unit_functional_layer {
    layerType: string;
    layerID: string;
    layer: Object;

    constructor(options: Object) {
        super(options);

        this.layerType = 'symbol';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultLocationLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });

        this.setLayoutProperties({
            'icon-image': ['case', ['has', 'location-icon'], ['get', 'location-icon'], 'icon_location']
        });
    }
}

export {unit_location_layer};
