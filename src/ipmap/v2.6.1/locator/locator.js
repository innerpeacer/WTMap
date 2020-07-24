import {local_point as LocalPoint, Evented} from "../../dependencies.js";
import GpsLocator from "./gps/gps_locator"
import BleLocator from "./ble/ble_locator"
import InnerEventManager from "../utils/inner_event_manager"

let InnerGpsEvent = InnerEventManager.GpsEvent;
let InnerBleEvent = InnerEventManager.BleEvent;
let InnerLocatorEvent = InnerEventManager.LocatorEvent;
let status = {};
let LocatorParams = {
    ModeSwitchInterval: 4000,
    ResultValidInterval: 6000,
    WaitingBleInterval: 3000,
    LocationValidInterval: 6000,
};

const MODE = {
    BLE: 1,
    GPS: 2,
    HYBRID: 9
};

function modeName(mode) {
    if (mode === MODE.BLE) {
        return "ble";
    } else if (mode === MODE.GPS) {
        return "gps";
    } else if (mode === MODE.HYBRID) {
        return "hybrid";
    }
}

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
        this._gpsLocator.on(InnerGpsEvent.GpsFailed, (error) => {
            // console.log("gps failed");
            console.log("GPS Failed: ", error.description);
            status._gpsReady = false;
            this._processStatus();
        });
        if (!options.__disableGps) {
            this.startGps();
        } else {
            status._gpsReady = false;
        }

        this._bleLocator = new BleLocator(buildingID, options);
        this._bleLocator.on(InnerBleEvent.BleReady, () => {
            // console.log("ble ready");
            status._bleReady = true;
            this._processStatus();
        });

        this._bleLocator.on(InnerBleEvent.BleFailed, () => {
            // console.log("ble failed");
            // console.log(error);
            status._bleReady = false;
            this._processStatus();
        });
    }

    _notifyResult(res) {
        let now = new Date().valueOf();
        // console.log("Fire LocationUpdate: ", now - this._initTime);
        this.fire(InnerLocatorEvent.LocationUpdate, res);
        this._newBleResult = false;
        this._newGpsResult = false;
    }

    _checkMode() {
        let now = new Date().valueOf();
        let bleValid = !!(this._bleResult && this._bleResult.location != null && Math.abs(now - this._bleResult.timestamp) < LocatorParams.ResultValidInterval);
        let gpsValid = !!(this._gpsResult && Math.abs(now - this._gpsResult.timestamp) < LocatorParams.ResultValidInterval);
        let mode = null;
        this._modeCondition = null;

        if (!bleValid && !gpsValid) {
            return;
        }

        if (bleValid && !gpsValid) {
            mode = MODE.BLE;
            this._modeCondition = "gps not valid";
        } else if (gpsValid && !bleValid) {
            mode = MODE.GPS;
            this._modeCondition = "ble not valid";
            // } else if (this._bleResult.maxRssi > -70 || this._bleResult.beaconCount > 30) {
        } else if (this._bleResult.maxRssi > -75) {
            mode = MODE.BLE;
            // this._modeCondition = `max(${this._bleResult.maxRssi}) > -70 or count(${this._bleResult.beaconCount}) > 30`;
            this._modeCondition = `max(${this._bleResult.maxRssi}) > -75`;
        } else if (this._bleResult.maxRssi < -95 || this._bleResult.beaconCount < 4) {
            mode = MODE.GPS;
            this._modeCondition = `max(${this._bleResult.maxRssi}) < -95 or count(${this._bleResult.beaconCount}) < 4`;
        } else if (this._bleResult.averageRssi2 > -80 || this._bleResult.averageRssi > -80) {
            mode = MODE.BLE;
            this._modeCondition = `avg2(${parseInt(this._bleResult.averageRssi2 * 100) / 100}) > -80 or avg(${parseInt(this._bleResult.averageRssi * 100) / 100}) > -80`;
        } else if (this._bleResult.averageRssi2 < -90) {
            mode = MODE.GPS;
            this._modeCondition = `avg2(${parseInt(this._bleResult.averageRssi2 * 100) / 100}) < 90`;
        } else {
            mode = MODE.HYBRID;
            this._modeCondition = `none of the above`;
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
            let loc = LocalPoint.fromLngLat(this._gpsResult.location);
            let res = {
                location: loc,
                source: modeName(this._currentMode),
                details: this._getDetails(gpsValid, bleValid),
                timestamp: now
            };
            this._notifyResult(res);
        } else if (this._currentMode === MODE.BLE) {
            let loc = LocalPoint.fromXY(this._bleResult.location);
            let res = {
                location: loc,
                source: modeName(this._currentMode),
                details: this._getDetails(gpsValid, bleValid),
                timestamp: now
            };
            this._notifyResult(res);
        } else if (this._currentMode === MODE.HYBRID) {
            let x = this._bleResult.location.x * 0.3 + this._gpsResult.location.x * 0.7;
            let y = this._bleResult.location.y * 0.3 + this._gpsResult.location.y * 0.7;
            let floor = this._latestFloor;
            let loc = LocalPoint.fromXY({x: x, y: y, floor: floor});
            let res = {
                location: loc,
                source: modeName(this._currentMode),
                details: this._getDetails(gpsValid, bleValid),
                timestamp: now
            };
            this._notifyResult(res);
        }
        this._lastTimeLocationUpdated = now;
    }

    _getDetails(gpsValid, bleValid) {
        let details = {
            mode: this._currentMode,
            targetMode: `${this._targetMode}(${modeName(this._targetMode)})`,
            condition: this._modeCondition,
            gpsValid: gpsValid,
            bleValid: bleValid,
        };

        if (this._bleResult && bleValid) {
            details.beaconCount = this._bleResult.beaconCount;
            details.maxRssi = this._bleResult.maxRssi;
            details.averageRssi = this._bleResult.averageRssi;
            details.averageRssi2 = this._bleResult.averageRssi2;
            details.index = this._bleResult.index;
        }
        return details;
    }

    _doFusion() {
        // console.log("doFusion");
        let now = new Date().valueOf();
        let bleValid = !!(this._bleResult && this._bleResult.location && Math.abs(now - this._bleResult.timestamp) < LocatorParams.ResultValidInterval);
        if (Math.abs(now - this._initTime) < LocatorParams.WaitingBleInterval && !bleValid) {
            // console.log("_doFusion: ", now);
            // console.log("delta: ", now - this._initTime);
            console.log("Waiting BLE Result 2!");
            return;
        }
        if (!this._newGpsResult && !this._newBleResult) {
            // console.log("No New Result!");
            if (this._lastTimeLocationUpdated != null && Math.abs(now - this._lastTimeLocationUpdated) > LocatorParams.LocationValidInterval) {
                this.fire(InnerLocatorEvent.LocationUpdateFailed, {description: `no new result updated for ${parseInt(Math.abs(now - this._lastTimeLocationUpdated) / 1000)}s`});
            }
            return;
        }

        this._targetMode = this._checkMode();
        if (this._currentMode == null || this._modeChangeTime == null) {
            this._currentMode = this._targetMode;
            this._modeChangeTime = now;
        } else if (this._currentMode === this._targetMode) {
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
    }

    start() {
        let self = this;
        this._initTime = new Date().valueOf();
        // console.log("locator start time: ", this._initTime);
        this._lastTimeLocationUpdated = this._initTime;
        this._timeHandler = setInterval(() => {
            self._doFusion()
        }, 900);
    }

    stop() {
        clearInterval(this._timeHandler);
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
