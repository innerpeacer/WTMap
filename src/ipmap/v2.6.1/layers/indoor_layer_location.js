import IndoorGroupLayer from './indoor_layer_base'
import {extend, clone, geojson_utils as GeojsonUtils} from "../../dependencies.js";

let defaultSymbolLayer = {
    'type': 'symbol',
    'paint': {},
    'layout': {
        'icon-size': 1,
        'icon-rotate': ['get', 'angle'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true
    }
};

class indoor_layer_location extends IndoorGroupLayer {
    constructor(map) {
        super(map);

        let subLayerName = 'indoor_location';
        this.styleLayers = {};
        this.sourceID = subLayerName;

        this.map.addSource(this.sourceID, GeojsonUtils.emptySource);
        {
            let layerID = `${subLayerName}-symbol`;
            let layer = extend({id: layerID, source: this.sourceID}, clone(defaultSymbolLayer));
            layer.layout['icon-image'] = ['case', ['has', 'location-icon'], ['get', 'location-icon'], 'icon_location'];
            this.styleLayers[layerID] = layer;
        }
    }

    _showLocation(location) {
        let data = GeojsonUtils.createPointFeatureCollection([location]);
        this.map.getSource(this.sourceID).setData(data);
    }

    _showLocations(locations) {
        let data = GeojsonUtils.createPointFeatureCollection(locations);
        this.map.getSource(this.sourceID).setData(data);
    }

    _hideLocation() {
        this.map.getSource(this.sourceID).setData(GeojsonUtils.emptyGeojson);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all', ['==', 'floor', mapInfo.floorNumber]]);
            }
        }
    }
}

export default indoor_layer_location;
