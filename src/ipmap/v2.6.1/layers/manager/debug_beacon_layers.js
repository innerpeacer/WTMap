import {geojson_utils as GeojsonUtils} from '../../../dependencies';
import {unit_beacon_cirle_layer} from '../functional/debug_beacon/unit_beacon_cirle_layer';
import {unit_beacon_symbol_layer} from '../functional/debug_beacon/unit_beacon_symbol_layer';

class debug_beacon_layers {
    constructor() {
        this.name = 'debug-beacon';

        // ============ Locating Beacon ============
        this.debugBeaconSourceID = `${this.name}-source`;
        this.debugBeaconSource = GeojsonUtils.emptySource;

        this.debugBeaconCircleLayer = new unit_beacon_cirle_layer({
            name: this.name,
            sourceID: this.debugBeaconSourceID
        }).asBeaconLayer();

        this.debugBeaconSymbolLayer = new unit_beacon_symbol_layer({
            name: this.name,
            sourceID: this.debugBeaconSourceID
        }).asBeaconLayer();

        // ============ Debug Signal ============
        this.signalName = `${this.name}-signal`;
        this.debugBeaconSignalSourceID = `${this.signalName}-source`;
        this.debugBeaconSignalSource = GeojsonUtils.emptySource;

        this.debugBeaconFocusSignalCircleLayer = new unit_beacon_cirle_layer({
            name: `${this.signalName}-focus`,
            sourceID: this.debugBeaconSignalSourceID
        }).asFocusSignalLayer();

        this.debugBeaconOffFocusSignalCircleLayer = new unit_beacon_cirle_layer({
            name: `${this.signalName}-off-focus`,
            sourceID: this.debugBeaconSignalSourceID
        }).asOffFocusSignalLayer();

        this.debugBeaconFocusSignalSymbolLayer = new unit_beacon_symbol_layer({
            name: `${this.signalName}-focus`,
            sourceID: this.debugBeaconSignalSourceID
        }).asFocusSignalLayer();

        this.debugBeaconOffFocusSignalSymbolLayer = new unit_beacon_symbol_layer({
            name: `${this.signalName}-off-focus`,
            sourceID: this.debugBeaconSignalSourceID
        }).asOffFocusSignalLayer();

        // ============ Debug Location ============
        this.locationName = `${this.name}-location`;
        this.debugLocationSourceID = `${this.locationName}-source`;
        this.debugLocationSource = GeojsonUtils.emptySource;

        this.debugLocationSymbolLayer = new unit_beacon_symbol_layer({
            name: this.locationName,
            sourceID: this.debugLocationSourceID
        }).asLocationLayer();

        this.sourceIDs = [this.debugBeaconSourceID, this.debugBeaconSignalSourceID, this.debugLocationSourceID];
        this.unitLayers = [this.debugBeaconCircleLayer, this.debugBeaconSymbolLayer,
            this.debugBeaconFocusSignalCircleLayer, this.debugBeaconOffFocusSignalCircleLayer, this.debugBeaconFocusSignalSymbolLayer, this.debugBeaconOffFocusSignalSymbolLayer, this.debugLocationSymbolLayer];
    }

    getSourceIDs() {
        return this.sourceIDs;
    }

    showDebugBeacons(map, data) {
        map.getSource(this.debugBeaconSourceID).setData(data);
    }

    showDebugSignals(map, data) {
        map.getSource(this.debugBeaconSignalSourceID).setData(data.debugData);
        map.getSource(this.debugLocationSourceID).setData(data.debugLocation);
    }

    setMapInfo(map, floor) {
        this.unitLayers.forEach((unitLayer) => {
            map.setFilter(unitLayer.layerID, unitLayer.createDefaultFilter(floor));
        });
    }
}

export {debug_beacon_layers};
