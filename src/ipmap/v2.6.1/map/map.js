import {
    extend,
    city as IPCity,
    building as IPBuilding,
    local_point as LocalPoint,
    mapinfo as IPMapInfo,
    fill_symbol as IPFillSymbol, icon_text_symbol as IPIconTextSymbol,
    MultiStopRouteManager as IPMultiStopRouteManager, RouteEvent,
    CBMData,
} from "../../dependencies.js";
import {BoxMap, CacheVersion, TileCacheDB, GlyphCacheDB} from '../config/inherit'

import {getCBMPath, getTilePath} from "../data/path_manager"

import IndoorLayers from '../layers/indoor_layers'
import WtWgs84Converter from '../utils/wt_wgs84_converter'
import CalculateZoomForMaxBounds from '../utils/ip_zoom_calc'

import IndoorLocator from '../locator/locator'

import {getStyle} from '../config/default_style'
import {orientation_handler as OrientationHandler} from '../motion/orientation_handler';
import {motion_handler as MotionHandler} from "../motion/motion_handler";

import EventManager from "../utils/event_manager"

let MapEvent = EventManager.MapEvent;
let LocatorEvent = EventManager.LocatorEvent;

import InnerEventManager from "../utils/inner_event_manager"

let InnerLocatorEvent = InnerEventManager.LocatorEvent;

let defaultHost = window.location.protocol + '//' + window.location.host;
const defaultOptions = {
    _apiHost: defaultHost,
    _apiRouteHost: defaultHost,

    _apiPath: "WTMapService",
    _apiRoute: "WTRouteService",
    _resourceRootDir: "WTMapResource",

    localIdeographFontFamily: false,
    // maxZoom: 22,

    usePbf: true,
    enableMotion: false,
    enableOrientation: false,

    // _dataVersion: null,
    _disableCache: false,

    _useFile: true,
    _debugBeacon: false,

    __disableGps: false,
};

class IPMap extends BoxMap {
    constructor(options) {
        // console.log('IPMap.constructor');
        // console.log('Version: ' + version);
        options = extend({}, defaultOptions, options);
        if (options._cbmPath == null) options._cbmPath = defaultHost + options._apiPath + '/web/GetCBM';
        if (options._mDataRoot == null) options._mDataRoot = options._resourceRootDir + '/mapdata';
        options.style = getStyle(options._apiHost, options.sprite, options.glyphs);

        super(options);
        this._options = options;

        // let dataVersion = options._dataVersion;
        this.__disableCache = options._disableCache;

        this.buildingID = options.buildingID;
        if (this.buildingID == null) {
            this.fire(MapEvent.Error, {'description': 'buildingID is null'});
            return;
        }

        this._debugBeacon = options._debugBeacon;
        this._enableOrientation = options.enableOrientation;
        this._enableMotion = options.enableMotion;

        if (options.floorID != null) this._targetFloor = options.floorID;

        this._firstLoad = true;

        this._use3D = options.use3D;
        this._useFile = options._useFile;

        this.city = null;
        this.building = null;
        this.mapInfoArray = null;
        this.currentMapInfo = null;
        this._fillSymbolArray = [];
        this._fillSymbolMap = {};
        this._iconTextSymbolArray = [];
        this._iconTextSymbolMap = {};
        this._layerSymbolMap = {};
        this._resourceBuildingID = null;
        this._wtWgs84Converter = null;
        this.__abort = false;

        let map = this;
        this.resourceBuildingID = this.buildingID;
        options._dataRootDir = options._mDataRoot;


        this._msRouteManager = new IPMultiStopRouteManager(options);

        // if (dataVersion) {
        //     CacheVersion.useVersion(dataVersion);
        // }
        // TileCacheDB.init();
        // GlyphCacheDB.init();
        // if (disableCache) {
        //     TileCacheDB.disable();
        //     GlyphCacheDB.disable();
        // }
        // console.log('CacheVersion: ' + CacheVersion.getVersionName());

        this.on('load', function () {
            // console.log('on load');
            if (map.__abort) {
                map.fire(MapEvent.Error, {'description': 'Invalid Token: ' + options.token + ' for ' + options.buildingID});
                return;
            }
            map._requestCBM();
        });

        this._orientationHandler = new OrientationHandler(this);
        if (this._enableOrientation) this._orientationHandler.bind();

        this._motionHandler = new MotionHandler(this);
        if (this._enableMotion) this._motionHandler.bind();
    }

    enableOrientation() {
        this._orientationHandler && this._orientationHandler.bind();
    }

    disableOrientation() {
        console.log("disableOrientation");
        this._orientationHandler && this._orientationHandler.unbind();
    }

    enableMotion() {
        this._motionHandler && this._motionHandler.bind();
    }

    disableMotion() {
        this._motionHandler && this._motionHandler.unbind();
    }

    showLocation(location, options) {
        // console.log('indoor_layer.showLocation');
        let loc = {};
        if (location && location.lng && location.lat) {
            loc = LocalPoint.fromLngLat(location);
        } else if (location && location.x && location.y) {
            loc = LocalPoint.fromXY(location);
        } else {
            return;
        }
        let angle = -1 * (options && options.angle) || 0;
        loc.properties = {
            angle: angle,
            floor: location.floor
        };
        let map = this;
        let targetFloor = location.floor;
        this.location = loc;
        this._layerGroup._showLocation(this.location, options);
        if (options && options.center) {
            if (targetFloor && targetFloor !== map.currentMapInfo.floorNumber) {
                map.setFloor(map.location.properties.floor, function () {
                    map.easeTo({center: map.location});
                });
            } else {
                map.easeTo({center: map.location});
            }
        }
    };

    hideLocation() {
        this._layerGroup._hideLocation();
    }

    didRangeBeacons(beacons) {
        let data = this._locator._didRangeBeacons(beacons);
        if (data == null) return data;

        let result = {
            location: data.location,
            maxRssi: data.maxRssi,
        };

        if (this._debugBeacon) {
            result.minAccuracy = data.minAccuracy;
            result.maxIndex = data.maxIndex;
            result.totalWeighting = data.totalWeighting;
            result.beaconList = data.beaconList;
            result.beaconPool = data.beaconPool;
            this._layerGroup._updateDebugBeacon(data);
        }
        return result;
    }

    getLocation() {
        return this._locator.getLocation();
    }

    switch3D(use3D) {
        this._layerGroup._switch3D(use3D);
    }

    showRoute(location, segment) {
        // console.log('showRoute');
        let map = this;
        map._layerGroup.showRoute(map._routeResult, location, segment);
    }

    resetRoute() {
        let map = this;
        map.hideRoute();
        map._routeResult = null;
    }

    hideRoute() {
        let map = this;
        map._layerGroup.hideRoute();
    }

    __requestRoute(start, end, stops, callback, errorCallback, params) {
        // console.log('__requestRoute');
        // console.log(stops);
        this._msRouteManager.getRouteData(start, end, stops, (result) => {
            this._routeResult = result;
            callback && callback({
                startPoint: result.startPoint,
                endPoint: result.endPoint,
                startRoomID: result.startRoomID,
                endRoomID: result.endRoomID,
                stopPoints: result.stopPoints,
                rearrangedPoints: result.rearrangedPoints,
                indices: result.indices,
                completeResult: result.completeResult,
                detailedResult: result.detailedResult
            });
        }, (error) => {
            errorCallback && errorCallback(error);
        }, params);
    }

    requestRoute(start, end, arg3, arg4, arg5, arg6) {
        // console.log('requestRoute');
        // console.log(stops);
        if (arg3.constructor === Array) {
            this.__requestRoute(start, end, arg3, arg4, arg5, arg6);
        } else {
            this.__requestRoute(start, end, [], arg3, arg4, arg5);
        }
    }

    setRouteColor(color1, color2, color3) {
        this._layerGroup._setRouteColor(color1, color2, color3);
    }

    _requestCBM() {
        // console.log('requestCBM');
        let url = getCBMPath(this.resourceBuildingID, this._options);

        CBMData.fetchCBM({url: url, usePbf: this._options.usePbf}, (data) => {
            this.__cbmReady(data);
        }, (error) => {
            this.fire(MapEvent.Error, error);
        });
    }

    __cbmReady(data) {
        // console.log('cbmReady');
        let map = this;
        map.city = new IPCity(data['Cities'][0]);
        map.building = new IPBuilding(data['Buildings'][0]);

        let dataVersion = this.dataVersion = map.building.dataVersion || "1.0";
        if (dataVersion) {
            CacheVersion.useVersion(dataVersion);
        }
        TileCacheDB.init();
        GlyphCacheDB.init();
        if (this.__disableCache) {
            TileCacheDB.disable();
            GlyphCacheDB.disable();
        }
        console.log('CacheVersion: ' + CacheVersion.getVersionName());

        map._wtWgs84Converter = new WtWgs84Converter(map.building.wgs84CalibrationPoint, map.building.wtCalibrationPoint);
        map.mapInfoArray = IPMapInfo.getMapInfoArray(data['MapInfo']);
        map._fillSymbolArray = IPFillSymbol.getFillSymbolArray(data['FillSymbols']);
        map._fillSymbolArray.forEach(function (fill) {
            map._fillSymbolMap[fill.UID] = fill;
        });
        map._iconTextSymbolArray = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
        map._iconTextSymbolArray.forEach(function (iconText) {
            map._iconTextSymbolMap[iconText.UID] = iconText;
        });
        map._layerSymbolMap = data['Symbols'];
        map._msRouteManager.setBM(map.building, map.mapInfoArray);

        // console.log('initBounds');
        // console.log(initBounds);

        let maxInfo = new IPMapInfo(data['MapInfo'][0]);
        for (let i = 0; i < map.mapInfoArray.length; ++i) {
            let info = map.mapInfoArray[i];
            maxInfo.mapExtent.xmin = Math.min(info.mapExtent.xmin, maxInfo.mapExtent.xmin);
            maxInfo.mapExtent.ymin = Math.min(info.mapExtent.ymin, maxInfo.mapExtent.ymin);
            maxInfo.mapExtent.xmax = Math.max(info.mapExtent.xmax, maxInfo.mapExtent.xmax);
            maxInfo.mapExtent.ymax = Math.max(info.mapExtent.ymax, maxInfo.mapExtent.ymax);
        }

        let initBounds = maxInfo.getExtendedBounds2(0.2);
        this._baseZoom = CalculateZoomForMaxBounds(initBounds, this._canvas.width, this._canvas.height);
        map.addSource('innerpeacer', {
            'tiles': getTilePath(this.resourceBuildingID, this._options),
            'type': 'vector',
            'bounds': initBounds
        });
        map._layerGroup = new IndoorLayers(map, map._use3D);
        let maskingBounds = maxInfo.getExtendedBounds2(10);
        let lng1 = maskingBounds[0];
        let lat1 = maskingBounds[1];
        let lng2 = maskingBounds[2];
        let lat2 = maskingBounds[3];
        let maskingData = {
            "type": "FeatureCollection",
            "features": [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [lng1, lat1],
                        [lng2, lat1],
                        [lng2, lat2],
                        [lng1, lat2],
                        [lng1, lat1],
                    ]]
                }
            }]
        };
        map._layerGroup._setMaskingData(maskingData);
        // map._layerGroup._updateLocator(map._locator);
        map.fire(MapEvent.MapReady);

        if (this._targetFloor != null) {
            map.setFloor(this._targetFloor);
        } else {
            let initFloorIndex = map.building.initFloorIndex;
            map.setFloor(map.mapInfoArray[initFloorIndex].mapID);
        }

        map._locator = new IndoorLocator(map.building.buildingID, map._options, map._wtWgs84Converter);
        map._locator.on(InnerLocatorEvent.LocatorReady, function (event) {
            // console.log('inner-locator-ready');
            if (map._layerGroup) map._layerGroup._updateLocator(map._locator);
            map.fire(LocatorEvent.LocatorReady, event);
        });
        map._locator.on(InnerLocatorEvent.LocatorFailed, function (error) {
            // console.log('inner-locator-failed');
            map.fire(LocatorEvent.LocatorFailed, error);
        });
        map._locator.on(InnerLocatorEvent.LocationUpdate, function (res) {
            // console.log("IndoorLocator.LocatorEventTypeUpdate");
            // console.log(res);
            map.fire(LocatorEvent.LocationUpdate, res);
        });
        map._locator.on(InnerLocatorEvent.LocationUpdateFailed, function (error) {
            map.fire(LocatorEvent.LocationUpdateFailed, error);
        });
    }

    startLocating() {
        this._locator && this._locator.start();
    }

    stopLocating() {
        this._locator && this._locator.stop();
    }

    highlightPoi(pois, options) {
        this._layerGroup._highlightPoi(pois, options);
    }

    clearHighlight() {
        this._layerGroup._resetHighlight();
    }

    getBaseZoom() {
        return this._baseZoom;
    }

    setLabelVisibleRange(minZoom, maxZoom) {
        this._layerGroup._setLabelVisibleRange(minZoom, maxZoom);
    }

    setIconVisibleRange(minZoom, maxZoom) {
        this._layerGroup._setIconVisibleRange(minZoom, maxZoom);
    }

    setLabelLayout(property, value) {
        this._layerGroup.setLabelLayout(property, value);
    }

    setLabelPaint(property, value) {
        this._layerGroup.setLabelPaint(property, value);
    }

    setFacilityLayout(propetry, value) {
        this._layerGroup.setFacilityLayout(propetry, value);
    }

    setFacilityPaint(property, value) {
        this._layerGroup.setFacilityPaint(property, value);
    }

    setBackgroundColor(color) {
        this.setPaintProperty('background', 'background-color', color);
    }

    setFloor(floor, callback, errorCallback) {
        // console.log('setFloor: ' + floorID);
        let map = this;
        map._targetFloor = floor;

        let targetInfo = IPMapInfo.searchMapInfo(this.mapInfoArray, floor);
        if (targetInfo == null) {
            map.fire(MapEvent.Error, {'description': 'Floor not exist: ' + floor});
            errorCallback && errorCallback({'description': 'Floor not exist: ' + floor});
            return;
        }

        map._loadFloorData({mapInfo: targetInfo}, null, callback);
    }

    _loadFloorData(result, options, callback) {
        // console.log('_loadFloorData');
        let map = this;
        map.fire(MapEvent.FloorStart, {});
        // map._layerGroup.hideLayers();
        map.currentMapInfo = result.mapInfo;

        map._layerGroup._updateMapInfo(result.mapInfo);
        if (map._debugBeacon && map._debugBeaconLayer) map._debugBeaconLayer._setMapInfo(result.mapInfo);

        requestAnimationFrame(function () {
            let c = map.currentMapInfo.getCenter();
            // console.log('requestAnimationFrame');
            // console.log(c);
            let lngLat = c.getLngLat();

            let maxBounds = result.mapInfo.getExtendedBounds(0.2);
            map.setMaxBounds(maxBounds);

            map.setCenter([lngLat.lng, lngLat.lat]);
            if (options && options.rezoom) map.setZoom(10);

            if (map._firstLoad) {
                if (map._options.maxZoom == null) {
                    map.setMaxZoom(Math.min(map._baseZoom + 4, 22));
                }
                map._firstLoad = false;
            }

            map.fire(MapEvent.FloorEnd, {mapInfo: result.mapInfo});
            callback && callback(result.mapInfo);
        });
    }

    switchLanguage(options) {
        this._layerGroup.switchLanguage(options);
    }

    setFont(fontName) {
        this._layerGroup.setFont(fontName);
    }

    getFloorInfoArray() {
        return this.mapInfoArray;
    }

    getLayerIDs(subLayer) {
        return this._layerGroup.getLayerIDs(subLayer);
    }

    _hideLabels() {
        this._layerGroup._hideLabels();
    }
}

export default IPMap;
