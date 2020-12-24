import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';

const DefaultBeaconSymbolLayer = {
    'paint': {
        'text-halo-color': '#ffffff'
    },
    'layout': {
        'text-font': ['simhei'],
        'text-offset': [0, 0.3],
        'text-anchor': 'top',
        'text-max-width': 20,
        'text-size': 9
    }
};

class unit_beacon_symbol_layer extends unit_functional_layer {
    constructor(options) {
        super(options);

        this.layerType = 'symbol';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultBeaconSymbolLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }

    asBeaconLayer() {
        this.asBeacon = true;
        this.setPaintProperties({
            'text-color': '#8B8682'
        });
        this.setLayoutProperties({
            'text-field': ['get', 'minor']
        });
        return this;
    }

    asFocusSignalLayer() {
        this.asSignal = true;
        this.onFocus = true;
        this.setPaintProperties({
            'text-color': '#ff00ff'
        });
        this.setLayoutProperties({
            'text-field': ['format',
                ['concat', ['get', 'minor']], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'desc'], ' ', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {}
            ],
            'text-allow-overlap': true
        });
        return this;
    }

    asOffFocusSignalLayer() {
        this.asSignal = true;
        this.onFocus = false;
        this.setPaintProperties({
            'text-color': '#bd0026'
        });
        this.setLayoutProperties({
            'text-field': ['format',
                ['concat', ['get', 'minor'], ' F(', ['get', 'floor'], ')'], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'desc'], ' ', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {}
            ]
        });
        return this;
    }

    asLocationLayer() {
        this.asLocation = true;
        this.setPaintProperties({
            'text-color': '#253494'
        });
        this.setLayoutProperties({
            'text-field': ['format', ['get', 'text'], {'font-scale': 1.2}],
            'text-offset': [0, 0.7],
            'text-allow-overlap': true
        });
        return this;
    }

    createDefaultFilter(floor) {
        if (this.asSignal && !this.onFocus) {
            return ['all', ['!=', 'floor', floor]];
        }
        return super.createDefaultFilter(floor);
    }
}

export {unit_beacon_symbol_layer};
