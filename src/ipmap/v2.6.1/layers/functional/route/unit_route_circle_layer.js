// @flow
import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';

const DefaultRouteCircleLayer = {
    'paint': {
        'circle-radius': 10,
        'circle-color': ['get', 'color'],
        'circle-opacity': 1.0,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
    }
};

class unit_route_circle_layer extends unit_functional_layer {
    layerType: string;

    constructor(options: Object) {
        super(options);

        this.layerType = 'circle';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultRouteCircleLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }
}

export {unit_route_circle_layer};
