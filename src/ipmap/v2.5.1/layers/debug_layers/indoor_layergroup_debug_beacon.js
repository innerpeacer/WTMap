import IndoorGroupLayer from "../indoor_layer_base"

class indoor_layergroup_debug_beacon extends IndoorGroupLayer {
    constructor(map, locator) {
        super(map);

        this.locator = locator;
        let subLayerName = "debug_beacon";
        this.styleLayers = {};
        this.sourceID = subLayerName;

        let emptySource = {
            'type': 'geojson', 'data': {"type": "FeatureCollection", "features": []}
        };
        this.map.addSource(this.sourceID, emptySource);
        {
            let layerID = `${subLayerName}-circle`;
            let layer = {
                'id': layerID,
                'type': 'circle',
                'source': this.sourceID,
                "paint": {
                    'circle-radius': 2,
                    'circle-color': '#3bb2d0',
                    'circle-stroke-width': 0.5,
                    'circle-stroke-color': '#888'
                },
            };
            this.styleLayers[layerID] = layer;
        }
        {
            let layerID = `${subLayerName}-symbol`;
            let layer = {
                'id': layerID,
                'type': 'symbol',
                'source': this.sourceID,
                "paint": {
                    "text-color": "#4169E1",
                    "text-halo-color": "#ffffff",
                    // "text-halo-width": 1
                },
                "layout": {
                    "text-field": ["get", "minor"],
                    "text-font": ["simhei"],
                    "text-offset": [0, 0.3],
                    "text-anchor": "top",
                    "text-size": 9,
                }
            };
            this.styleLayers[layerID] = layer;
        }

    }

    _moveLayer() {
        for (let layerID in this.styleLayers) {
            this.map.moveLayer(layerID);
        }
    }

    _setLocatingBeaconData(data) {
        this.map.getSource(this.sourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setFilter(layerID, ["all",
                ["==", "floor", mapInfo.floorNumber]
            ]);
        }
    }
}

export default indoor_layergroup_debug_beacon;
