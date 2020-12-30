import {unit_functional_layer} from '../unit_functional_layer';
import {extend, clone} from '../../../../dependencies';

const DefaultBeaconCircleLayer = {
    'paint': {
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#888'
    }
};

class unit_beacon_cirle_layer extends unit_functional_layer {
    constructor(options) {
        super(options);

        this.layerType = 'circle';
        this.layerID = `${this.name}-${this.layerType}`;
        this.layer = extend(clone(DefaultBeaconCircleLayer), {
            id: this.layerID,
            type: this.layerType,
            source: this.sourceID
        });
    }

    asBeaconLayer() {
        this.asBeacon = true;
        this.setPaintProperties({
            'circle-radius': 2,
            'circle-color': '#3bb2d0'
        });
        return this;
    }

    asFocusSignalLayer() {
        this.asSignal = true;
        this.onFocus = true;
        this.setPaintProperties({
            'circle-radius': 3,
            'circle-color': '#ff00ff'
        });
        return this;
    }

    asOffFocusSignalLayer() {
        this.asSignal = true;
        this.onFocus = false;
        this.setPaintProperties({
            'circle-radius': 3,
            'circle-color': '#bd0026'
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

export {unit_beacon_cirle_layer};
