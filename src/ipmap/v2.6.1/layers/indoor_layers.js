import {indoor_layergroup_multi_stop_route as MultiStopRouteLayer} from './indoor_layergroup_multi_stop_route';
import {indoor_layer_location as LocationLayer} from './indoor_layer_location';
import {indoor_layergroup_debug_beacon as DebugBeaconLayer} from './debug_layers/indoor_layergroup_debug_beacon';

class indoor_layers {
    constructor(map, use3D) {
        this._map = map;
        this._baseLayerArray = [];
        this._3dLayerArray = [];
        this._labelIconLayerArray = [];
        this._locationLayerArray = [];

        this._use3D = use3D;
        // this._floorLayer = new FillLayer(map, 'floor', 1).addToMap();
        // this._baseLayerArray.push(this._floorLayer);
        //
        // this._roomLayer = new FillLayer(map, 'room', 2).addToMap();
        // this._baseLayerArray.push(this._roomLayer);
        //
        // this._assetLayer = new FillLayer(map, 'asset', 3).addToMap();
        // this._baseLayerArray.push(this._assetLayer);
        //
        // this._routeLayer = new MultiStopRouteLayer(map).addToMap();
        // this._baseLayerArray.push(this._routeLayer);
        //
        // this._extrusionLayer = new ExtrusionLayer(map, 'extrusion').addToMap();
        // this._baseLayerArray.push(this._extrusionLayer);
        // this._3dLayerArray.push(this._extrusionLayer);
        //
        // this._facilityLayer = new IconTextLayer(map, 'facility').addToMap();
        // this._baseLayerArray.push(this._facilityLayer);
        // this._3dLayerArray.push(this._facilityLayer);
        // this._labelIconLayerArray.push(this._facilityLayer);
        //
        // this._labelLayer = new IconTextLayer(map, 'label').addToMap();
        // this._baseLayerArray.push(this._labelLayer);
        // this._3dLayerArray.push(this._labelLayer);
        // this._labelIconLayerArray.push(this._labelLayer);
        //
        // this._map.moveLayer(this._routeLayer.routeStopObject.layerID);
        // this._map.moveLayer(this._routeLayer.routeStopObject.layerID2);
        //
        // let options = map._options;
        // this._debugBeacon = options._debugBeacon || false;
        // if (this._debugBeacon) {
        //     this._debugBeaconLayer = new DebugBeaconLayer(map, map._locator).addToMap();
        //     // this._debugBeaconLayer._setLocatingBeaconData(map._locator._biteMe('_getLocatingBeaconGeojson'));
        //     // this._debugBeaconLayer._moveLayer();
        //     this._baseLayerArray.push(this._debugBeaconLayer);
        // }
        //
        // this._locationLayer = new LocationLayer(map).addToMap();
        // this._baseLayerArray.push(this._locationLayer);
        // this._locationLayerArray.push(this._locationLayer);
        //
        // this._switch3D(this._use3D);
    }

    _updateLocator(locator) {
        if (locator && locator._isBleReady() && this._debugBeacon) {
            // this._debugBeaconLayer._setLocatingBeaconData(locator._biteMe('_getLocatingBeaconGeojson'));
        }
    }

    _updateDebugBeacon(data) {
        if (this._debugBeacon) {
            // this._debugBeaconLayer._setScannedBeaconData(data.debugData);
            // this._debugBeaconLayer._setLocationData(data.debugLocation);
        }
    }

    hideRoute() {
        // this._routeLayer.hideRoute();
    }

    showRoute(result, location, segment) {
        // this._routeLayer.showRoute(result, location, segment);
    }

    _setRouteColor(color1, color2, color3) {
        // this._routeLayer._setRouteColor(color1, color2, color3);
    }

    _showLocation(location) {
        // this._locationLayer._showLocation(location);
    }

    _showLocations(locations) {
        // this._locationLayer._showLocations(locations);
    }

    _hideLocation() {
        // this._locationLayer._hideLocation();
    }
}

export {indoor_layers};

