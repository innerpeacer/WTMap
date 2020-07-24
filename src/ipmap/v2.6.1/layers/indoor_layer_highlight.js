import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layer_highlight extends IndoorGroupLayer {
    constructor(map) {
        super(map);

        let subLayerName = "highlight";
        this.styleLayers = {};

        let layerID = `${subLayerName}-fill`;
        this.highlightLayerID = layerID;
        this.styleLayers[layerID] = {
            'id': layerID,
            'type': 'fill',
            'source': this.sourceID,
            "source-layer": "fill",
            'layout': {},
            'paint': {},
            "filter": ["==", "POI_ID", "not exist"]
        };

        this.pois = [];
    }

    _highlightPoi(pois, options) {
        if (options && options.color) {
            this.map.setPaintProperty(this.highlightLayerID, "fill-color", options.color);
        }

        if (options && options.opacity) {
            this.map.setPaintProperty(this.highlightLayerID, "fill-opacity", options.opacity);
        }

        this.pois = [].concat(pois);
        let filter = ['all'];
        filter.push(['==', 'floor', this.map.currentMapInfo.floorNumber]);
        filter.push(['in', 'POI_ID'].concat(this.pois));
        this.map.setFilter(this.highlightLayerID, filter);
    }

    _resetHighlight() {
        this.map.setFilter(this.highlightLayerID, ["==", "POI_ID", "not exist"]);
    }

    _setMapInfo() {
        let filter = ['all'];
        filter.push(['==', 'floor', this.map.currentMapInfo.floorNumber]);
        filter.push(['in', 'POI_ID'].concat(this.pois));
        this.map.setFilter(this.highlightLayerID, filter);
    }
}

export default indoor_layer_highlight
