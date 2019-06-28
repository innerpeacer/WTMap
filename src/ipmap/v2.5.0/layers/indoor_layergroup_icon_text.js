import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_icon_text extends IndoorGroupLayer {
    constructor(map, name) {
        super(map);
        let subLayerName = name;
        this.styleLayers = {};
        this.buildingID = map.building.buildingID;
        let baseZoom = map.getBaseZoom();

        let height = this._getHeight(map._options.use3D);
        let symbolUIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolUIDArray.length; ++i) {
            let symbolUID = symbolUIDArray[i];
            let symbol = map._iconTextSymbolMap[symbolUID];
            if (!symbol) continue;

            let layerID = `${subLayerName}-${symbolUID}`;
            let layer = {
                'id': layerID,
                'symbol': symbol,
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
                    // "text-anchor": "center",
                    // "text-variable-anchor": ["top", "bottom", "left", "right"],
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
                layer.layout["text-font"] = [`${symbol.textFont}-${this.buildingID}`];
                layer.layout["text-size"] = symbol.textSize;
                if (symbol.iconVisible) {
                    // layer.layout["text-anchor"] = "left";
                    layer.layout["text-variable-anchor"] = ["top", "bottom", "left", "right"];
                    layer.layout["text-radial-offset"] = 0.8;
                    // layer.layout["text-offset"] = [symbol.textOffsetX + 0.70, symbol.textOffsetY + 0.15];
                } else {
                    layer.layout["text-anchor"] = "center";
                    layer.layout["text-offset"] = [symbol.textOffsetX, symbol.textOffsetY];
                }
            }

            if (symbol.otherLayout) {
                for (let key in symbol.otherLayout) {
                    layer.layout[key] = symbol.otherLayout[key];
                }
            }

            if (symbol.otherPaint) {
                for (let key in symbol.otherPaint) {
                    layer.paint[key] = symbol.otherPaint[key];
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
        // console.log(subLayerName + " Layer: " + symbolUIDArray.length);
    }

    _getHeight(use3D) {
        return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    }

    _switch3D(use3D) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            // this.map.setPaintProperty(layerID, "icon-height", this._getHeight(use3D));
            // this.map.setPaintProperty(layerID, "text-height", this._getHeight(use3D));
        }
    }

    switchLanguage(options) {
        if (!options || !options.lang) return;
        let layers = this.styleLayers;
        for (let layerID in layers) {
            let layerDef = layers[layerID];
            let symbol = layerDef.symbol;
            if (symbol.textVisible) {
                if (options.lang === "cn") {
                    this.map.setLayoutProperty(layerID, "text-field", ["get", "NAME"]);
                    this.map.setLayoutProperty(layerID, "text-font", [`${symbol.textFont}-${this.buildingID}`]);
                } else if (options.lang === "en") {
                    this.map.setLayoutProperty(layerID, "text-field", ["get", "NAME_EN"]);
                    let enFont = options.font || "simhei";
                    this.map.setLayoutProperty(layerID, "text-font", [`${enFont}-${this.buildingID}`]);
                }
            }
        }
    }

    _setLabelIconVisibleRange(minZoom, maxZoom) {
        this._setLabelVisibleRange(minZoom, maxZoom);
    }

    _setLabelVisibleRange(minZoom, maxZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayerZoomRange(layerID, minZoom, maxZoom);
        }
    }

    _updateFontIconSize(minZoom) {
        // No Icon!
        this._updateFontSize(minZoom);
    }

    _updateFontSize(minZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-size", {stops: [[minZoom, 12], [minZoom + 1, 18], [minZoom + 2, 24]]});
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

    setFont(fontName) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-font", [fontName]);
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

    _getLayerIDs() {
        return Object.keys(this.styleLayers);
    }
}

export default indoor_layergroup_icon_text
