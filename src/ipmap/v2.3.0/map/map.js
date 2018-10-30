// import Map from "../../../mapbox/0.50.0/src/ui/map";
import {BoxMap} from "../config/inherit"

import {version} from "../config/config"
import IPCity from "../entity/city"
import IPBuilding from "../entity/building"
import IPMapInfo from "../entity/mapinfo"

import IPDataManager from "../data/data_manager"

import IPEntityUtils from  "../entity/entity_utils"

import IndoorLayers from "../layers/indoor_layers"
import CoordProjection from "../utils/coord_projection"

function getBrtStylePath(options) {
    return `${options._apiHost}/${options._resourceRootDir}/style/${version}/brt-style.json`;
}

class IPMap extends BoxMap {
    constructor(options) {
        super(options);

        // console.log("IPMap.constructor");
        // console.log("Version: " + version);

        if (options._apiHost == null) options._apiHost = "http://localhost:8112";
        if (options._apiPath == null) options._apiPath = "BrtMapServer";

        if (options._apiRouteHost == null) options._apiRouteHost = "http://localhost:8112";
        if (options._apiRoute == null) options._apiRoute = "TYRouteService";

        if (options._cbmPath == null) options._cbmPath = "http://localhost:8112/BrtMapServer/web/GetCBM";

        if (options._resourceRootDir == null) options._resourceRootDir = "BrtMapResource";
        if (options._mDataRoot == null) options._mDataRoot = options._resourceRootDir + "/mapdata";

        options.style = getBrtStylePath(options);
        if (options.brtStyle != null) options.style = options.brtStyle;

        if (options.maxZoom == null) options.maxZoom = 22;
        if (options._useFile == null) options._useFile = true;
        if (options.use3D == null) options.use3D = true;

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

        this.buildingID = options.buildingID;
        this._resourceBuildingID = null;

        this.__abort = false;

        let map = this;

        this.resourceBuildingID = this.buildingID;
        options._dataRootDir = options._mDataRoot;

        this._dataManager = new IPDataManager(this.resourceBuildingID, options);
        this.on("inner-cbm-ready", this.__cbmReady);
        this._dataManager.on("cbm-ready", function (data) {
            map.fire("inner-cbm-ready", data);
        });

        this._dataManager.on("cbm-error", function (error) {
            // console.log("cbm-error");
            map.fire("error", error);
        });

        this.on("load", function () {
            // console.log("on load");
            if (map.__abort) {
                map.fire("error", {"description": "Invalid Token: " + options.token + " for " + options.buildingID});
                return;
            }
            map._requestCBM();
        });
    }

    _requestCBM() {
        // console.log("requestCBM");
        this._dataManager.getCBM();
    }

    __cbmReady(data) {
        // console.log("cbmReady");
        let map = this;
        map.city = new IPCity(data["Cities"][0]);
        map.building = new IPBuilding(data["Buildings"][0]);
        map.mapInfoArray = IPMapInfo.getMapInfoArray(data["MapInfo"]);
        // map._msRouteManager.setBM(map.building, map.mapInfoArray);

        let initInfo = map.mapInfoArray[0];
        let initBounds = IPEntityUtils.extendedBounds2(initInfo, 0);
        // console.log("initBounds");
        // console.log(initBounds);

        map.addSource("innerpeacer", {
            "tiles": map._dataManager.getTilePath(),
            "type": "vector",
            "bounds": initBounds
        });
        map._layerGroup = new IndoorLayers(map, map._use3D);
        map.setFont("simhei-" + map.building.buildingID);
        map.fire("mapready");

        if (this._targetFloorID != null) {
            map.setFloor(this._targetFloorID);
        } else {
            map.setFloor(map.mapInfoArray[0].mapID);
        }
    }

    setFloor(floorID, outerCallback) {
        // console.log("setFloor: " + floorID);
        let map = this;
        map._targetFloorID = floorID;
        map._outerFloorCallback = outerCallback;

        let infoArray = map.mapInfoArray;
        let targetInfo = null;
        if (floorID != null) {
            for (let i = 0; i < infoArray.length; ++i) {
                let mapInfo = infoArray[i];
                if (mapInfo.mapID === floorID) {
                    targetInfo = mapInfo;
                    break;
                }
            }
        }

        if (targetInfo == null) {
            map.fire("error", {"description": "FloorID not exist: " + floorID});
            return;
        }

        map._loadFloorData({mapInfo: targetInfo});
    }

    _loadFloorData(result) {
        // console.log("_loadFloorData");
        let map = this;
        map.fire("floorstart", {});
        // map._layerGroup.hideLayers();
        map.currentMapInfo = result.mapInfo;

        map._layerGroup._updateFloorIndex(result.mapInfo.floorNumber);

        requestAnimationFrame(function () {
            let c = map.currentMapInfo.getCenter();
            // console.log("requestAnimationFrame");
            // console.log(c);
            let lngLat = CoordProjection.mercatorToLngLat(c.x, c.y);

            let maxBounds = IPEntityUtils.extendedBounds(result.mapInfo, 0.2);
            map.setMaxBounds(maxBounds);

            map.setCenter([lngLat.lng, lngLat.lat]);
            map.setZoom(10);

            if (map._firstLoad) {
                map._baseZoom = map.getZoom();
                // map._layerGroup._updateFontIconSize(map.getZoom());
                map.setMaxZoom(Math.min(map.getZoom() + 3, 22));
                map._firstLoad = false;
            }

            map.fire("floorend", {mapInfo: result.mapInfo});

            if (map._outerFloorCallback != null) {
                map._outerFloorCallback();
                map._outerFloorCallback = null;
            }
        });
    }

    setFont(fontName) {
        this._layerGroup.setFont(fontName);
    }
}

export default IPMap;