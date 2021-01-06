// @flow
import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';

const DefaultRouteSymbolLayer = {
    'paint': {
        'text-color': '#fff'
    },
    'layout': {
        'text-anchor': 'center',
        'text-padding': 0,
        'text-allow-overlap': true,
        'icon-allow-overlap': true,
        'icon-rotation-alignment': 'map'
    }
};

class unit_route_symbol_layer extends unit_functional_layer {
    layerType: string;

    constructor(options: Object) {
        super(options);

        this.layerType = 'symbol';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultRouteSymbolLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }

    asArrow(): unit_route_symbol_layer {
        this.setLayoutProperties({
            'icon-image': 'icon_route_arrow',
            'icon-size': 1,
            'icon-rotate': ['get', 'angle']
        });
        return this;
    }

    asStop(): unit_route_symbol_layer {
        this.setLayoutProperties({
            'text-field': ['get', 'NAME'],
            'text-font': ['simhei'],
            'text-size': 15
        });
        return this;
    }
}

export {unit_route_symbol_layer};
