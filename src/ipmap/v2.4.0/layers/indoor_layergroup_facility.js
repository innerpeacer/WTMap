import IndoorGroupLayer from "./indoor_layer_base"

class indoor_layergroup_facility extends IndoorGroupLayer {
    constructor(map) {
        super(map);
        let subLayerName = "facility";
        this.styleLayers = {};

        let layerID = `${subLayerName}-icon`;
        let height = this._getHeight(map._options.use3D);
        // let iconHeight = this._getIconHeight(map._options.use3D);
        // let textHeight = this._getTextHeight(map._options.use3D);

        let layer = {
            'id': layerID,
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
                "icon-image": ["get", "image-normal"],
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
        this.iconLayerID = layerID;
    }

    _getHeight(use3D){
        return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    }

    // _getIconHeight(use3D) {
    //     return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    // }
    //
    // _getTextHeight(use3D) {
    //     return use3D ? ["/", ["get", 'extrusion-height'], 10] : 0;
    // }

    setFont(fontName) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, "text-font", [fontName]);
        }
    }

    _switch3D(use3D) {
        this.map.setPaintProperty(this.iconLayerID, "icon-height", this._getHeight(use3D));
        this.map.setPaintProperty(this.iconLayerID, "text-height", this._getHeight(use3D));
    }

    _setIconVisibleRange(minZoom, maxZoom) {
        this.map.setLayerZoomRange(this.iconLayerID, minZoom, maxZoom);
    }

    updateLayoutProperty(property, value) {
        this.map.setLayoutProperty(this.iconLayerID, property, value);
    }

    updatePaintProperty(property, value) {
        this.map.setPaintProperty(this.iconLayerID, property, value);
    }

    _updateIconSize(minZoom) {
        this.map.setLayoutProperty(this.iconLayerID, "icon-size", {
            stops: [
                [minZoom, 0.25],
                [minZoom + 1, 0.25],
                [minZoom + 2, 0.5],
                [minZoom + 3, 0.5]]
        });
    }

    _updateFontSize(minZoom) {
        this.map.setLayoutProperty(this.iconLayerID, "text-size", {
            stops: [
                [minZoom, 13],
                [minZoom + 1, 13],
                [minZoom + 2, 26],
                [minZoom + 3, 26]
            ]
        });
        // this.map.setLayoutProperty(this.iconLayerID, "text-offset", {
        //     stops: [
        //         [minZoom, [0.5, 0.1]],
        //         [minZoom + 1, [0.5, 0.1]],
        //         [minZoom + 2, [1, 0.1]],
        //         [minZoom + 3, [1, 0.1]]
        //     ]
        // });
}

loadSubGroupLayerData(data)
{
    this.map.getSource(this.sourceID).setData(data);
}

_setMapInfo(mapInfo)
{
    let layers = this.styleLayers;
    for (let layerID in layers) {
        this.map.setFilter(layerID, ["all",
            ["==", "floor", mapInfo.floorNumber]
        ]);
    }
}
}

export default indoor_layergroup_facility