import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_extrusion extends IndoorGroupLayer {
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

        this.styleLayers[extrusionLayerID] = extrusionLayer;
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

export default indoor_layergroup_extrusion