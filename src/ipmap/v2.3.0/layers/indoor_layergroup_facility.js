// let IndoorGroupLayer = require("./indoor_layer_base");
import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_facility extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        let subLayerName = "facility";
        this.styleLayers = {};

        let layerID = `${subLayerName}-icon`;
        let layer = {
            'id': layerID,
            'type': 'symbol',
            'source': this.sourceID,
            "source-layer": subLayerName,
            'layout': {
                "icon-image": {
                    'type': 'identity',
                    'property': 'image-normal'
                },
                "icon-size": {
                    "stops": [
                        [19, 0.25],
                        [20, 0.5],
                        [21, 1],
                        [22, 1]
                    ]
                }
            },
        };
        this.styleLayers[layerID] = layer;
        this.iconLayerID = layerID;
    }

    _setIconVisibleRange(minZoom, maxZoom) {
        this.map.setLayerZoomRange(this.iconLayerID, minZoom, maxZoom);
    }

    updateLayoutProperty(property, value) {
        this.map.setLayoutProperty(this.iconLayerID, property, value);
    }

    updatePaintProperty(property, value) {
        this.map.setPaintProperty(this.iconLayerID, property, value);
    }

    _updateIconSize(minZoom) {
        this.map.setLayoutProperty(this.iconLayerID, "icon-size", {stops: [[minZoom - 1, 0.25], [minZoom, 0.25], [minZoom + 1, 0.5], [minZoom + 2, 1], [minZoom + 3, 1]]});
    }

    loadSubGroupLayerData(data) {
        this.map.getSource(this.sourceID).setData(data);
    }

    _setFloor(floor) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["==", "floor", floor]
            ]);
        }
    }
}

// module.exports = indoor_layergroup_facility;
export default indoor_layergroup_facility