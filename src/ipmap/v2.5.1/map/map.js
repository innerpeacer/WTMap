import {BoxMap, CacheVersion, TileCacheDB, GlyphCacheDB} from '../config/inherit'

import {version} from '../config/config'
import IPCity from '../entity/city'
import IPBuilding from '../entity/building'
import IPMapInfo from '../entity/mapinfo'
import {fill_symbol as IPFillSymbol, icon_text_symbol as IPIconTextSymbol} from "../entity/symbol";

import IPDataManager from '../data/data_manager'

import IPMultiStopRouteManager from '../route/multi_stop_route_manager'

import IPEntityUtils from '../entity/entity_utils'

import IndoorLayers from '../layers/indoor_layers'
import CoordProjection from '../utils/coord_projection'
import CalculateZoomForMaxBounds from '../utils/ip_zoom_calc'

import IndoorLocator from '../locator/locator'

import defaultStyle from '../config/default_style'
import {clone} from "../utils/ip_util";
// function getBrtStylePath(options) {
//     return `${options._apiHost}/${options._resourceRootDir}/style/${version}/wt-style.json`;
// }

class IPMap extends BoxMap {
    constructor(options) {
        super(options);

        // console.log('IPMap.constructor');
        // console.log('Version: ' + version);
        let defaultHost = window.location.protocol + "//" + window.location.host;

        if (options._apiHost == null) options._apiHost = defaultHost;
        if (options._apiPath == null) options._apiPath = 'WTMapService';

        if (options._apiRouteHost == null) options._apiRouteHost = defaultHost;
        if (options._apiRoute == null) options._apiRoute = 'WTRouteService';

        if (options._cbmPath == null) options._cbmPath = defaultHost + options._apiPath + '/web/GetCBM';

        if (options._resourceRootDir == null) options._resourceRootDir = 'WTMapResource';
        if (options._mDataRoot == null) options._mDataRoot = options._resourceRootDir + '/mapdata';

        // options.style = getBrtStylePath(options);
        options.style = clone(defaultStyle);
        options.style.sprite = options._apiHost + options.style.sprite;
        options.style.glyphs = options._apiHost + options.style.glyphs;
        if (options.sprite != null) options.style.sprite = options.sprite;
        if (options.glyphs != null) options.style.glyphs = options.glyphs;

        if (options.brtStyle != null) options.style = options.brtStyle;
        if (options.localIdeographFontFamily == null) options.localIdeographFontFamily = false;

        if (options.maxZoom == null) options.maxZoom = 22;
        if (options._useFile == null) options._useFile = true;
        if (options.use3D == null) options.use3D = true;
        if (options.usePbf == null) options.usePbf = true;
        if (options._debugBeacon == null) options._debugBeacon = false;
        this._debugBeacon = options._debugBeacon;

        let dataVersion = null;
        let disableCache = false;
        if (options._dataVersion != null) dataVersion = options._dataVersion;
        if (options._disableCache != null) disableCache = options._disableCache;

        this.buildingID = options.buildingID;
        if (this.buildingID == null) {
            this.fire('error', {'description': 'buildingID is null'});
            return;
        }

        super(options);
        this._options = options;

        if (options.floorID != null) this._targetFloorID = options.floorID;

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

        this.__abort = false;

        let map = this;
        this.resourceBuildingID = this.buildingID;
        options._dataRootDir = options._mDataRoot;


        this._msRouteManager = new IPMultiStopRouteManager(options);
        this._msRouteManager.on('route-result', function (result) {
            map.__routeReady(result);
        });
        this._msRouteManager.on('route-error', function (error) {
            map.__routeError(error);
        });

        this._dataManager = new IPDataManager(this.resourceBuildingID, options);
        this.on('inner-cbm-ready', this.__cbmReady);
        this._dataManager.on('cbm-ready', function (data) {
            map.fire('inner-cbm-ready', data);
        });

        this._dataManager.on('cbm-error', function (error) {
            // console.log('cbm-error');
            map.fire('error', error);
        });

        if (dataVersion) {
            CacheVersion.useVersion(dataVersion);
        }
        TileCacheDB.init();
        GlyphCacheDB.init();
        if (disableCache) {
            TileCacheDB.disable();
            GlyphCacheDB.disable();
        }
        console.log('CacheVersion: ' + CacheVersion.getVersionName());

        this.on('load', function () {
            // console.log('on load');
            if (map.__abort) {
                map.fire('error', {'description': 'Invalid Token: ' + options.token + ' for ' + options.buildingID});
                return;
            }
            map._requestCBM();
        });

        this._locator = new IndoorLocator(this.buildingID, options);
        this._locator.on('inner-locator-ready', function () {
            // console.log('inner-locator-ready');
            if (map._layerGroup) map._layerGroup._updateLocator(map._locator);
            map.fire('locator-ready');
        });
        this._locator.on('inner-locator-failed', function (error) {
            // console.log('inner-locator-failed');
            map.fire('locator-failed', error);
        });
    }

    showLocation(location, options) {
        // console.log('indoor_layer.showLocation');
        let loc = {};
        if (location.lng && location.lat) {
            loc = {lng: location.lng, lat: location.lat};
        } else if (location.x && location.y) {
            loc = CoordProjection.mercatorToLngLat(location.x, location.y);
        } else {
            return;
        }
        loc.properties = {
            floor: location.floor
        };
        let map = this;
        let targetFloor = location.floor;
        this.location = loc;
        this._layerGroup._showLocation(this.location, options);
        if (options && options.center) {
            if (targetFloor && targetFloor !== map.currentMapInfo.floorNumber) {
                map._setFloorNumber(map.location.properties.floor, function () {
                    map.easeTo({center: map.location});
                });
            } else {
                map.easeTo({center: map.location});
            }
        }
    };

    didRangeBeacons(beacons) {
        let data = this._locator._didRangeBeacons(beacons);
        if (data == null) return data;

        let result = {
            location: data.location,
            maxRssi: data.maxRssi,
        };

        if (this._debugBeacon) {
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

    __routeError(error) {
        if (this._outerRouteErrorCallback != null) {
            this._outerRouteErrorCallback(error);
        }
    }

    __routeReady(result) {
        this._routeResult = result;
        // console.log(result);
        if (this._outerRouteCallback != null) this._outerRouteCallback({
            startPoint: result.startPoint,
            endPoint: result.endPoint,
            stopPoints: result.stopPoints,
            rearrangedPoints: result.rearrangedPoints,
            indices: result.indices,
            completeResult: result.completeResult,
            detailedResult: result.detailedResult
        });
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
        this._outerRouteCallback = callback;
        this._outerRouteErrorCallback = errorCallback;
        this._msRouteManager.getRouteData(start, end, stops, callback, errorCallback, params);
    }

    requestRoute(start, end, arg3, arg4, arg5, arg6) {
        // console.log('requestRoute');
        // console.log(stops);
        if (arg3.constructor == Array) {
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
        if (this._options.usePbf) {
            this._dataManager.getCBMPbf();
        } else {
            this._dataManager.getCBM();
        }
    }

    __cbmReady(data) {
        // console.log('cbmReady');
        let map = this;
        map.city = new IPCity(data['Cities'][0]);
        map.building = new IPBuilding(data['Buildings'][0]);
        map.mapInfoArray = IPMapInfo.getMapInfoArray(data['MapInfo']);
        map._fillSymbolArray = IPFillSymbol.getFillSymbolArray(data['FillSymbols']);
        map._fillSymbolArray.forEach(function (fill, index) {
            map._fillSymbolMap[fill.UID] = fill;
        });
        map._iconTextSymbolArray = IPIconTextSymbol.getIconTextSymbolArray(data['IconTextSymbols']);
        map._iconTextSymbolArray.forEach(function (iconText, index) {
            map._iconTextSymbolMap[iconText.UID] = iconText;
        });
        map._layerSymbolMap = data['Symbols'];
        map._msRouteManager.setBM(map.building, map.mapInfoArray);
        // let facilityList = data['Symbols']['facility'];
        // console.log('============== Facility ================');
        // for (let i = 0; i < facilityList.length; ++i) {
        //     let uid = facilityList[i];
        //     let symbol = map._iconTextSymbolMap[uid];
        //     console.log(symbol.UID + ': ' + symbol.symbolID);
        // }

        let initInfo = map.mapInfoArray[0];
        // console.log('initBounds');
        // console.log(initBounds);

        // let initBounds = IPEntityUtils.extendedBounds2(initInfo, 0.2);
        let maxInfo = new IPMapInfo(data['MapInfo'][0]);
        for (let i = 0; i < map.mapInfoArray.length; ++i) {
            let info = map.mapInfoArray[i];
            maxInfo.mapExtent.xmin = Math.min(info.mapExtent.xmin, maxInfo.mapExtent.xmin);
            maxInfo.mapExtent.ymin = Math.min(info.mapExtent.ymin, maxInfo.mapExtent.ymin);
            maxInfo.mapExtent.xmax = Math.max(info.mapExtent.xmax, maxInfo.mapExtent.xmax);
            maxInfo.mapExtent.ymax = Math.max(info.mapExtent.ymax, maxInfo.mapExtent.ymax);
        }

        let initBounds = IPEntityUtils.extendedBounds2(maxInfo, 0.2);
        this._baseZoom = CalculateZoomForMaxBounds(initBounds, this._canvas.width, this._canvas.height);
        map.addSource('innerpeacer', {
            'tiles': map._dataManager.getTilePath(),
            'type': 'vector',
            'bounds': initBounds
        });
        map._layerGroup = new IndoorLayers(map, map._use3D);
        map._layerGroup._updateLocator(map._locator);
        map.fire('mapready');

        if (this._targetFloorID != null) {
            map.setFloor(this._targetFloorID);
        } else {
            let initFloorIndex = map.building.initFloorIndex;
            map.setFloor(map.mapInfoArray[initFloorIndex].mapID);
        }
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

    _setFloorNumber(floor, outerCallback) {
        let map = this;
        map._outerFloorCallback = outerCallback;

        let targetInfo = this._getInfoByFloorNumber(floor);
        if (targetInfo == null) {
            map.fire('error', {'description': 'Floor not exist: ' + floor});
            return;
        }
        map._loadFloorData({mapInfo: targetInfo}, {rezoom: false});
    }

    setFloor(floorID, outerCallback) {
        // console.log('setFloor: ' + floorID);
        let map = this;
        map._targetFloorID = floorID;
        map._outerFloorCallback = outerCallback;

        let targetInfo = this._getInfoByFloorID(floorID);
        if (targetInfo == null) {
            map.fire('error', {'description': 'FloorID not exist: ' + floorID});
            return;
        }

        map._loadFloorData({mapInfo: targetInfo});
    }

    _loadFloorData(result, options) {
        // console.log('_loadFloorData');
        let map = this;
        map.fire('floorstart', {});
        // map._layerGroup.hideLayers();
        map.currentMapInfo = result.mapInfo;

        map._layerGroup._updateMapInfo(result.mapInfo);
        if (map._debugBeacon && map._debugBeaconLayer) map._debugBeaconLayer._setMapInfo(result.mapInfo);

        requestAnimationFrame(function () {
            let c = map.currentMapInfo.getCenter();
            // console.log('requestAnimationFrame');
            // console.log(c);
            let lngLat = CoordProjection.mercatorToLngLat(c.x, c.y);

            let maxBounds = IPEntityUtils.extendedBounds(result.mapInfo, 0.2);
            map.setMaxBounds(maxBounds);

            map.setCenter([lngLat.lng, lngLat.lat]);
            if (options && options.rezoom) map.setZoom(10);

            if (map._firstLoad) {
                map.setMaxZoom(Math.min(map._baseZoom + 4, 22));
                map._firstLoad = false;
            }

            map.fire('floorend', {mapInfo: result.mapInfo});

            if (map._outerFloorCallback != null) {
                map._outerFloorCallback();
                map._outerFloorCallback = null;
            }
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

    _getInfoByFloorID(floorID) {
        let infoArray = this.mapInfoArray;
        for (let i = 0; i < infoArray.length; ++i) {
            let mapInfo = infoArray[i];
            if (mapInfo.mapID === floorID) return mapInfo;
        }
        return null;
    }

    _getInfoByFloorNumber(floor) {
        let infoArray = this.mapInfoArray;
        for (let i = 0; i < infoArray.length; ++i) {
            let mapInfo = infoArray[i];
            if (mapInfo.floorNumber == floor) return mapInfo;
        }
        return null;
    }
}

export default IPMap;
