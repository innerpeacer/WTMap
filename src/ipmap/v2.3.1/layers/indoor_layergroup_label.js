import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_label extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        let subLayerName = "label";
        this.styleLayers = {};

        let layerID = subLayerName;
        let textHeight = this._getTextHeight(map._options.use3D);
        let layer = {
            'id': layerID,
            'type': 'symbol',
            'source': this.sourceID,
            "source-layer": subLayerName,
            'paint': {
                "text-color": "#666666",
                "text-halo-color": "#ffffff",
                "text-height": textHeight,
                "text-halo-width": 1
            },
            'layout': {
                // "text-field": "{NAME}",
                "text-field": ["get", "NAME"],
                "text-font": ["simhei"],
                "text-size": 15,
                "text-anchor": "center",
                "text-padding": 0,
            }
        };
        this.styleLayers[layerID] = layer;
        this.labelID = layerID;
    }

    _getTextHeight(use3D) {
        return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    }

    _switch3D(use3D) {
        this.map.setPaintProperty(this.labelID, "text-height", this._getTextHeight(use3D));
    }

    _setLabelVisibleRange(minZoom, maxZoom) {
        this.map.setLayerZoomRange(this.labelID, minZoom, maxZoom);
    }

    _updateFontSize(minZoom) {
        this.map.setLayoutProperty(this.labelID, "text-size", {stops: [[minZoom, 12], [minZoom + 1, 18], [minZoom + 2, 24]]});
    }

    updateLayoutProperty(property, value) {
        this.map.setLayoutProperty(this.labelID, property, value);
    }

    updatePaintProperty(property, value) {
        this.map.setPaintProperty(this.labelID, property, value);
    }

    setFont(fontName) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-font", [fontName]);
        }
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

export default indoor_layergroup_label