import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_ipextrusion extends IndoorGroupLayer {
    constructor(map, layerName, use3D) {
        super(map);
        let subLayerName = `${layerName}-extrusion`;
        this.styleLayers = {};

        this._use3D = use3D;
        this.sourceLayer = "fill";
        if (!this._use3D) this.sourceLayer = "empty";

        let extrusionLayerID = `${subLayerName}`;
        let extrusionLayer = {
            'id': extrusionLayerID,
            'type': 'fill-extrusion',
            'source': this.sourceID,
            "source-layer": this.sourceLayer,
            'paint': {
                'fill-extrusion-color': ["get", 'fill-color'],
                'fill-extrusion-base': ["/", ["get", 'extrusion-base'], 10],
                'fill-extrusion-height': ["/", ["get", 'extrusion-height'], 10],
                'fill-extrusion-opacity': 1,
            },
            "filter": ["all",
                ["has", "extrusion"],
                ["==", "extrusion", true],
            ]
        };

        var useIpExtrusion = false;
        useIpExtrusion = true;
        if (useIpExtrusion){
            extrusionLayer = {
                'id': extrusionLayerID,
                'type': 'ipfill-extrusion',
                'source': this.sourceID,
                "source-layer": this.sourceLayer,
                'layout': {
                    "ipfill-extrusion-outline-join": "round",
                    "ipfill-extrusion-outline-cap": "round",
                },
                'paint': {
                    'ipfill-extrusion-color': ["get", 'fill-color'],
                    'ipfill-extrusion-base': ["/", ["get", 'extrusion-base'], 10],
                    'ipfill-extrusion-height': ["/", ["get", 'extrusion-height'], 10],
                    // 'ipfill-extrusion-height': 20,
                    'ipfill-extrusion-opacity': 0.9,

                    "ipfill-extrusion-outline-color": ["get", "outline-color"],
                    'ipfill-extrusion-outline-opacity': 1,
                    "ipfill-extrusion-outline-width": ["get", "outline-width"],
                    "ipfill-extrusion-outline-height": ["/", ["get", 'extrusion-height'], 10],
                },
                "filter": ["all",
                    ["has", "extrusion"],
                    ["==", "extrusion", true],
                ]
            };
        }
        this.styleLayers[extrusionLayerID] = extrusionLayer;

        // var useIpLine = false;
        // // useIpLine = true;
        // if (useIpLine) {
        //     let outlineLayerID = extrusionLayerID + "-fill-outline";
        //     let outlineLayer = {
        //         'id': outlineLayerID,
        //         "type": "ipline",
        //         "layout": {
        //             "ipline-join": "round",
        //             "ipline-cap": "round",
        //         },
        //         'source': this.sourceID,
        //         "source-layer": "fill",
        //         "paint": {
        //             "ipline-color": ["get", "outline-color"],
        //             'ipline-opacity': 1,
        //             "ipline-width": ["get", "outline-width"],
        //             "ipline-height": ["/", ["get", 'extrusion-height'], 10],
        //         }
        //     };
        //     this.styleLayers[outlineLayerID] = outlineLayer;
        // }

    }

    _setFloor(floor) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["has", "extrusion"],
                ["==", "extrusion", true],
                ["==", "floor", floor],
            ]);
        }
    }

}

export default indoor_layergroup_ipextrusion