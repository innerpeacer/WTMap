import {
    extend,
    city as IPCity,
    building as IPBuilding,
    local_point as LocalPoint,
    mapinfo as IPMapInfo,
    theme as Theme,
    fill_symbol as IPFillSymbol, icon_text_symbol as IPIconTextSymbol,
    MultiStopRouteManager as IPMultiStopRouteManager, RouteEvent,
    CBMData,
    HostUtils,
    wt_wgs84_converter as WtWgs84Converter
} from '../../dependencies.js';
import {BoxMap, CacheVersion, TileCacheDB, GlyphCacheDB} from '../config/inherit';

import {getCBMPath, getTilePath} from '../data/path_manager';

import {indoor_layers as IndoorLayers} from '../layers/indoor_layers';
import {calculateZoomForMaxBounds as CalculateZoomForMaxBounds} from '../utils/ip_zoom_calc';

import {locator as IndoorLocator} from '../locator/locator';
import {web_gps_updater} from '../locator/web_gps_updater';

import {getStyle} from '../config/default_style';
import {orientation_handler as OrientationHandler} from '../motion/orientation_handler';
import {motion_handler as MotionHandler} from '../motion/motion_handler';

import {event_manager as EventManager} from '../utils/event_manager';

import {layer_manager as LayerManager} from '../layers/manager/layer_manager';

let MapEvent = EventManager.MapEvent;
let LocatorEvent = EventManager.LocatorEvent;

import {inner_event_manager as InnerEventManager} from '../utils/inner_event_manager';

let InnerLocatorEvent = InnerEventManager.LocatorEvent;

let defaultHostUtils = HostUtils.GetDefault();
const defaultOptions = {
    _apiHost: defaultHostUtils.getHttpHost(),
    _apiRouteHost: defaultHostUtils.getHttpHost(),

    _apiPath: 'backend-new',
    _apiRoute: 'map-server',
    _resourceRootDir: 'backend-map/V4',
    spriteName: 'WTMapSprite',

    localIdeographFontFamily: false,
    // maxZoom: 22,

    usePbf: true,
    enableMotion: false,
    enableOrientation: false,

    // _dataVersion: null,
    _disableCache: false,

    _useFile: true,
    _debugBeacon: false,

    __disableGps: true
};

class IPMap extends BoxMap {
    constructor(options) {
        // console.log('IPMap.constructor');
        // console.log('Version: ' + version);
        options = extend({}, defaultOptions, options);
        if (options._cbmPath == null) options._cbmPath = defaultHostUtils.getHttpHost() + options._apiPath + '/web/GetCBM';
        if (options._mDataRoot == null) options._mDataRoot = options._resourceRootDir + '/mapdata';
        if (options._apiRouteHost == null && options._apiHost != null) options._apiRouteHost = options._apiHost;
        options.wtStyle = getStyle(options._apiHost, options._resourceRootDir, options.spriteName);

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

        this.on('style.load', function() {
            console.log('on style.load');
            map.fire(MapEvent.MapReady);

            if (map._targetFloor != null) {
                map.setFloor(this._targetFloor);
            } else {
                let initFloorIndex = map.building.initFloorIndex;
                map.setFloor(map.mapInfoArray[initFloorIndex].mapID);
            }
        });

        this._orientationHandler = new OrientationHandler(this);
        if (this._enableOrientation) this._orientationHandler.bind();

        this._motionHandler = new MotionHandler(this);
        if (this._enableMotion) this._motionHandler.bind();

        map._requestCBM();
    }

    enableOrientation() {
        this._orientationHandler && this._orientationHandler.bind();
    }

    disableOrientation() {
        console.log('disableOrientation');
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
        let loc = LocalPoint.fromObj(location);
        if (!loc) return;
        loc.properties = extend({}, location.properties, {
            floor: location.floor
        });
        if (options && options.angle != null) {
            loc.properties.angle = options.angle;
        }
        let map = this;
        let targetFloor = location.floor;
        this.location = loc;
        this._layerManager.showLocation(this.location, options);
        if (options && options.center) {
            if (targetFloor && targetFloor !== map.currentMapInfo.floorNumber) {
                map.setFloor(map.location.properties.floor, function() {
                    map.easeTo({center: map.location});
                });
            } else {
                map.easeTo({center: map.location});
            }
        }
    };

    showLocations(locations) {
        // console.log('indoor_layer.showLocation');
        if (locations == null) return;
        let lpArray = [];
        for (let i = 0; i < locations.length; ++i) {
            let location = locations[i];
            let lp = LocalPoint.fromObj(location);
            if (lp) {
                lp.properties = extend({}, location.properties, {
                    floor: location.floor
                });
                lpArray.push(lp);
            }
        }
        this._layerManager.showLocations(lpArray);
    };

    hideLocation() {
        this._layerManager.hideLocation();
    }

    didRangeBeacons(beacons) {
        let data = this._locator._didRangeBeacons(beacons);
        if (data == null) return data;

        let result = {
            location: data.location,
            maxRssi: data.maxRssi
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
        this._layerManager._switch3D(use3D);
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

        let dataVersion = this.dataVersion = map.building.dataVersion || '1.0';
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
        map._fillSymbolArray.forEach(function(fill) {
            map._fillSymbolMap[fill.UID] = fill;
        });
        map._iconTextSymbolArray = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
        map._iconTextSymbolArray.forEach(function(iconText) {
            map._iconTextSymbolMap[iconText.UID] = iconText;
        });
        map._layerSymbolMap = data['Symbols'];
        map._msRouteManager.setBM(map.building, map.mapInfoArray);

        // console.log('initBounds');
        // console.log(initBounds);

        let buildingExtent = map.building.buildingExtent;
        let initBounds = buildingExtent.getExtendedBounds2(0.2);
        this._baseZoom = CalculateZoomForMaxBounds(initBounds, this._canvas.width, this._canvas.height);
        map._layerGroup = new IndoorLayers(map, map._use3D);
        // map._layerGroup._updateLocator(map._locator);

        this.defaultTheme = new Theme({
            themeID: 'built-in',
            themeName: 'built-in',
            spriteName: '',
            FillSymbols: map._fillSymbolArray,
            IconTextSymbols: map._iconTextSymbolArray
        });
        this._layerManager = new LayerManager(map._layerSymbolMap, this.defaultTheme, {
            map,
            buildingID: this.buildingID,
            tilePath: getTilePath(this.resourceBuildingID, this._options),
            baseZoom: this.getBaseZoom(),
            initBounds,
            use3D: map._use3D
        });
        this._options.wtStyle.layers = this._layerManager.prepareStyleLayers();
        this._options.wtStyle.sources = this._layerManager.prepareStyleSources();
        this.setStyle(this._options.wtStyle);

        map._gpsManager = new web_gps_updater(map._wtWgs84Converter);

        map._locator = new IndoorLocator(map.building.buildingID, map._options, map._wtWgs84Converter);
        map._locator.on(InnerLocatorEvent.LocatorReady, function(event) {
            // console.log('inner-locator-ready');
            if (map._layerGroup) map._layerGroup._updateLocator(map._locator);
            map.fire(LocatorEvent.LocatorReady, event);
        });
        map._locator.on(InnerLocatorEvent.LocatorFailed, function(error) {
            // console.log('inner-locator-failed');
            map.fire(LocatorEvent.LocatorFailed, error);
        });
        map._locator.on(InnerLocatorEvent.LocationUpdate, function(res) {
            // console.log("IndoorLocator.LocatorEventTypeUpdate");
            // console.log(res);
            map.fire(LocatorEvent.LocationUpdate, res);
        });
        map._locator.on(InnerLocatorEvent.LocationUpdateFailed, function(error) {
            map.fire(LocatorEvent.LocationUpdateFailed, error);
        });
    }

    getGpsManager() {
        return this._gpsManager;
    }

    startLocating() {
        this._locator && this._locator.start();
    }

    stopLocating() {
        this._locator && this._locator.stop();
    }

    getBaseZoom() {
        return this._baseZoom;
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

        map._layerManager.setMapInfo(result.mapInfo);
        if (map._debugBeacon && map._debugBeaconLayer) map._debugBeaconLayer._setMapInfo(result.mapInfo);

        requestAnimationFrame(function() {
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
        this._layerManager.switchLanguage(options);
    }

    setFont(fontName) {
        this._layerManager.setFont(fontName);
    }

    getFloorInfoArray() {
        return this.mapInfoArray;
    }

    getLayerIDs(subLayer) {
        return this._layerManager.getLayerIDs(subLayer);
    }

    showLabels() {
        this._layerManager._showLabels();
    }

    hideLabels() {
        this._hideLabels();
    }

    _hideLabels() {
        this._layerManager._hideLabels();
    }
}

export {IPMap};
