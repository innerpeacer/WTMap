import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_facility extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        let subLayerName = "facility";
        this.styleLayers = {};
        let buildingID = map.building.buildingID;
        let baseZoom = map.getBaseZoom();

        let height = this._getHeight(map._options.use3D);
        let symbolUIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolUIDArray.length; ++i) {
            let symbolUID = symbolUIDArray[i];
            let symbol = map._iconTextSymbolMap[symbolUID];
            if (!symbol) continue;

            let layerID = `${subLayerName}-icon-${symbolUID}`;
            let layer = {
                'id': layerID,
                'symbolID': symbol.symbolID,
                'type': 'symbol',
                'source': this.sourceID,
                "source-layer": subLayerName,
                'paint': {
                    "icon-height": height,
                    "text-halo-color": "#ffffff",
                    "text-height": height,
                    "text-halo-width": 1
                },
                'layout': {
                    "text-anchor": "center",
                    "text-offset": [0.6, 0.1],
                    "text-padding": 2,
                },
            };

            if (symbol.iconVisible) {
                layer.layout["icon-image"] = ["concat", ["get", "ICON"], "_normal"];
                layer.layout["icon-size"] = symbol.iconSize;
            }

            if (symbol.textVisible) {
                layer.paint["text-color"] = symbol.textColor;
                layer.layout["text-field"] = ["get", "NAME"];
                layer.layout["text-font"] = [`${symbol.textFont}-${buildingID}`];
                layer.layout["text-size"] = symbol.textSize;
                if (symbol.iconVisible) {
                    layer.layout["text-anchor"] = "left";
                    layer.layout["text-offset"] = [symbol.textOffsetX + 0.70, symbol.textOffsetY + 0.15];
                } else {
                    layer.layout["text-anchor"] = "center";
                    layer.layout["text-offset"] = [symbol.textOffsetX, symbol.textOffsetY];
                }
            }

            let levelMin = symbol.levelMin;
            if (levelMin && levelMin != 0) {
                layer.minzoom = baseZoom + levelMin;
            }
            let levelMax = symbol.levelMax;
            if (levelMax && levelMax != 0) {
                layer.maxzoom = baseZoom + levelMax;
            }
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