import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layer_highlight extends IndoorGroupLayer {
    constructor(map) {
        super(map);

        let subLayerName = "highlight";
        this.styleLayers = {};

        let layerID = `${subLayerName}-fill`;
        this.highlightLayerID = layerID;
        let layer = {
            'id': layerID,
            'type': 'fill',
            'source': this.sourceID,
            "source-layer": "fill",
            'layout': {},
            'paint': {},
            "filter": ["==", "POI_ID", "not exist"]
        };
        this.styleLayers[layerID] = layer;
    }

    _highlightPoi(pois, options) {
        if (options && options.color) {
            this.map.setPaintProperty(this.highlightLayerID, "fill-color", options.color);
        }

        if (options && options.opacity) {
            this.map.setPaintProperty(this.highlightLayerID, "fill-opacity", options.opacity);
        }
        let filter = ['in', 'POI_ID'].concat(pois);
        this.map.setFilter(this.highlightLayerID, filter);
    }

    _resetHighlight() {
        this.map.setFilter(this.highlightLayerID, ["==", "POI_ID", "not exist"]);
    }
}

export default indoor_layer_highlight
