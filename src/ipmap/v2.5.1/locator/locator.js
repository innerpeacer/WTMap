import {Evented} from '../utils/ip_evented'
import Parser from './pbf-parse/t_y_beacon_parser';
import {local_point as LocalPoint} from '../entity/local_point';
// import LocatingBeacon from './locating_beacon';
// import ScannedBeacon from './scanned_beacon';
import {locating_beacon as LocatingBeacon, scanned_beacon as ScannedBeacon} from "./beacon";
import CoordProjection from '../utils/coord_projection';
import GeojsonUtils from '../utils/geojson_utils';

let _locatorObject = {};

function _loadBeacons(locator, data) {
    for (let i = 0; i < data.length; ++i) {
        let lb = data[i];
        let locatingBeacon = new LocatingBeacon(lb.uuid, lb.major, lb.minor, lb.x, lb.y, lb.floor);
        _locatorObject.locatingBeaconDict.set(locatingBeacon.key, locatingBeacon);
    }
}

function _updateBeaconPool(sbeacons) {
    let beaconPool = _locatorObject.beaconPool;
    let now = parseInt(new Date().getTime());

    for (let i = 0; i < sbeacons.length; ++i) {
        let sb = sbeacons[i];
        beaconPool.set(sb.key, {beacon: sb, time: now});
    }

    beaconPool.forEach(function (b, key) {
        if (Math.abs(b.time - now) > 5000) {
            beaconPool.delete(key);
        }
    });
}

function _preprocessBeacons(locator, sbeacons) {
    _locatorObject.scannedBeaconArray = [];
    for (let i = 0; i < sbeacons.length; ++i) {
        let sb = sbeacons[i];
        if (sb.uuid !== locator._uuid) continue;
        if (sb.rssi > -20) continue;

        if (_locatorObject.locatingBeaconDict.has(sb.key)) {
            _locatorObject.scannedBeaconArray.push(sb);
        }
    }
}

function _calculateLocation(options) {
    let weightingArray = [];
    let pointArray = [];

    let beaconList = [];
    _locatorObject.beaconPool.forEach(function (value) {
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

    let debugArray = [];
    for (let i = 0; i < index; ++i) {
        let sb = beaconList[i];
        maxRssi = sb.rssi;
        let location = _locatorObject.locatingBeaconDict.get(sb.key).location;

        let weighting = 1.0 / Math.pow(sb.accuracy, 2);
        totalWeighting += weighting;
        weightingArray.push(weighting);
        pointArray.push(location);

        let lnglat = CoordProjection.mercatorToLngLat(location.x, location.y);
        let desc = '';
        if (i == 0) desc = 'First';
        if (i == 1) desc = 'Second';
        debugArray.push({
            lng: lnglat.lng,
            lat: lnglat.lat,
            properties: {
                major: sb.major,
                minor: sb.minor,
                x: location.x,
                y: location.y,
                floor: location.floor,
                rssi: sb.rssi,
                accuracy: parseInt(sb.accuracy * 100) / 100,
                weighting: parseInt(weighting * 100) / 100,
                desc: desc
            }
        });

        let floorWeight = 1;
        if (i === 0 || i === 1) floorWeight = 2;

        if (frequencyMap.has(location.floor)) {
            frequencyMap.set(location.floor, frequencyMap.get(location.floor) + floorWeight);
        } else {
            frequencyMap.set(location.floor, floorWeight);
        }
    }

    let maxCount = 0;
    let maxFloor = 0;

    frequencyMap.forEach(function (floorCount, floor) {
        if (floorCount > maxCount) {
            maxCount = floorCount;
            maxFloor = floor;
        }
    });

    for (let i = 0; i < weightingArray.length; ++i) {
        totalWeightingX += weightingArray[i] * pointArray[i].x;
        totalWeightingY += weightingArray[i] * pointArray[i].y;
    }

    let resultLocation = null;
    if (totalWeighting === 0) {
        resultLocation = null;
    } else {
        resultLocation = new LocalPoint(totalWeightingX / totalWeighting, totalWeightingY / totalWeighting, maxFloor);
    }

    let res = {
        location: resultLocation,
        maxRssi: maxRssi
    };

    if (options && options.debug) {
        res.maxIndex = index;
        res.totalWeighting = totalWeighting;
        res.beaconList = beaconList.length;
        res.beaconPool = _locatorObject.beaconPool.size;
        res.debugData = GeojsonUtils.createPointFeatureCollection(debugArray);
        if (resultLocation) {
            let debugLocation = CoordProjection.mercatorToLngLat(resultLocation.x, resultLocation.y);
            let text = '';
            text += 'maxIndex: ' + index + '\n';
            text += 'maxRssi: ' + maxRssi + '\n';
            frequencyMap.forEach(function (floorCount, floor) {
                text += 'F' + floor;
                if (floor == maxFloor) text += '(maxFloor)';
                text += ': Count(' + floorCount + ')';
                text += '\n';
            });
            debugLocation = {lng: debugLocation.lng, lat: debugLocation.lat};
            debugLocation.properties = {
                maxRssi: maxRssi,
                maxIndex: index,
                beaconPool: res.beaconPool,
                beaconList: res.beaconList,
                totalWeighting: res.totalWeighting,
                floor: resultLocation.floor,
                text: text,
            };
            res.debugLocation = GeojsonUtils.createPointFeatureCollection([debugLocation]);
        }
    }
    return res;
}

function _getLocatingBeaconGeojson() {
    let BeaconDict = _locatorObject.locatingBeaconDict;
    if (_locatorObject._locatingGeojson == null) {
        let beacons = [];
        BeaconDict.forEach(function (lb) {
            let lngLat = CoordProjection.mercatorToLngLat(lb.location.x, lb.location.y);
            beacons.push({
                lng: lngLat.lng,
                lat: lngLat.lat,
                properties: {floor: lb.location.floor, major: lb.major, minor: lb.minor}
            });
        });
        _locatorObject._locatingGeojson = GeojsonUtils.createPointFeatureCollection(beacons);
    }
    return _locatorObject._locatingGeojson;
}

function _getLocatingBeaconArray() {
    let BeaconDict = _locatorObject.locatingBeaconDict;
    if (_locatorObject._locatingBeaconArray == null) {
        let beacons = [];
        BeaconDict.forEach(function (lb) {
            beacons.push(lb);
        });
        _locatorObject._locatingBeaconArray = beacons;
    }
    return _locatorObject._locatingBeaconArray;
}

class locator extends Evented {
    constructor(buildingID, options) {
        super();
        this._buildingID = buildingID;
        this._uuid = null;
        this._url = 'https://gis.cx9z.com/map-server/beacon/getBeaconPbf';
        if (options != null && options.url != null) {
            this._url = options.url;
        }
        this._debugBeacon = !!(options && options._debugBeacon);

        _locatorObject.locatingBeaconDict = new Map();
        _locatorObject.scannedBeaconArray = [];
        _locatorObject.beaconPool = new Map();

        this.currentLocation = null;
        this._ready = false;

        this._init();
    }

    _init() {
        if (this._buildingID == null) {
            this.fire('error', {errorCode: 800, description: 'buildingID is null'});
            this.fire('inner-locator-failed', {errorCode: 800, description: 'buildingID is null'});
            return;
        }
        this._path = `${this._url}?buildingID=${this._buildingID}`;

        let that = this;
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', this._path, true);
        httpRequest.responseType = 'arraybuffer';
        httpRequest.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let byteArray = new Uint8Array(httpRequest.response);
                    let parser = new Parser(byteArray);
                    that._uuid = parser.getUuid();
                    _loadBeacons(that, parser.getBeaconList());
                    that._ready = true;
                    that.fire('ready');
                    that.fire('inner-locator-ready');
                } else {
                    that.fire('inner-locator-failed', {errorCode: 900, description: 'Beacon Data error!'});
                }
            }
        };
        httpRequest.send();
    }


    _didRangeBeacons(beacons) {
        if (!this._ready) {
            console.log('Not ready yet');
            return null;
        }

        let sbList = [];
        for (let i = 0; i < beacons.length; ++i) {
            let sb = beacons[i];
            let scannedBeacon = new ScannedBeacon(sb.uuid, sb.major, sb.minor, sb.rssi, sb.accuracy);
            sbList.push(scannedBeacon);
        }

        _preprocessBeacons(this, sbList);
        _updateBeaconPool(_locatorObject.scannedBeaconArray);
        let res = _calculateLocation({debug: this._debugBeacon});
        this.currentLocation = res.location;
        return res;
    }

    getLocation() {
        return this.currentLocation;
    }

    _biteMe(methodName, params) {
        if ('_getLocatingBeaconGeojson' === methodName) {
            return _getLocatingBeaconGeojson();
        } else if ('getLocatingBeacons' === methodName) {
            return _getLocatingBeaconGeojson();
        } else if ('_getLocatingBeaconArray' === methodName) {
            return _getLocatingBeaconArray();
        }
        console.log('OK, as you wish!')
    }

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
