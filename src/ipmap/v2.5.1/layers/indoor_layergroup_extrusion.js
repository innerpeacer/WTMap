import IndoorGroupLayer from './indoor_layer_base'
import {extend, clone} from '../utils/ip_util'

let defaultExtrusionLayer = {
    'type': 'fill-extrusion',
    'paint': {
        'fill-extrusion-color': ['get', 'fill-color'],
        'fill-extrusion-base': ['/', ['get', 'extrusion-base'], 10],
        'fill-extrusion-height': ['/', ['get', 'extrusion-height'], 10],
        'fill-extrusion-opacity': 1,
    },
    'filter': ['all',
        ['has', 'extrusion'],
        ['==', 'extrusion', true],
    ]
};

let defaultOutlineLayer = {
    'type': 'ipline',
    'layout': {
        'ipline-join': 'round',
        'ipline-cap': 'round',
    },
    'paint': {
        'ipline-color': ['get', 'outline-color'],
        'ipline-opacity': 1,
        'ipline-width': ['get', 'outline-width'],
        'ipline-height': ['/', ['get', 'extrusion-height'], 10],
    }
};

class indoor_layergroup_extrusion extends IndoorGroupLayer {
    constructor(map, layerName, use3D) {
        super(map);
        let subLayerName = `${layerName}-extrusion`;
        this.styleLayers = {};

        this._use3D = use3D;
        this.sourceLayer = 'fill';
        if (!this._use3D) this.sourceLayer = 'empty';

        let extrusionLayerID = `${subLayerName}`;
        let extrusionLayer = extend({
            id: extrusionLayerID,
            'source': this.sourceID,
            'source-layer': this.sourceLayer
        }, clone(defaultExtrusionLayer));
        this.styleLayers[extrusionLayerID] = extrusionLayer;

        let useIpLine = false;
        // useIpLine = true;
        if (useIpLine) {
            let outlineLayerID = extrusionLayerID + '-fill-outline';
            let outlineLayer = extend({
                'id': outlineLayerID,
                'source': this.sourceID,
                'source-layer': this.sourceLayer
            }, clone(defaultOutlineLayer));
            this.styleLayers[outlineLayerID] = outlineLayer;
        }
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ['all',
                ['has', 'extrusion'],
                ['==', 'extrusion', true],
                ['==', 'floor', mapInfo.floorNumber],
            ]);
        }
    }
}

export default indoor_layergroup_extrusion
