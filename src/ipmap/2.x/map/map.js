// @flow
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
    ThemeData,
    HostUtils,
    wt_wgs84_converter as WtWgs84Converter
} from '../../dependencies.js';
import type {
    PointLikeType,
    CallbackType
} from '../../dependencies.js';
import {BoxMap, CacheVersion, TileCacheDB, GlyphCacheDB} from '../inherit';

import {getCBMPath, getThemePbfPath, getTilePath} from '../data/path_manager';

import {
    calculateMaxBounds,
    calculateFullVisibleBounds,
    calculateZoomForMaxBounds as CalculateZoomForMaxBounds,
    calculateZoomForFullVisibleBounds as CalculateZoomForFullVisibleBounds
} from '../utils/ip_zoom_calc';

import {locator as IndoorLocator} from '../locator/locator';
import {web_gps_updater} from '../locator/web_gps_updater';

import {getStyle, getSpritePath} from '../config/default_style';
import {orientation_handler as OrientationHandler} from '../motion/orientation_handler';
import {motion_handler as MotionHandler} from '../motion/motion_handler';

import {popup_manager as PopupManager} from '../popup/popup_manager';
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
    fadeDuration: 0,

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
    constructor(options: Object) {
        // console.log('IPMap.constructor');
        // console.log('Version: ' + version);
        options = extend({}, defaultOptions, options);
        if (options._cbmPath == null) options._cbmPath = defaultHostUtils.getHttpHost() + options._apiPath + '/web/GetCBM';
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

        this._cbmReady = false;
        this.themeID = options.themeID;
        this.__useCustomTheme = (this.themeID != null);
        this._themeReady = false;
        this._themeFailed = false;

        this._debugBeacon = options._debugBeacon;
        this._enableOrientation = options.enableOrientation;
        this._enableMotion = options.enableMotion;

        if (options.floorID != null) this._targetFloor = options.floorID;

        this._firstLoad = true;

        this._use3D = options.use3D;
        this._useFile = options._useFile;

        this._routePopupInteraction = true;
        this.styleReady = false;
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

        this._highlighted = [];
        this._hiddenLabels = [];

        let map = this;
        this.resourceBuildingID = this.buildingID;

        this._msRouteManager = new IPMultiStopRouteManager(options);
        this._popupManager = new PopupManager(this);

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
            // console.log('on style.load');
            map.styleReady = true;
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

        if (map.__useCustomTheme) {
            map._requestTheme();
        } else {
            map._themeReady = true;
        }
        map._requestCBM();
    }

    enableRoutePopupInteraction(enabled: boolean) {
        this._routePopupInteraction = !!enabled;
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

    showLocation(location: PointLikeType, options: Object) {
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

    showLocations(locations: Array<PointLikeType>) {
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

    didRangeBeacons(beacons: Array<Object>): Object {
        let data = this._locator._didRangeBeacons(beacons);
        if (data == null) return data;

        let result: Object = {
            location: data.location,
            maxRssi: data.maxRssi
        };

        if (this._debugBeacon) {
            result.minAccuracy = data.minAccuracy;
            result.maxIndex = data.maxIndex;
            result.totalWeighting = data.totalWeighting;
            result.beaconList = data.beaconList;
            result.beaconPool = data.beaconPool;
            this._layerManager.showDebugSignals(data);
        }
        return result;
    }

    getLocation(): LocalPoint {
        return this._locator.getLocation();
    }

    switch3D(use3D: boolean) {
        this._layerManager._switch3D(use3D);
    }

    showRoute(location: LocalPoint, segment: number) {
        // console.log('showRoute');
        let map = this;
        map._layerManager.showRoute(map._routeResult, location, segment);
        map._popupManager.showRoutePopup(map._routeResult);
    }

    resetRoute() {
        let map = this;
        map.hideRoute();
        map._routeResult = null;
    }

    hideRoute() {
        let map = this;
        map._layerManager.hideRoute();
        map._popupManager.hideRoutePopup();
    }

    __requestRoute(start: PointLikeType, end: PointLikeType, stops: Array<PointLikeType>, callback: CallbackType, errorCallback: CallbackType, params: Object) {
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

    requestRoute(start: PointLikeType, end: PointLikeType, arg3: any, arg4: any, arg5: any, arg6: any) {
        // console.log('requestRoute');
        // console.log(stops);
        if (arg3.constructor === Array) {
            this.__requestRoute(start, end, arg3, arg4, arg5, arg6);
        } else {
            this.__requestRoute(start, end, [], arg3, arg4, arg5);
        }
    }

    setRouteColor(color1: string, color2: string, color3: string) {
        this._layerManager._setRouteColor(color1, color2, color3);
    }

    _requestTheme() {
        // console.log('_requestTheme');
        let url = getThemePbfPath(this.themeID, this._options);

        ThemeData.fetchTheme({url: url}, (data) => {
            this._themeReady = true;
            this._themeData = data;
            let fillSymbols = IPFillSymbol.getFillSymbolArray(data['FillSymbols']);
            let iconTextSymbols = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
            this.customTheme = new Theme({
                themeID: data.themeID,
                themeName: data.themeName,
                spriteName: data.spriteName,
                FillSymbols: fillSymbols,
                IconTextSymbols: iconTextSymbols
            });
            this._init();
        }, (error) => {
            this._themeReady = true;
            this._themeFailed = true;
            this._init();
        });
    }

    _requestCBM() {
        // console.log('requestCBM');
        let url = getCBMPath(this.resourceBuildingID, this._options);

        CBMData.fetchCBM({url: url, usePbf: this._options.usePbf}, (data) => {
            // console.log('cbmReady');
            this._cbmReady = true;
            this._cbmData = data;
            let fillSymbols = IPFillSymbol.getFillSymbolArray(data['FillSymbols']);
            let iconTextSymbols = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
            this.defaultTheme = new Theme({
                themeID: 'built-in',
                themeName: 'built-in',
                spriteName: this._options.spriteName,
                FillSymbols: fillSymbols,
                IconTextSymbols: iconTextSymbols
            });
            this._init();
        }, (error) => {
            this.fire(MapEvent.Error, error);
        });
    }

    _useTheme(theme: Theme) {
        this.theme = theme;
        this._layerManager = new LayerManager(this._layerSymbolMap, this.theme, {
            map: this,
            buildingID: this.buildingID,
            tilePath: getTilePath(this.resourceBuildingID, this._options),
            baseZoom: this.getBaseZoom(),
            initBounds: this._initBounds,
            use3D: this._use3D,
            debugBeacon: this._debugBeacon
        });
        this._options.wtStyle.layers = this._layerManager.prepareStyleLayers();
        this._options.wtStyle.sources = this._layerManager.prepareStyleSources();
        this._options.wtStyle.sprite = getSpritePath(this._options._apiHost, this._options._resourceRootDir, this.theme.spriteName);
        this.setStyle(this._options.wtStyle);
    }

    setTheme(options: Object) {
        let themeID = options && options.themeID;
        if (themeID == null) {
            // console.log('themeID is null');
            this._useTheme(this.defaultTheme);
            return;
        }

        let url = getThemePbfPath(themeID, this._options);

        ThemeData.fetchTheme({url: url}, (data) => {
            let fillSymbols = IPFillSymbol.getFillSymbolArray(data['FillSymbols']);
            let iconTextSymbols = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
            let newTheme = new Theme({
                themeID: data.themeID,
                themeName: data.themeName,
                spriteName: data.spriteName,
                FillSymbols: fillSymbols,
                IconTextSymbols: iconTextSymbols
            });
            this._useTheme(newTheme);
        }, (error) => {
            this.fire(MapEvent.Error, {'description': 'Theme data failed: ' + themeID});
        });

    }

    _init() {
        if (!this._themeReady || !this._cbmReady) return;
        let data = this._cbmData;

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
        // console.log('CacheVersion: ' + CacheVersion.getVersionName());

        map._wtWgs84Converter = new WtWgs84Converter(map.building.wgs84CalibrationPoint, map.building.wtCalibrationPoint);
        map.mapInfoArray = IPMapInfo.getMapInfoArray(data['MapInfo']);
        map._layerSymbolMap = data['Symbols'];
        map._msRouteManager.setBM(map.building, map.mapInfoArray);

        // console.log('initBounds');
        // console.log(initBounds);

        let buildingExtent = map.building.buildingExtent;
        let initBounds = this._initBounds = buildingExtent.getExtendedBounds2(0.05);
        this._baseZoom = CalculateZoomForFullVisibleBounds(initBounds, this._canvas.width, this._canvas.height);

        let theme = (this.__useCustomTheme && !this._themeFailed) ? this.customTheme : this.defaultTheme;
        this._useTheme(theme);

        map._gpsManager = new web_gps_updater(map._wtWgs84Converter);

        map._locator = new IndoorLocator(map.building.buildingID, map._options, map._wtWgs84Converter);
        map._locator.on(InnerLocatorEvent.LocatorReady, function(event) {
            // console.log('inner-locator-ready');
            map.showDebugBeacon();
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

    showDebugBeacon() {
        if (this._debugBeacon) {
            this._layerManager.showDebugBeacons(this._locator);
        }
    }

    getGpsManager(): web_gps_updater {
        return this._gpsManager;
    }

    startLocating() {
        this._locator && this._locator.start();
    }

    stopLocating() {
        this._locator && this._locator.stop();
    }

    getBaseZoom(): number {
        return this._baseZoom;
    }

    setBackgroundColor(color: string) {
        this.setPaintProperty('background', 'background-color', color);
    }

    setBackgroundOpacity(opacity: number) {
        this.setPaintProperty('background', 'background-opacity', opacity);
    }

    _setFloor(floor: any, options: Object = {}, callback: ?CallbackType, errorCallback: ?CallbackType) {
        let map = this;
        map._targetFloor = floor;

        let targetInfo = IPMapInfo.searchMapInfo(this.mapInfoArray, floor);
        if (targetInfo == null) {
            this.fire(MapEvent.Error, {'description': 'Floor not exist: ' + floor});
            errorCallback && errorCallback({'description': 'Floor not exist: ' + floor});
            return;
        }

        if (targetInfo.floorNumber === map.currentMapInfo.floorNumber) return;
        map._loadFloorData({mapInfo: targetInfo}, options, callback);
    }

    setFloor(floor: any, options: ?Object = {}, callback: ?CallbackType, errorCallback: ?CallbackType) {
        if (typeof options === 'object') {
            this._setFloor(floor, options, callback, errorCallback);
        } else {
            this._setFloor(floor, {}, options, callback);
        }
    }

    _loadFloorData(result: Object, options: Object, callback: ?CallbackType) {
        // console.log('_loadFloorData');
        let map = this;
        map.fire(MapEvent.FloorStart, {});
        map.currentMapInfo = result.mapInfo;

        map._layerManager.setMapInfo(result.mapInfo);

        requestAnimationFrame(function() {
            let maxBounds = result.mapInfo.getExtendedBounds2(0.05);
            let fullVisibleBounds = calculateFullVisibleBounds(maxBounds, map._canvas.width, map._canvas.height);
            let fullVisibleZoom = CalculateZoomForFullVisibleBounds(maxBounds, map._canvas.width, map._canvas.height);
            map.setMaxBounds(fullVisibleBounds);
            map.setMinZoom(fullVisibleZoom);

            let auto = true;
            if (options.auto != null) auto = !!options.auto;
            if (options.center != null || options.zoom != null || options.pitch != null || options.bearing != null) auto = false;

            let params = {};
            params.auto = auto;
            params.center = auto ? map.currentMapInfo.getCenter().getLngLat() : ((options.center != null) ? options.center : map.getCenter());
            params.zoom = auto ? fullVisibleZoom : ((options.zoom != null) ? options.zoom : map.getZoom());
            params.pitch = auto ? 0 : ((options.pitch != null) ? options.pitch : map.getPitch());
            params.bearing = auto ? 0 : ((options.bearing != null) ? options.bearing : map.getBearing());
            params.duration = ((options.duration != null) ? options.duration : 1000);

            let animated = !!options.animated;
            if (animated) {
                map.easeTo(params);
            } else {
                map.jumpTo(params);
            }

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

    switchLanguage(options: Object) {
        this._layerManager.switchLanguage(options);
    }

    setFont(fontName: string) {
        this._layerManager.setFont(fontName);
    }

    getFloorInfoArray(): Array<IPMapInfo> {
        return this.mapInfoArray;
    }

    getLayerIDs(subLayer: string): Array<string> {
        return this._layerManager.getLayerIDs(subLayer);
    }

    getAllLayerIDs(): Array<string> {
        return this._layerManager.getAllLayerIDs();
    }

    getFirstLayerID(subLayer: string): ?string {
        return this._layerManager.getFirstLayerID(subLayer);
    }

    getLastLayerID(subLayer: string): ?string {
        return this._layerManager.getLastLayerID(subLayer);
    }

    getNextLayerID(layerID: ?string): ?string {
        return this._layerManager.getNextLayerID(layerID);
    }

    showLabelLayers() {
        this._layerManager._showLabelLayers();
    }

    hideLabelLayers() {
        this._layerManager._hideLabelLayers();
    }

    hideLabels(pois: Array<string>) {
        console.log('hideLabels');
        console.log(pois);
        this.resetHidingLabels();

        let poiList = [].concat(pois);
        for (let i = 0; i < poiList.length; ++i) {
            let poiID = poiList[i];
            let featureID = parseInt(poiID.substring(11));
            this._hiddenLabels.push(featureID);
            this.setFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'label',
                id: featureID
            }, {
                hidden: true
            });
            this.setFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'facility',
                id: featureID
            }, {
                hidden: true
            });
        }
    }

    resetHidingLabels() {
        for (let i = 0; i < this._hiddenLabels.length; ++i) {
            this.removeFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'label',
                id: this._highlighted[i]
            });
            this.removeFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'facility',
                id: this._highlighted[i]
            });
        }
        this._highlighted = [];
    }

    showFillLayers() {
        this._layerManager.floorLayer.show(this);
        this._layerManager.roomLayer.show(this);
        this._layerManager.assetLayer.show(this);
    }

    hideFillLayers() {
        this._layerManager.floorLayer.hide(this);
        this._layerManager.roomLayer.hide(this);
        this._layerManager.assetLayer.hide(this);
    }

    showExtrusionLayer() {
        this._layerManager.extrusionLayer.show(this);
    }

    hideExtrusionLayer() {
        this._layerManager.extrusionLayer.hide(this);
    }

    highlightPoi(pois: Array<string>, options: Object) {
        // console.log('highlightPoi');
        // console.log(pois);
        // console.log(options);
        this.clearHighlight();

        let highlightColor = '#00ffff';
        if (options && options.color) {
            highlightColor = options.color;
        }

        let poiList = [].concat(pois);
        for (let i = 0; i < poiList.length; ++i) {
            let poiID = poiList[i];
            let featureID = parseInt(poiID.substring(11));
            this._highlighted.push(featureID);
            this.setFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'fill',
                id: featureID
            }, {
                highlight: true,
                'highlight-color': highlightColor
            });
        }
    }

    clearHighlight() {
        for (let i = 0; i < this._highlighted.length; ++i) {
            this.removeFeatureState({
                source: 'innerpeacer',
                sourceLayer: 'fill',
                id: this._highlighted[i]
            });
        }
        this._highlighted = [];
    }
}

export {IPMap};
