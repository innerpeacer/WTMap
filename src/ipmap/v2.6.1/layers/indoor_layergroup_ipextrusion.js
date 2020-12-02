import {indoor_layer_base as IndoorGroupLayer} from './indoor_layer_base';
import {extend, clone} from '../../dependencies.js';

let defaultExtrusionLayer = {
    'type': 'fill-extrusion',
    'paint': {
        'fill-extrusion-base': ['/', ['get', 'extrusion-base'], 10],
        'fill-extrusion-height': ['/', ['get', 'extrusion-height'], 10]
    },
    'filter': ['all',
        ['has', 'extrusion'],
        ['==', 'extrusion', true]
    ]
};

let defaultIPExtrusionLayer = {
    'type': 'ipfill-extrusion',
    'layout': {
        'ipfill-extrusion-outline-join': 'round'
    },
    'paint': {
        'ipfill-extrusion-base': ['/', ['get', 'extrusion-base'], 10],
        'ipfill-extrusion-height': ['/', ['get', 'extrusion-height'], 10],
        'ipfill-extrusion-outline-height': ['/', ['get', 'extrusion-height'], 10]
    },
    'filter': ['all',
        ['has', 'extrusion'],
        ['==', 'extrusion', true]
    ]
};

class indoor_layergroup_ipextrusion extends IndoorGroupLayer {
    constructor(map, name) {
        super(map);
        let subLayerName = name;
        this.styleLayers = {};
        this.sourceLayer = 'fill';

        let baseZoom = map.getBaseZoom();
        let symbolUIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolUIDArray.length; ++i) {
            let symbolUID = symbolUIDArray[i];
            let symbol = map._fillSymbolMap[symbolUID];
            if (!symbol) continue;
            if (!symbol.visible) continue;

            let extrusionLayerID = `${subLayerName}-${symbolUID}`;
            let extrusionLayer = extend({
                'id': extrusionLayerID,
                'symbol': symbol,
                'symbolID': symbol.symbolID,
                'source': this.sourceID,
                'source-layer': this.sourceLayer
            }, clone(defaultExtrusionLayer));
            extrusionLayer.paint['fill-extrusion-color'] = symbol.fillColor;
            extrusionLayer.paint['fill-extrusion-opacity'] = symbol.fillOpacity;

            let useIpExtrusion = false;
            useIpExtrusion = true;
            if (useIpExtrusion) {
                extrusionLayer = extend({
                    'id': extrusionLayerID,
                    'symbol': symbol,
                    'symbolID': symbol.symbolID,
                    'source': this.sourceID,
                    'source-layer': this.sourceLayer
                }, clone(defaultIPExtrusionLayer));
                extrusionLayer.paint['ipfill-extrusion-color'] = symbol.fillColor;
                extrusionLayer.paint['ipfill-extrusion-opacity'] = symbol.fillOpacity;
                extrusionLayer.paint['ipfill-extrusion-outline-color'] = symbol.outlineColor;
                extrusionLayer.paint['ipfill-extrusion-outline-opacity'] = symbol.outlineOpacity;
                extrusionLayer.paint['ipfill-extrusion-outline-width'] = symbol.outlineWidth;
            }

            let levelMin = symbol.levelMin;
            if (levelMin && levelMin !== 0) {
                extrusionLayer.minzoom = baseZoom + levelMin;
            }
            let levelMax = symbol.levelMax;
            if (levelMax && levelMax !== 0) {
                extrusionLayer.maxzoom = baseZoom + levelMax;
            }

            this.styleLayers[extrusionLayerID] = extrusionLayer;
        }
        // console.log(subLayerName + ' Layer: ' + symbolUIDArray.length);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all',
                    ['has', 'extrusion'],
                    ['==', 'extrusion', true],
                    ['==', 'floor', mapInfo.floorNumber],
                    ['==', 'symbolID', layers[layerID].symbolID]
                ]);
            }
        }
    }

    _switch3D(use3D) {
        use3D ? this.show() : this.hide();
    }
}

export {indoor_layergroup_ipextrusion};
