import FillLayer from "./indoor_layergroup_fill"
import FacilityLayer from "./indoor_layergroup_facility"
import LabelLayer from "./indoor_layergroup_label"

// import ExtrusionLayer from "./indoor_layergroup_extrusion"
import ExtrusionLayer from "./indoor_layergroup_ipextrusion"
import MultiStopRouteLayer from "./indoor_layergroup_multi_stop_route"

class indoor_layers {
    constructor(map, use3D) {
        this._map = map;
        this._baseLayerArray = [];
        this._3dLayerArray = [];
        this._labelIconLayerArray = [];

        this._use3D = use3D;
        this._floorLayer = new FillLayer(map, "floor", 1).addToMap();
        this._baseLayerArray.push(this._floorLayer);

        this._roomLayer = new FillLayer(map, "room", 2).addToMap();
        this._baseLayerArray.push(this._roomLayer);

        this._assetLayer = new FillLayer(map, 'asset', 3).addToMap();
        this._baseLayerArray.push(this._assetLayer);

        this._routeLayer = new MultiStopRouteLayer(map).addToMap();
        this._baseLayerArray.push(this._routeLayer);

        this._extrusionLayer = new ExtrusionLayer(map, "indoor").addToMap();
        this._baseLayerArray.push(this._extrusionLayer);
        this._3dLayerArray.push(this._extrusionLayer);

        this._facilityLayer = new FacilityLayer(map).addToMap();
        this._baseLayerArray.push(this._facilityLayer);
        this._3dLayerArray.push(this._facilityLayer);
        this._labelIconLayerArray.push(this._facilityLayer);

        this._labelLayer = new LabelLayer(map).addToMap();
        this._baseLayerArray.push(this._labelLayer);
        this._3dLayerArray.push(this._labelLayer);
        this._labelIconLayerArray.push(this._labelLayer);

        this._map.moveLayer(this._routeLayer.routeStopObject.layerID);
        this._map.moveLayer(this._routeLayer.routeStopObject.layerID2);

        this._switch3D(this._use3D);
    }

    _switch3D(use3D) {
        this._3dLayerArray.forEach(function (layer, index) {
            layer._switch3D(use3D);
        });
    }

    switchLanguage(options) {
        this._labelIconLayerArray.forEach(function (layer, index) {
            layer.switchLanguage(options);
        });
    }

    _setLabelIconVisibleRange(minZoom, maxZoom) {
        this._labelIconLayerArray.forEach(function (layer, index) {
            layer._setLabelIconVisibleRange(minZoom, maxZoom);
        });
    }

    _setLabelVisibleRange(minZoom, maxZoom) {
        if (this._labelLayer) {
            this._labelLayer._setLabelVisibleRange(minZoom, maxZoom);
        }
    }

    _setIconVisibleRange(minZoom, maxZoom) {
        if (this._facilityLayer) {
            this._facilityLayer._setIconVisibleRange(minZoom, maxZoom);
        }
    }

    setLabelLayout(property, value) {
        if (this._labelLayer) {
            this._labelLayer.updateLayoutProperty(property, value);
        }
    }

    setLabelPaint(property, value) {
        if (this._labelLayer) {
            this._labelLayer.updatePaintProperty(property, value);
        }
    }

    setFacilityLayout(propetry, value) {
        if (this._facilityLayer) {
            this._facilityLayer.updateLayoutProperty(propetry, value);
        }
    }

    setFacilityPaint(property, value) {
        if (this._facilityLayer) {
            this._facilityLayer.updatePaintProperty(property, value);
        }
    }

    setFont(fontName) {
        this._labelIconLayerArray.forEach(function (layer, index) {
            layer.setFont(fontName);
        });
    }

    _updateFontIconSize(minZoom) {
        this._labelIconLayerArray.forEach(function (layer, index) {
            layer._updateFontIconSize(minZoom);
        });
    }

    hideLayers() {
        this._baseLayerArray.forEach(function (layer, index) {
            layer.hide();
        });
    }

    showLayers() {
        this._baseLayerArray.forEach(function (layer, index) {
            layer.show();
        });
    }

    hideRoute() {
        this._routeLayer.hideRoute();
    }

    showRoute(result, location, segment) {
        this._routeLayer.showRoute(result, location, segment);
    }

    _setRouteColor(color1, color2, color3) {
        this._routeLayer._setRouteColor(color1, color2, color3);
    }

    _updateMapInfo(mapInfo) {
        let floor = mapInfo.floorNumber;
        this._baseLayerArray.forEach(function (layer, index) {
            layer._setMapInfo(mapInfo);
        });
    }

    getLayerIDs(subLayer) {
        if (subLayer === "floor") return this._floorLayer._getLayerIDs();
        if (subLayer === "room") return this._roomLayer._getLayerIDs();
        if (subLayer === "asset") return this._assetLayer._getLayerIDs();
        if (subLayer === "facility") return this._facilityLayer._getLayerIDs();
        if (subLayer === "label") return this._labelLayer._getLayerIDs();
    }
}

export default indoor_layers

