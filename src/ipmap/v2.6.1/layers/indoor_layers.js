import FillLayer from './indoor_layergroup_fill';
import IconTextLayer from './indoor_layergroup_icon_text';

// import ExtrusionLayer from './indoor_layergroup_extrusion'
import ExtrusionLayer from './indoor_layergroup_ipextrusion';
import MultiStopRouteLayer from './indoor_layergroup_multi_stop_route';
import MaskingLayer from './indoor_layer_masking';
import HighlightLayer from './indoor_layer_highlight';
import LocationLayer from './indoor_layer_location';
import DebugBeaconLayer from './debug_layers/indoor_layergroup_debug_beacon';

class indoor_layers {
    constructor(map, use3D) {
        this._map = map;
        this._baseLayerArray = [];
        this._3dLayerArray = [];
        this._labelIconLayerArray = [];
        this._locationLayerArray = [];

        this._use3D = use3D;
        this._floorLayer = new FillLayer(map, 'floor', 1).addToMap();
        this._baseLayerArray.push(this._floorLayer);

        this._roomLayer = new FillLayer(map, 'room', 2).addToMap();
        this._baseLayerArray.push(this._roomLayer);

        this._assetLayer = new FillLayer(map, 'asset', 3).addToMap();
        this._baseLayerArray.push(this._assetLayer);

        this._routeLayer = new MultiStopRouteLayer(map).addToMap();
        this._baseLayerArray.push(this._routeLayer);

        this._extrusionLayer = new ExtrusionLayer(map, 'extrusion').addToMap();
        this._baseLayerArray.push(this._extrusionLayer);
        this._3dLayerArray.push(this._extrusionLayer);

        this._facilityLayer = new IconTextLayer(map, 'facility').addToMap();
        this._baseLayerArray.push(this._facilityLayer);
        this._3dLayerArray.push(this._facilityLayer);
        this._labelIconLayerArray.push(this._facilityLayer);

        this._labelLayer = new IconTextLayer(map, 'label').addToMap();
        this._baseLayerArray.push(this._labelLayer);
        this._3dLayerArray.push(this._labelLayer);
        this._labelIconLayerArray.push(this._labelLayer);

        this._map.moveLayer(this._routeLayer.routeStopObject.layerID);
        this._map.moveLayer(this._routeLayer.routeStopObject.layerID2);

        let options = map._options;
        this._debugBeacon = options._debugBeacon || false;
        if (this._debugBeacon) {
            this._debugBeaconLayer = new DebugBeaconLayer(map, map._locator).addToMap();
            // this._debugBeaconLayer._setLocatingBeaconData(map._locator._biteMe('_getLocatingBeaconGeojson'));
            // this._debugBeaconLayer._moveLayer();
            this._baseLayerArray.push(this._debugBeaconLayer);
        }

        this._locationLayer = new LocationLayer(map).addToMap();
        this._baseLayerArray.push(this._locationLayer);
        this._locationLayerArray.push(this._locationLayer);

        this._maskingLayer = new MaskingLayer(map).addToMap();
        this._highlightLayer = new HighlightLayer(map).addToMap();
        this._baseLayerArray.push(this._highlightLayer);

        this._switch3D(this._use3D);
    }

    _switch3D(use3D) {
        this._3dLayerArray.forEach(function(layer) {
            layer._switch3D(use3D);
        });
    }

    _updateLocator(locator) {
        if (locator && locator._isBleReady() && this._debugBeacon) {
            this._debugBeaconLayer._setLocatingBeaconData(locator._biteMe('_getLocatingBeaconGeojson'));
        }
    }

    _updateDebugBeacon(data) {
        if (this._debugBeacon) {
            this._debugBeaconLayer._setScannedBeaconData(data.debugData);
            this._debugBeaconLayer._setLocationData(data.debugLocation);
        }
    }

    switchLanguage(options) {
        this._labelIconLayerArray.forEach(function(layer) {
            layer.switchLanguage(options);
        });
    }

    _setLabelIconVisibleRange(minZoom, maxZoom) {
        this._labelIconLayerArray.forEach(function(layer) {
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
        this._labelIconLayerArray.forEach(function(layer) {
            layer.setFont(fontName);
        });
    }

    _updateFontIconSize(minZoom) {
        this._labelIconLayerArray.forEach(function(layer) {
            layer._updateFontIconSize(minZoom);
        });
    }

    hideLayers() {
        this._baseLayerArray.forEach(function(layer) {
            layer.hide();
        });
    }

    showLayers() {
        this._baseLayerArray.forEach(function(layer) {
            layer.show();
        });
    }

    _setMaskingData(data) {
        this._maskingLayer._setMaskingData(data);
    }

    _highlightPoi(pois, options) {
        if (options && options.masking) {
            this._maskingLayer.show();
        } else {
            this._maskingLayer.hide();
        }
        this._highlightLayer._highlightPoi(pois, options);
    }

    _resetHighlight() {
        this._highlightLayer._resetHighlight();
        this._maskingLayer.hide();
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
        this._baseLayerArray.forEach(function(layer) {
            layer._setMapInfo(mapInfo);
        });
    }

    _showLocation(location) {
        this._locationLayer._showLocation(location);
    }

    _showLocations(locations) {
        this._locationLayer._showLocations(locations);
    }

    _hideLocation() {
        this._locationLayer._hideLocation();
    }

    getLayerIDs(subLayer) {
        if (subLayer === 'floor') return this._floorLayer._getLayerIDs();
        if (subLayer === 'room') return this._roomLayer._getLayerIDs();
        if (subLayer === 'asset') return this._assetLayer._getLayerIDs();
        if (subLayer === 'facility') return this._facilityLayer._getLayerIDs();
        if (subLayer === 'label') return this._labelLayer._getLayerIDs();
        if (subLayer === 'extrusion') return this._extrusionLayer._getLayerIDs();
    }

    _hideLabels() {
        this._facilityLayer.hide();
        this._labelLayer.hide();
    }
}

export default indoor_layers;

