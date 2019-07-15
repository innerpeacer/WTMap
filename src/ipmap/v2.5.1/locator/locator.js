import {Evented} from "../utils/ip_evented"
import Parser from "./pbf-parse/t_y_beacon_parser";
import {local_point as LocalPoint} from "../entity/local_point";
import LocatingBeacon from "./locating_beacon";
import ScannedBeacon from "./scanned_beacon";
// import CoordProjection from "../utils/coord_projection";
// import GeojsonUtils from "../utils/geojson_utils";

class locator extends Evented {
    constructor(buildingID, options) {
        super();
        this._buildingID = buildingID;
        this._uuid = null;
        // this._url = "http://localhost:8112/WTMapService/web/pbf/getBeacon";
        // this._url = "http://47.97.173.242:8080/WTMapService/web/pbf/getBeacon";
        this._url = "https://gis.cx9z.com/map-server/beacon/getBeaconPbf";
        if (options != null && options.url != null) {
            this._url = options.url;
        }
        this._locatingBeaconDict = new Map();
        this._scannedBeaconArray = [];
        this._beaconPool = new Map();
        this.currentLocation = null;
        this._ready = false;

        this._init();
    }

    _init() {
        if (this._buildingID == null) {
            this.fire("error", {errorCode: 800, description: "buildingID is null"});
            this.fire("inner-locator-failed", {errorCode: 800, description: "buildingID is null"});
            return;
        }
        this._path = `${this._url}?buildingID=${this._buildingID}`;

        let that = this;
        let httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", this._path, true);
        httpRequest.responseType = "arraybuffer";
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let byteArray = new Uint8Array(httpRequest.response);
                    let parser = new Parser(byteArray);
                    that._uuid = parser.getUuid();
                    that._loadBeacons(parser.getBeaconList());
                } else {
                    // that.fire("error", {errorCode: 900, description: httpRequest.responseText});
                    that.fire("inner-locator-failed", {errorCode: 900, description: "Beacon Data error!"});
                }
            }
        };
        httpRequest.send();
    }

    _loadBeacons(data) {
        for (let i = 0; i < data.length; ++i) {
            let lb = data[i];
            let locatingBeacon = new LocatingBeacon(lb.uuid, lb.major, lb.minor, lb.x, lb.y, lb.floor);
            this._locatingBeaconDict.set(locatingBeacon.key, locatingBeacon);
        }
        this._ready = true;
        this.fire("ready");
        this.fire("inner-locator-ready");
    }

    _didRangeBeacons(beacons, options) {
        if (!this._ready) {
            console.log("Not ready yet");
            return null;
        }

        // alert("didRangeBeacons");
        // alert("beacons: "+ beacons.length);

        let sbList = [];
        for (let i = 0; i < beacons.length; ++i) {
            let sb = beacons[i];
            let scannedBeacon = new ScannedBeacon(sb.uuid, sb.major, sb.minor, sb.rssi, sb.accuracy);
            sbList.push(scannedBeacon);
        }

        // alert("sbList: "+ sbList.length);
        this._preprocessBeacons(sbList);
        this._updateBeaconPool(this._scannedBeaconArray);
        return this._calculateLocation(options);
    }

    _updateBeaconPool(sbeacons) {
        // alert("updateBeaconPool");
        // alert("sbeacons: " + sbeacons.length);
        let beaconPool = this._beaconPool;
        let now = parseInt(new Date().getTime());

        for (let i = 0; i < sbeacons.length; ++i) {
            let sb = sbeacons[i];
            beaconPool.set(sb.key, {beacon: sb, time: now});
        }

        beaconPool.forEach(function (obj, key, mapObj) {
            if (Math.abs(obj.time - now) > 5000) {
                beaconPool.delete(key);
            }
        });
        // alert("_beaconPool: " + _beaconPool.size);
    }

    _preprocessBeacons(sbeacons) {
        // alert("preprocessBeacons");
        // alert("sbeacons: "+ sbeacons.length);
        this._scannedBeaconArray = [];
        // alert(sbeacons[0]);
        for (let i = 0; i < sbeacons.length; ++i) {
            let sb = sbeacons[i];
            if (sb.uuid != this._uuid) continue;
            if (sb.rssi > -20) continue;

            if (this._locatingBeaconDict.has(sb.key)) {
                this._scannedBeaconArray.push(sb);
            }
        }
        // alert("this._scannedBeaconArray: "+ this._scannedBeaconArray.length);
    }

    _calculateLocation(options) {
        let weightingArray = [];
        let pointArray = [];

        let beaconList = [];
        this._beaconPool.forEach(function (value, key, mapObj) {
            beaconList.push(value.beacon);
        });

        beaconList.sort(function (a, b) {
            return b.rssi - a.rssi;
        });

        let totalWeighting = 0.0;
        let totalWeightingX = 0.0;
        let totalWeightingY = 0.0;

        let maxRssi = -100;

        let index = Math.min(9, beaconList.length);
        let frequencyMap = new Map();

        for (let i = 0; i < index; ++i) {
            let sb = beaconList[i];
            maxRssi = sb.rssi;
            let location = this._locatingBeaconDict.get(sb.key).location;

            let weighting = 1.0 / Math.pow(sb.accuracy, 2);
            totalWeighting += weighting;
            weightingArray.push(weighting);
            pointArray.push(location);

            let floorWeight = 1;
            if (i == 0 || i == 1) floorWeight = 2;

            if (frequencyMap.has(location.floor)) {
                frequencyMap.set(location.floor, frequencyMap.get(location.floor) + floorWeight);
            } else {
                frequencyMap.set(location.floor, floorWeight);
            }
        }

        let maxCount = 0;
        let maxFloor = 0;

        frequencyMap.forEach(function (floorCount, floor, mapObj) {
            if (floorCount > maxCount) {
                maxCount = floorCount;
                maxFloor = floor;
            }
        });

        for (let i = 0; i < weightingArray.length; ++i) {
            totalWeightingX += weightingArray[i] * pointArray[i].x;
            totalWeightingY += weightingArray[i] * pointArray[i].y;
        }

        if (totalWeighting == 0) {
            this.currentLocation = null;
        } else {
            this.currentLocation = new LocalPoint(totalWeightingX / totalWeighting, totalWeightingY / totalWeighting, maxFloor);
        }
        // return this.currentLocation;

        let res = {
            location: this.currentLocation,
            maxRssi: maxRssi
        };

        if (options && options.debug) {
            res.maxIndex = index;
            res.totalWeighting = totalWeighting;
            res.beaconList = beaconList.length;
            res.beaconPool = this._beaconPool.size;
        }
        return res;
    }

    getLocation() {
        return this.currentLocation;
    }

    // getLocatingBeacons() {
    //     if (this._locatingBeacons != null) return this._locatingBeacons;
    //
    //     let beaconList = [];
    //     this._locatingBeaconDict.forEach(function (obj, key, mapObj) {
    //         let lngLat = CoordProjection.mercatorToLngLat(obj.location.x, obj.location.y);
    //         beaconList.push({
    //             lng: lngLat.lng,
    //             lat: lngLat.lat,
    //             properties: {floor: obj.location.floor, major: obj.major, minor: obj.minor}
    //         });
    //     });
    //     this._locatingBeacons = GeojsonUtils.createPointFeatureCollection(beaconList);
    //     return this._locatingBeacons;
    // }

    // getScannedBeacons() {
    //     let beaconList = [];
    //     for (let i = 0; i < this._scannedBeaconArray.length; ++i) {
    //         let sb = this._scannedBeaconArray[i];
    //         let lb = this._locatingBeaconDict.get(sb.key);
    //         let lngLat = CoordProjection.mercatorToLngLat(lb.location.x, lb.location.y);
    //         beaconList.push({
    //             lng: lngLat.lng,
    //             lat: lngLat.lat,
    //             properties: {
    //                 floor: lb.location.floor,
    //                 major: sb.major,
    //                 minor: sb.minor,
    //                 rssi: sb.rssi,
    //                 accuracy: parseInt(sb.accuracy * 100) / 100.0
    //             }
    //         });
    //     }
    //     return GeojsonUtils.createPointFeatureCollection(beaconList);
    // }
}

export default locator;