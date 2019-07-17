import IndoorGroupLayer from '../indoor_layer_base'
import {extend, clone} from '../../utils/ip_util'

let emptySource = {
    'type': 'geojson',
    'data': {'type': 'FeatureCollection', 'features': []}
};

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
        let locatingLayerName = 'locating_beacon';
        let locatingSourceID = locatingLayerName;
        this.locatingSourceID = locatingSourceID;
        this.map.addSource(locatingSourceID, emptySource);
        {
            let layerID = `${locatingLayerName}-circle`;
            let layer = {id: layerID, source: locatingSourceID};
            extend(layer, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 2;
            layer.paint['circle-color'] = '#3bb2d0';
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${locatingLayerName}-symbol`;
            let layer = {id: layerID, source: locatingSourceID};
            extend(layer, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#4169E1';
            layer.layout['text-field'] = ['get', 'minor'];
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }

        // ---------- scanned beacons ----------
        let scannedLayerName = 'scanned_beacon';
        let scannedSourceID = scannedLayerName;
        this.scannedSourceID = scannedSourceID;
        this.map.addSource(scannedSourceID, emptySource);

        // ---------- current floor beacons ----------
        {
            let layerID = `${scannedLayerName}-circle-1`;
            let layer = {id: layerID, source: scannedSourceID};
            extend(layer, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 3;
            layer.paint['circle-color'] = '#ff00ff';
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${scannedLayerName}-symbol-1`;
            let layer = {id: layerID, source: scannedSourceID};
            extend(layer, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#ff00ff';
            // layer.paint['text-color'] = '#ffff00';
            layer.layout['text-field'] = ['format',
                ['concat', ['get', 'minor']], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {},
            ];
            layer.layout['text-allow-overlap'] = true;
            this.styleLayers[layerID] = layer;
            this.currentFloorLayers[layerID] = layer;
        }

        // ---------- other floor beacons ----------
        {
            let layerID = `${scannedLayerName}-circle-2`;
            let layer = {id: layerID, source: scannedSourceID};
            extend(layer, clone(defaultCircleLayer));
            layer.paint['circle-radius'] = 3;
            layer.paint['circle-color'] = '#bd0026';
            this.styleLayers[layerID] = layer;
            this.otherFloorLayers[layerID] = layer;
        }
        {
            let layerID = `${scannedLayerName}-symbol-2`;
            let layer = {id: layerID, source: scannedSourceID};
            extend(layer, clone(defaultTextSymbolLayer));
            layer.paint['text-color'] = '#bd0026';
            layer.layout['text-field'] = ['format',
                ['concat', ['get', 'minor'], ' F(', ['get', 'floor'], ')'], {'font-scale': 1.2},
                '\n', {},
                ['concat', ['get', 'rssi'], 'dB ', ['get', 'accuracy'], 'm'], {},
            ];
            this.styleLayers[layerID] = layer;
            this.otherFloorLayers[layerID] = layer;
        }
    }

    _setLocatingBeaconData(data) {
        this.map.getSource(this.locatingSourceID).setData(data);
    }

    _setScannedBeaconData(data) {
        this.map.getSource(this.scannedSourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let currentFloorLayers = this.currentFloorLayers;
        for (let layerID in currentFloorLayers) {
            this.map.setFilter(layerID, ['all',
                ['==', 'floor', mapInfo.floorNumber]
            ]);
        }

        let otherFloorLayers = this.otherFloorLayers;
        for (let layerID in otherFloorLayers) {
            this.map.setFilter(layerID, ['all',
                ['!=', 'floor', mapInfo.floorNumber]
            ]);
        }
    }
}

export default indoor_layergroup_debug_beacon;
