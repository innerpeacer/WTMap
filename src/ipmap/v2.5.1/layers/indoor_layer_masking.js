import IndoorGroupLayer from "./indoor_layer_base"

let emptySource = {
    'type': 'geojson', 'data': {"type": "FeatureCollection", "features": []}
};

class indoor_layer_masking extends IndoorGroupLayer {
    constructor(map) {
        super(map);

        let subLayerName = "highlight_masking";
        this.sourceID = subLayerName;
        this.map.addSource(this.sourceID, emptySource);
        this.styleLayers = {};

        let layerID = `${subLayerName}-fill`;
        let layer = {
            'id': layerID,
            'type': 'fill',
            'source': this.sourceID,
            'layout': {
                'visibility': 'none'
            },
            'paint': {
                'fill-color': "#888888",
                'fill-opacity': 0.5,
            },
            "filter": ["all"]
        };
        this.styleLayers[layerID] = layer;
    }

    _setMaskingData(data) {
        if (data) this.map.getSource(this.sourceID).setData(data);
    }
}

export default indoor_layer_masking
