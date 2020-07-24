import IndoorGroupLayer from '../indoor_layer_base'
import {extend, clone} from "../../../dependencies.js"

import {geojson_utils as GeojsonUtils} from '../../utils/geojson_utils';

let defaultCircleLayer = {
    'type': 'circle',
    'paint': {
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#888'
    }
};

let defaultTextSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
    },
    'layout': {
        'text-font': ['simhei'],
        'text-offset': [0, 0.3],
        'text-anchor': 'top',
        'text-max-width': 20,
        'text-size': 9,
    }
};

class indoor_layergroup_debug_beacon extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        // let subLayerName = 'debug_beacon';
        this.styleLayers = {};
        this.currentFloorLayers = {};
        this.otherFloorLayers = {};

        // ---------- locating beacons ----------
        let locatingBeaconLayerName = 'locating_beacon';
        let locatingBeaconSourceID = locatingBeaconLayerName;
        this.locatingBeaconSourceID = locatingBeaconSourceID;
        this.map.addSource(locatingBeaconSourceID, GeojsonUtils.emptySource);
        {
            let layerID = `${locatingBeaconLayerName}-circle`;
            let layer = extend({id: layerID, source: locatingBeaconSourceID}, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 2;
            layer.paint['circle-color'] = '#3bb2d0';
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${locatingBeaconLayerName}-symbol`;
            let layer = extend({id: layerID, source: locatingBeaconSourceID}, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#8B8682';
            layer.layout['text-field'] = ['get', 'minor'];
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }

        // ---------- scanned beacons ----------
        let scannedBeaconLayerName = 'scanned_beacon';
        let scannedBeaconSourceID = scannedBeaconLayerName;
        this.scannedBeaconSourceID = scannedBeaconSourceID;
        this.map.addSource(scannedBeaconSourceID, GeojsonUtils.emptySource);

        // ---------- current floor beacons ----------
        {
            let layerID = `${scannedBeaconLayerName}-circle-1`;
            let layer = extend({id: layerID, source: scannedBeaconSourceID}, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 3;
            layer.paint['circle-color'] = '#ff00ff';
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${scannedBeaconLayerName}-symbol-1`;
            let layer = extend({id: layerID, source: scannedBeaconSourceID}, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#ff00ff';
            layer.layout['text-field'] = ['format',
                ['concat', ['get', 'minor']], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'desc'], ' ', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {},
            ];
            layer.layout['text-allow-overlap'] = true;
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }

        // ---------- other floor beacons ----------
        {
            let layerID = `${scannedBeaconLayerName}-circle-2`;
            let layer = extend({id: layerID, source: scannedBeaconSourceID}, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 3;
            layer.paint['circle-color'] = '#bd0026';
            this.styleLayers[layerID] = layer;
            this.otherFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${scannedBeaconLayerName}-symbol-2`;
            let layer = extend({id: layerID, source: scannedBeaconSourceID}, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#bd0026';
            layer.layout['text-field'] = ['format',
                ['concat', ['get', 'minor'], ' F(', ['get', 'floor'], ')'], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'desc'], ' ', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {},
            ];
            this.styleLayers[layerID] = layer;
            this.otherFloorLayers[layerID] = layer;
        }

        // ---------- location result ----------
        let locationLayerName = 'debug_location';
        let locationSourceID = locationLayerName;
        this.locationSourceID = locationSourceID;
        this.map.addSource(locationSourceID, GeojsonUtils.emptySource);
        {
            // let layerID = `${locationLayerName}-circle`;
            // let layer = extend({id: layerID, source: locationSourceID}, clone(defaultCircleLayer));
            // layer.paint['circle-radius'] = 15;
            // layer.paint['circle-color'] = '#feb24c';
            // this.styleLayers[layerID] = layer;
            // this.currentFloorLayers[layerID] = layer;
        }

        {
            let layerID = `${locationLayerName}-symbol`;
            let layer = extend({id: layerID, source: locationSourceID}, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#253494';
            layer.layout['text-field'] = ['format',
                ['concat', ['get', 'maxRssi'], ' F(', ['get', 'floor'], ')'], {'font-scale': 1.2},
            ];
            layer.layout['text-field'] = ['format', ['get', 'text'], {'font-scale': 1.2}];
            layer.layout['text-offset'] = [0, 0.7];
            layer.layout['text-allow-overlap'] = true;
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }
    }

    _setLocationData(data) {
        if (data) this.map.getSource(this.locationSourceID).setData(data);
    }

    _setLocatingBeaconData(data) {
        if (data) this.map.getSource(this.locatingBeaconSourceID).setData(data);
    }

    _setScannedBeaconData(data) {
        if (data) this.map.getSource(this.scannedBeaconSourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let currentFloorLayers = this.currentFloorLayers;
        for (let layerID in currentFloorLayers) {
            if (currentFloorLayers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all',
                    ['==', 'floor', mapInfo.floorNumber]
                ]);
            }
        }

        let otherFloorLayers = this.otherFloorLayers;
        for (let layerID in otherFloorLayers) {
            if (otherFloorLayers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all',
                    ['!=', 'floor', mapInfo.floorNumber]
                ]);
            }
        }
    }
}

export default indoor_layergroup_debug_beacon;
