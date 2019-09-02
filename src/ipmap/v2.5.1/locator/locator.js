import {Evented} from '../utils/ip_evented'
import Parser from './pbf-parse/t_y_beacon_parser';
import {local_point as LocalPoint} from '../entity/local_point';
import {locating_beacon as LocatingBeacon, scanned_beacon as ScannedBeacon} from './beacon';
import CoordProjection from '../utils/coord_projection';
import {geojson_utils as GeojsonUtils} from '../utils/geojson_utils';
import GpsLocator from "./gps/gps_locator"
import BleLocator from "./ble/ble_locator"

import Location from "./location"

import InnerEventManager from "../utils/inner_event_manager"

let InnerGpsEvent = InnerEventManager.GpsEvent;
let InnerBleEvent = InnerEventManager.BleEvent;
let InnerLocatorEvent = InnerEventManager.LocatorEvent;

let status = {};

let LocatorParams = {
    ModeSwitchInterval: 4000,
    ResultValidInterval: 6000,
    WaitingBleInterval: 3000
};

const MODE = {
    BLE: 1,
    GPS: 2,
    HYBRID: 9
};

class locator extends Evented {
    constructor(buildingID, options, converter) {
        super();
        let self = this;
        this._buildingID = buildingID;
        this._converter = converter;

        this.currentLocation = null;
        this._gpsResult = null;
        this._bleResult = null;
        this._latestFloor = 1;

        this._currentMode = null;
        this._modeChangeTime = null;
        this._targetMode = null;

        this._gpsLocator = new GpsLocator(this._converter);
        this._gpsLocator.on(InnerGpsEvent.GpsError, (error) => {
            self._gpsError(error);
        });
        this._gpsLocator.on(InnerGpsEvent.GpsResult, (gps) => {
            self._gpsUpdated(gps);
        });
        this._gpsLocator.on(InnerGpsEvent.GpsReady, () => {
            // console.log("gps ready");
            status._gpsReady = true;
            this._processStatus();
        });
        this._gpsLocator.on(InnerGpsEvent.GpsFailed, () => {
            // console.log("gps failed");
            status._gpsReady = false;
            this._processStatus();
        });
        this.startGps();

        this._bleLocator = new BleLocator(buildingID, options);
        this._bleLocator.on(InnerBleEvent.BleReady, (error) => {
            // console.log("ble ready");
            status._bleReady = true;
            this._processStatus();
        });

        this._bleLocator.on(InnerBleEvent.BleFailed, (error) => {
            // console.log("ble failed");
            // console.log(error);
            status._bleReady = false;
            this._processStatus();
        });
    }

    _notifyResult(res) {
        this.fire(InnerLocatorEvent.LocationUpdate, res);
        this._newBleResult = false;
        this._newGpsResult = false;
    }

    _checkMode() {
        let now = new Date().valueOf();
        let bleValid = !!(this._bleResult && this._bleResult.location != null && Math.abs(now - this._bleResult.timestamp) < LocatorParams.ResultValidInterval);
        let gpsValid = !!(this._gpsResult && Math.abs(now - this._gpsResult.timestamp) < LocatorParams.ResultValidInterval);
        let mode = null;

        if (!bleValid && !gpsValid) {
            return;
        }

        if (bleValid && !gpsValid) {
            mode = MODE.BLE;
        } else if (gpsValid && !bleValid) {
            mode = MODE.GPS;
        } else if (this._bleResult.maxRssi > -70 || this._bleResult.beaconCount > 30) {
            mode = MODE.BLE;
        } else if (this._bleResult.maxRssi < -95 || this._bleResult.beaconCount < 4) {
            mode = MODE.GPS;
        } else if (this._bleResult.averageRssi2 > -78) {
            mode = MODE.BLE
        } else if (this._bleResult.averageRssi2 < -90) {
            mode = MODE.GPS;
        } else {
            mode = MODE.HYBRID;
        }
        return mode;
    }

    _calculateResult() {
        let now = new Date().valueOf();
        let bleValid = !!(this._bleResult && this._bleResult.location && Math.abs(now - this._bleResult.timestamp) < LocatorParams.ResultValidInterval);
        let gpsValid = !!(this._gpsResult && Math.abs(now - this._gpsResult.timestamp) < LocatorParams.ResultValidInterval);

        if (Math.abs(now - this._initTime) < LocatorParams.WaitingBleInterval && !bleValid) {
            console.log("Waiting BLE Result!");
            return;
        }

        if (this._currentMode === MODE.GPS) {
            this._gpsResult.location.floor = this._latestFloor;
            let res = {
                location: this._gpsResult.location,
                source: "gps",
                details: {
                    mode: this._currentMode,
                    bleValid: bleValid,
                    gpsValid: gpsValid,
                },
                timestamp: now
            };
            if (this._bleResult && bleValid) {
                res.details.beaconCount = this._bleResult.beaconCount;
                res.details.maxRssi = this._bleResult.maxRssi;
                res.details.averageRssi = this._bleResult.averageRssi;
                res.details.averageRssi2 = this._bleResult.averageRssi2;
                res.details.index = this._bleResult.index;
            }
            this._notifyResult(res);
            return;
        } else if (this._currentMode === MODE.BLE) {
            let res = {
                location: this._bleResult.location,
                source: "ble",
                details: {
                    mode: this._currentMode,
                    bleValid: bleValid,
                    gpsValid: gpsValid,
                    maxRssi: this._bleResult.maxRssi,
                    beaconCount: this._bleResult.beaconCount,
                    averageRssi: this._bleResult.averageRssi,
                    averageRssi2: this._bleResult.averageRssi2,
                    index: this._bleResult.index,
                },
                timestamp: now
            };
            this._notifyResult(res);
        } else if (this._currentMode === MODE.HYBRID) {
            let x = this._bleResult.location.x * 0.3 + this._gpsResult.location.x * 0.7;
            let y = this._bleResult.location.y * 0.3 + this._gpsResult.location.y * 0.7;
            let floor = this._latestFloor;
            let loc = Location.fromXY({x: x, y: y, floor: floor});
            let res = {
                location: loc,
                source: "hybrid",
                details: {
                    mode: this._currentMode,
                    bleValid: bleValid,
                    gpsValid: gpsValid,
                },
                timestamp: now
            };
            if (this._bleResult && bleValid) {
                res.details.beaconCount = this._bleResult.beaconCount;
                res.details.maxRssi = this._bleResult.maxRssi;
                res.details.averageRssi = this._bleResult.averageRssi;
                res.details.averageRssi2 = this._bleResult.averageRssi2;
                res.details.index = this._bleResult.index;
            }
            this._notifyResult(res);
        }
    }

    _doFusion() {
        // console.log("doFusion");
        if (!this._newGpsResult && !this._newBleResult) {
            // console.log("No New Result!");
            return;
        }

        let now = new Date().valueOf();


        this._targetMode = this._checkMode();
        if (this._currentMode == null || this._modeChangeTime == null) {
            this._currentMode = this._targetMode;
            this._modeChangeTime = now;
        } else if (this._currentMode == this._targetMode) {
            this._modeChangeTime = now;
        } else {
            if (Math.abs(now - this._modeChangeTime) > LocatorParams.ModeSwitchInterval) {
                this._modeChangeTime = now;
                this._currentMode = this._targetMode;
            }
        }
        this._calculateResult();
    }

    _gpsError(error) {
        // console.log("_gpsError");
        // console.log(error);
    }

    _gpsUpdated(gps) {
        this._gpsResult = gps;
        this._newGpsResult = true;
    }

    startGps() {
        // console.log("startGps");
        this._gpsLocator.startUpdateGps();
    }

    stopGps() {
        // console.log("stopGps");
        this._gpsLocator.stopUpdateGps();
    }

    _didRangeBeacons(beacons) {
        this._newBleResult = true;
        this._bleResult = this._bleLocator._didRangeBeacons(beacons);
        if (this._bleResult && this._bleResult.location != null) {
            this._latestFloor = this._bleResult.location.floor;
        }
        return this._bleResult;
    }

    _processStatus() {
        if (status._bleReady == null || status._gpsReady == null) return;
        if (!status._bleReady && !status._gpsReady) {
            this.fire(InnerLocatorEvent.LocatorFailed, {description: "Both gps and ble not supported!"});
            return;
        }

        this.fire(InnerLocatorEvent.LocatorReady, {
            ble: status._bleReady,
            gps: status._gpsReady,
            description: `Ble: ${status._bleReady}, Gps: ${status._gpsReady}`
        });

        let self = this;
        this._initTime = new Date().valueOf();
        this._timeHandler = setInterval(() => {
            self._doFusion()
        }, 900);
    }

    getLocation() {
        return this.currentLocation;
    }

    _isBleReady() {
        return status._bleReady;
    }

    _biteMe(methodName, params) {
        return this._bleLocator._biteMe(methodName, params);
    }
}

export default locator;
