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

        this._use3D = use3D;
        this._floorLayer = new FillLayer(map, "floor", 1).addToMap();
        this._baseLayerArray.push(this._floorLayer);

        this._roomLayer = new FillLayer(map, "room", 2).addToMap();
        this._baseLayerArray.push(this._roomLayer);

        this._assetLayer = new FillLayer(map, 'asset', 3).addToMap();
        this._baseLayerArray.push(this._assetLayer);

        this._routeLayer = new MultiStopRouteLayer(map).addToMap();

        this._extrusionLayer = new ExtrusionLayer(map, "indoor").addToMap();
        this._baseLayerArray.push(this._extrusionLayer);

        this._facilityLayer = new FacilityLayer(map).addToMap();
        this._baseLayerArray.push(this._facilityLayer);

        this._labelLayer = new LabelLayer(map).addToMap();
        this._baseLayerArray.push(this._labelLayer);

        this._map.moveLayer(this._routeLayer.routeStopObject.layerID);
        this._map.moveLayer(this._routeLayer.routeStopObject.layerID2);

        this._switch3D(this._use3D);
    }

    _switch3D(use3D) {
        if (use3D) {
            this._extrusionLayer.show();
        } else {
            this._extrusionLayer.hide();
        }
        this._facilityLayer._switch3D(use3D);
        this._labelLayer._switch3D(use3D);
    }

    _setLabelVisibleRange(minZoom, maxZoom) {
        this._labelLayer._setLabelVisibleRange(minZoom, maxZoom);
    }

    _setIconVisibleRange(minZoom, maxZoom) {
        this._facilityLayer._setIconVisibleRange(minZoom, maxZoom);
    }

    setLabelLayout(property, value) {
        this._labelLayer.updateLayoutProperty(property, value);
    }

    setLabelPaint(property, value) {
        this._labelLayer.updatePaintProperty(property, value);
    }

    setFacilityLayout(propetry, value) {
        this._facilityLayer.updateLayoutProperty(propetry, value);
    }

    setFacilityPaint(property, value) {
        this._facilityLayer.updatePaintProperty(property, value);
    }

    setFont(fontName) {
        this._labelLayer.setFont(fontName);
        this._facilityLayer.setFont(fontName);
    }

    _updateFontIconSize(minZoom) {
        this._labelLayer._updateFontSize(minZoom);
        this._facilityLayer._updateIconSize(minZoom);
        this._facilityLayer._updateFontSize(minZoom);
    }

    hideLayers() {
        this._baseLayerArray.forEach(function (layer, index) {
            layer.hide();
        });
        this._routeLayer.hide();
    }

    showLayers() {
        this._baseLayerArray.forEach(function (layer, index) {
            layer.show();
        });
        this._routeLayer.show();
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
        this._routeLayer._updateMapInfo(mapInfo);
    }
}

export default indoor_layers

