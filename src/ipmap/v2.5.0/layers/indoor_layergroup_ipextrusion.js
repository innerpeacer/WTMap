import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_ipextrusion extends IndoorGroupLayer {
    constructor(map, name) {
        super(map);
        let subLayerName = name;
        this.styleLayers = {};
        this.sourceLayer = "fill";

        let baseZoom = map.getBaseZoom();
        let symbolUIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolUIDArray.length; ++i) {
            let symbolUID = symbolUIDArray[i];
            let symbol = map._fillSymbolMap[symbolUID];
            if (!symbol) continue;

            let extrusionLayerID = `${subLayerName}-${symbolUID}`;
            let extrusionLayer = {
                // 'id': extrusionLayerID,
                // 'symbol': symbol,
                // 'symbolID': symbol.symbolID,
                // 'type': 'fill-extrusion',
                // 'source': this.sourceID,
                // "source-layer": this.sourceLayer,
                // 'paint': {
                //     'fill-extrusion-color': symbol.fillColor,
                //     'fill-extrusion-base': ["/", ["get", 'extrusion-base'], 10],
                //     'fill-extrusion-height': ["/", ["get", 'extrusion-height'], 10],
                //     'fill-extrusion-opacity': symbol.fillOpacity,
                // },
                // "filter": ["all",
                //     ["has", "extrusion"],
                //     ["==", "extrusion", true],
                // ]
            };

            var useIpExtrusion = false;
            useIpExtrusion = true;
            let random = Math.random() * 10;
            if (useIpExtrusion) {
                extrusionLayer = {
                    'id': extrusionLayerID,
                    'symbol': symbol,
                    'symbolID': symbol.symbolID,
                    'type': 'ipfill-extrusion',
                    'source': this.sourceID,
                    "source-layer": this.sourceLayer,
                    'layout': {
                        "ipfill-extrusion-outline-join": "round",
                        "ipfill-extrusion-outline-cap": "round",
                    },
                    'paint': {
                        'ipfill-extrusion-color': symbol.fillColor,
                        'ipfill-extrusion-base': ["/", ["get", 'extrusion-base'], 10],
                        'ipfill-extrusion-height': ["/", ["get", 'extrusion-height'], 10],
                        'ipfill-extrusion-opacity': Math.random() * 0.5 + 0.5,
                        "ipfill-extrusion-outline-color": symbol.outlineColor,
                        'ipfill-extrusion-outline-opacity': symbol.outlineOpacity,
                        "ipfill-extrusion-outline-width": symbol.outlineWidth,
                        "ipfill-extrusion-outline-height": ["/", ["get", 'extrusion-height'], 10],
                    },
                    "filter": ["all",
                        ["has", "extrusion"],
                        ["==", "extrusion", true],
                    ]
                };
            }

            let levelMin = symbol.levelMin;
            if (levelMin && levelMin != 0) {
                extrusionLayer.minzoom = baseZoom + levelMin;
            }
            let levelMax = symbol.levelMax;
            if (levelMax && levelMax != 0) {
                extrusionLayer.maxzoom = baseZoom + levelMax;
            }

            this.styleLayers[extrusionLayerID] = extrusionLayer;
        }
        // console.log(subLayerName + " Layer: " + symbolUIDArray.length);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["has", "extrusion"],
                ["==", "extrusion", true],
                ["==", "floor", mapInfo.floorNumber],
                ["==", "symbolID", layers[layerID].symbolID]
            ]);
        }
    }

    _switch3D(use3D) {
        if (use3D) {
            this.show();
        } else {
            this.hide();
        }
    }
}

export default indoor_layergroup_ipextrusion
