import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';

const DefaultRouteLineLayer = {
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {}
};

class unit_route_line_layer extends unit_functional_layer {
    constructor(options) {
        super(options);

        this.layerType = 'line';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultRouteLineLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }

    asBorder() {
        this.setPaintProperties({
            'line-color': '#ffffff',
            'line-width': 8
        });
        return this;
    }

    asLine() {
        this.setPaintProperties({
            'line-color': '#00ff00',
            'line-width': 6
        });
        return this;
    }

    asSegement() {
        this.setPaintProperties({
            'line-color': '#ff5959',
            'line-width': 6
        });
        return this;
    }

    asPassed() {
        this.setPaintProperties({
            'line-color': '#888888',
            'line-width': 8
        });
        return this;
    }

    updateLineColor(map, color) {
        map.setPaintProperty(this.layerID, 'line-color', color);
    }
}

export {unit_route_line_layer};
