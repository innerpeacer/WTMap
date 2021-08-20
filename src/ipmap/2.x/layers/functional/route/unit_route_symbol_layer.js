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
    offFocus: boolean;

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
            'icon-ignore-placement': true,
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

    asFocusStartEnd(): unit_route_symbol_layer {
        let innerCase = ['match', ['get', 'categoryID'],
            '150012', 'icon_stair_normal',
            '150013', 'icon_elevator_normal',
            '150014', 'icon_escalator_normal',
            'switch'
        ];
        this.setLayoutProperties({
            'icon-image': ['match', ['get', 'type'],
                'start', 'start',
                'end', 'end',
                // ['to', 'from'], innerCase,
                'switch'
            ],
            'icon-anchor': 'bottom',
            'icon-rotation-alignment': 'viewport',
            'icon-size': 0.5
        });
        return this;
    }

    asOffFocusStartEnd(): unit_route_symbol_layer {
        this.offFocus = true;
        this.setLayoutProperties({
            'icon-image': ['case',
                ['==', ['get', 'type'], 'start'], 'start_gray',
                ['==', ['get', 'type'], 'end'], 'end_gray',
                ''
            ],
            'icon-anchor': 'bottom',
            'icon-rotation-alignment': 'viewport',
            'icon-size': 0.5
        });
        return this;
    }

    createDefaultFilter(floor: number): any {
        if (this.offFocus) {
            return ['all', ['!=', 'floor', floor]];
        }
        return super.createDefaultFilter(floor);
    }

}

export {unit_route_symbol_layer};
