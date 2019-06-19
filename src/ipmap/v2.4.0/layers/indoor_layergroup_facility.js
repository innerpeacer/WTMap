import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_facility extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        let subLayerName = "facility";
        this.styleLayers = {};

        let height = this._getHeight(map._options.use3D);
        let symbolIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolIDArray.length; ++i) {
            let symbolID = symbolIDArray[i];
            let symbol = map._iconSymbolMap[symbolID];

            let layerID = `${subLayerName}-icon-${symbolID}`;
            let layer = {
                'id': layerID,
                'symbolID': symbolID,
                'type': 'symbol',
                'source': this.sourceID,
                "source-layer": subLayerName,
                'paint': {
                    "icon-height": height,
                    "text-color": "#666666",
                    "text-halo-color": "#ffffff",
                    "text-height": height,
                    "text-halo-width": 1
                },
                'layout': {
                    "icon-image": `${symbol.icon}_normal`,
                    // "icon-text-fit":"height",
                    "icon-size": {
                        "stops": [
                            [19, 0.25],
                            [20, 0.5],
                            [21, 1],
                            [22, 1]
                        ]
                    },
                    "text-field": ["get", "NAME"],
                    "text-font": ["simhei"],
                    "text-size": 13,
                    "text-anchor": "left",
                    "text-offset": [0.6, 0.1],
                    "text-padding": 2,
                },
            };
            this.styleLayers[layerID] = layer;
        }
        // console.log(subLayerName + " Layer: " + symbolIDArray.length);
    }

    _getHeight(use3D) {
        return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    }

    setFont(fontName) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-font", [fontName]);
        }
    }

    _switch3D(use3D) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setPaintProperty(layerID, "icon-height", this._getHeight(use3D));
            this.map.setPaintProperty(layerID, "text-height", this._getHeight(use3D));
        }
    }

    _setLabelIconVisibleRange(minZoom, maxZoom) {
        this._setIconVisibleRange(minZoom, maxZoom);
    }

    _setIconVisibleRange(minZoom, maxZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayerZoomRange(layerID, minZoom, maxZoom);
        }
    }

    updateLayoutProperty(property, value) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, property, value);
        }
    }

    updatePaintProperty(property, value) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setPaintProperty(layerID, property, value);
        }
    }

    _updateFontIconSize(minZoom) {
        this._updateIconSize(minZoom);
        this._updateFontSize(minZoom);
    }

    _updateIconSize(minZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "icon-size", {
                stops: [
                    [minZoom, 0.25],
                    [minZoom + 1, 0.25],
                    [minZoom + 2, 0.5],
                    [minZoom + 3, 0.5]]
            });
        }
    }

    _updateFontSize(minZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-size", {
                stops: [
                    [minZoom, 13],
                    [minZoom + 1, 13],
                    [minZoom + 2, 26],
                    [minZoom + 3, 26]
                ]
            });
        }
    }

    loadSubGroupLayerData(data) {
        this.map.getSource(this.sourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["==", "floor", mapInfo.floorNumber],
                ["==", "symbolID", layers[layerID].symbolID]
            ]);
        }
    }
}

export default indoor_layergroup_facility