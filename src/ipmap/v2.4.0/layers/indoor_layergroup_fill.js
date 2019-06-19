import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_fill extends IndoorGroupLayer {
    constructor(map, name, layerNumber) {
        super(map);

        this._layerNumber = layerNumber;
        let subLayerName = name;
        this.styleLayers = {};

        let symbolIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolIDArray.length; ++i) {
            let symbolID = symbolIDArray[i];
            let symbol = map._fillSymbolMap[symbolID];

            let layerID = `${subLayerName}-fill-${symbolID}`;
            let layer = {
                'id': layerID,
                'symbolID': symbolID,
                'type': 'fill',
                'source': this.sourceID,
                "source-layer": "fill",
                'layout': {},
                'paint': {
                    'fill-color': symbol.fillColor,
                    'fill-opacity': symbol.fillOpacity,
                },
                "filter": ["all"]
            };
            this.styleLayers[layerID] = layer;

            let outlineLayerID = `${subLayerName}-outline-${symbolID}`;
            let outlineLayer = {
                'id': outlineLayerID,
                'symbolID': symbolID,
                "type": "line",
                "layout": {
                    "line-join": "round",
                    "line-cap": "round",
                },
                'source': this.sourceID,
                "source-layer": "fill",
                "paint": {
                    "line-color": symbol.outlineColor,
                    'line-opacity': symbol.outlineOpacity,
                    "line-width": symbol.outlineWidth
                },
                "filter": ["all"]
            };
            this.styleLayers[outlineLayerID] = outlineLayer;
        }
        // console.log(subLayerName + " Layer: " + symbolIDArray.length);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["==", "floor", mapInfo.floorNumber],
                ["==", "layer", this._layerNumber],
                ["==", "symbolID", layers[layerID].symbolID]
            ]);
        }
    }
}

export default indoor_layergroup_fill