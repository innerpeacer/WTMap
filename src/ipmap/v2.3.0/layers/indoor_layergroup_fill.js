import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_fill extends IndoorGroupLayer {
    constructor(map, name, layerNumber) {
        super(map);

        this._layerNumber = layerNumber;
        let subLayerName = name;
        this.styleLayers = {};

        let layerID = `${subLayerName}-fill`;
        let layer = {
            'id': layerID,
            'type': 'fill',
            'source': this.sourceID,
            "source-layer": "fill1",
            'layout': {},
            'paint': {
                'fill-color': ["get", "fill-color"],
                'fill-opacity': ["get", "fill-opacity"],
            },
            "filter": ["all"]
        };
        this.styleLayers[layerID] = layer;

        let outlineLayerID = `${subLayerName}-outline`;
        let outlineLayer = {
            'id': outlineLayerID,
            "type": "line",
            "layout": {
                "line-join": "round",
                "line-cap": "round",
            },
            'source': this.sourceID,
            "source-layer": "fill1",
            "paint": {
                "line-color": ["get", "outline-color"],
                'line-opacity': 1,
                "line-width": ["get", "outline-width"]
                // "line-width": 3
            }
        };

        var useIpLine = false;
        // useIpLine = true;
        if (useIpLine) {
            outlineLayer = {
                'id': outlineLayerID,
                "type": "ipline",
                "layout": {
                    "ipline-join": "round",
                    "ipline-cap": "round",
                },
                'source': this.sourceID,
                "source-layer": "fill",
                "paint": {
                    "ipline-color": ["get", "outline-color"],
                    'ipline-opacity': 1,
                    "ipline-width": ["get", "outline-width"],
                    "ipline-height": ["/", ["get", 'extrusion-height'], 10],
                }
            };
        }

        this.styleLayers[outlineLayerID] = outlineLayer;
    }

    _setFloor(floor) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["==", "floor", floor],
                ["==", "layer", this._layerNumber],
            ]);
        }
    }
}

export default indoor_layergroup_fill