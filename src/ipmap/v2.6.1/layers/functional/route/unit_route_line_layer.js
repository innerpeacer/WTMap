// @flow
import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';
import {IPMap} from '../../../map/map';

const DefaultRouteLineLayer = {
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {}
};

class unit_route_line_layer extends unit_functional_layer {
    layerType: string;

    constructor(options: Object) {
        super(options);

        this.layerType = 'line';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultRouteLineLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }

    asBorder(): unit_route_line_layer {
        this.setPaintProperties({
            'line-color': '#ffffff',
            'line-width': 8
        });
        return this;
    }

    asLine(): unit_route_line_layer {
        this.setPaintProperties({
            'line-color': '#00ff00',
            'line-width': 6
        });
        return this;
    }

    asSegement(): unit_route_line_layer {
        this.setPaintProperties({
            'line-color': '#ff5959',
            'line-width': 6
        });
        return this;
    }

    asPassed(): unit_route_line_layer {
        this.setPaintProperties({
            'line-color': '#888888',
            'line-width': 8
        });
        return this;
    }

    updateLineColor(map: IPMap, color: any) {
        map.setPaintProperty(this.layerID, 'line-color', color);
    }
}

export {unit_route_line_layer};
