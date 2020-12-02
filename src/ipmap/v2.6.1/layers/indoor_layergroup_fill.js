import IndoorGroupLayer from './indoor_layer_base';
import {extend, clone} from '../../dependencies.js';

let defaultFillLayer = {
    'type': 'fill',
    'source-layer': 'fill',
    'layout': {},
    'paint': {},
    'filter': ['all']
};

let defaultOutlineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {},
    'filter': ['all']
};

let testOutlineLayer = {
    'type': 'ipline',
    'layout': {
        'ipline-join': 'round',
        'ipline-cap': 'round'
    },
    'paint': {
        'ipline-color': 'green',
        'ipline-height': ['/', ['get', 'extrusion-height'], 10],
        'ipline-width': 1
    },
    'filter': ['all']
};

class indoor_layergroup_fill extends IndoorGroupLayer {
    constructor(map, name, layerNumber) {
        super(map);

        this._layerNumber = layerNumber;
        let subLayerName = name;
        this.styleLayers = {};

        let baseZoom = map.getBaseZoom();

        let symbolIDArray = map._layerSymbolMap[subLayerName];
        let _fillArray = {};
        let _outlineArray = {};
        for (let i = 0; i < symbolIDArray.length; ++i) {
            let symbolID = symbolIDArray[i];
            let symbol = map._fillSymbolMap[symbolID];
            if (!symbol) continue;
            if (!symbol.visible) continue;

            let layerID = `${subLayerName}-fill-${symbolID}`;
            let layer = extend({
                'id': layerID,
                'symbolID': symbolID,
                'source': this.sourceID,
                'source-layer': 'fill'
            }, clone(defaultFillLayer));
            layer.paint['fill-color'] = symbol.fillColor;
            layer.paint['fill-opacity'] = symbol.fillOpacity;

            let outlineLayerID = `${subLayerName}-outline-${symbolID}`;
            let outlineLayer = extend({
                'id': outlineLayerID,
                'symbolID': symbolID,
                'source': this.sourceID,
                'source-layer': 'fill'
            }, clone(defaultOutlineLayer));
            outlineLayer.paint['line-color'] = symbol.outlineColor;
            outlineLayer.paint['line-opacity'] = symbol.outlineOpacity;
            outlineLayer.paint['line-width'] = symbol.outlineWidth;

            let testIpLine = true;
            testIpLine = false;
            if (testIpLine) {
                outlineLayer = extend({
                    'id': outlineLayerID,
                    'symbolID': symbolID,
                    'source': this.sourceID,
                    'source-layer': 'fill'
                }, clone(testOutlineLayer));
                outlineLayer.paint['ipline-opacity'] = symbol.outlineOpacity;
            }

            let levelMin = symbol.levelMin;
            if (levelMin && levelMin !== 0) {
                layer.minzoom = baseZoom + levelMin;
                outlineLayer.minzoom = baseZoom + levelMin;
            }
            let levelMax = symbol.levelMax;
            if (levelMax && levelMax !== 0) {
                layer.maxzoom = baseZoom + levelMax;
                outlineLayer.maxzoom = baseZoom + levelMax;
            }

            _fillArray[layerID] = layer;
            _outlineArray[outlineLayerID] = outlineLayer;
        }

        for (let layerID in _fillArray) {
            if (_fillArray.hasOwnProperty(layerID)) {
                this.styleLayers[layerID] = _fillArray[layerID];
            }
        }

        for (let layerID in _outlineArray) {
            if (_outlineArray.hasOwnProperty(layerID)) {
                this.styleLayers[layerID] = _outlineArray[layerID];
            }
        }

        // console.log(subLayerName + ' Layer: ' + symbolIDArray.length);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all',
                    ['==', 'floor', mapInfo.floorNumber],
                    ['==', 'layer', this._layerNumber],
                    ['==', 'symbolID', layers[layerID].symbolID]
                ]);
            }
        }
    }
}

export default indoor_layergroup_fill;
