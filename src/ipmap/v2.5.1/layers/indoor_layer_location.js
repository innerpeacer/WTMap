import IndoorGroupLayer from './indoor_layer_base'
import GeojsonUtils from '../utils/geojson_utils'

class indoor_layer_location extends IndoorGroupLayer {
    constructor(map) {
        super(map);

        let subLayerName = 'indoor_location';
        this.styleLayers = {};
        this.sourceID = subLayerName;

        let emptySource = {
            'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
        };

        this.map.addSource(this.sourceID, emptySource);
        {
            let layerID = `${subLayerName}-symbol`;
            let layer = {
                'id': layerID,
                'type': 'symbol',
                'source': this.sourceID,
                'paint': {},
                'layout': {
                    'icon-image': 'icon_location',
                    'icon-size': 1,
                    'icon-allow-overlap': true
                }
            };
            this.styleLayers[layerID] = layer;
        }
    }

    _showLocation(location) {
        let data = GeojsonUtils.createPointFeatureCollection([location]);
        this.map.getSource(this.sourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ['all', ['==', 'floor', mapInfo.floorNumber]]);
        }
    }
}

export default indoor_layer_location;
