import {Evented} from '../utils/ip_evented'
import Parser from './pbf-parse/t_y_beacon_parser';
import {local_point as LocalPoint} from '../entity/local_point';
import {locating_beacon as LocatingBeacon, scanned_beacon as ScannedBeacon} from './beacon';
import CoordProjection from '../utils/coord_projection';
import {geojson_utils as GeojsonUtils} from '../utils/geojson_utils';
import GpsLocator from "./gps/gps_locator"
import BleLocator from "./ble/ble_locator"

import InnerEventManager from "../utils/inner_event_manager"

let InnerGpsEvent = InnerEventManager.GpsEvent;
let InnerBleEvent = InnerEventManager.BleEvent;
let InnerLocatorEvent = InnerEventManager.LocatorEvent;

let status = {};

class locator extends Evented {
    constructor(buildingID, options, converter) {
        super();
        let self = this;
        this._buildingID = buildingID;
        this._converter = converter;

        this.currentLocation = null;
        this._gpsResult = null;
        this._bleLocation = null;

        this._ready = false;

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

        this._initTime = new Date().valueOf();
        this._timeHandler = setInterval(() => {
            self._doFusion()
        }, 500);
    }

    _doFusion() {
        // console.log("doFusion");
        let now = new Date().valueOf();

        let bleTime = 0;
        let gpsTime = 0;

        if (!this._newBle && !this._newGps) return;

        if (this._bleLocation != null && this._gpsResult != null) {
            let x = (this._bleLocation.location.x + this._gpsResult.location.x) * 0.5;
            let y = (this._bleLocation.location.y + this._gpsResult.location.y) * 0.5;
            let hybridLocation = CoordProjection.mercatorToLngLat(x, y);
            hybridLocation.floor = this._bleLocation.floor;

            this.fire(InnerLocatorEvent.LocationUpdate, {
                location: hybridLocation,
                source: "hybrid",
                timestamp: now
            });
        } else if (this._bleLocation != null) {
            bleTime = this._bleLocation.timestamp;
            this.fire(InnerLocatorEvent.LocationUpdate, {
                location: this._bleLocation.location,
                source: "ble",
                timestamp: this._bleLocation.timestamp
            });
        } else if (this._gpsResult != null) {
            gpsTime = this._gpsResult.timestamp;
            this.fire(InnerLocatorEvent.LocationUpdate, {
                location: this._gpsResult.location,
                source: "gps",
                timestamp: this._gpsResult.timestamp
            });
        }

        this._newBle = false;
        this._newGps = false;
    }

    _gpsError(error) {
        // console.log("_gpsError");
        // console.log(error);
    }

    _gpsUpdated(gps) {
        // console.log("_gpsUpdated");
        // console.log(gps);
        this._gpsResult = gps;
        this._newGps = true;
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
        this._newBle = true;
        this._bleLocation = this._bleLocator._didRangeBeacons(beacons);
        return this._bleLocation;
    }

    _processStatus() {
        if (status._bleReady == null || status._gpsReady == null) return;
        if (!status._bleReady && !status._gpsReady) {
            this.fire(InnerLocatorEvent.LocatorFailed, {description: "Both gps and ble failed!"});
            return;
        }

        this.fire(InnerLocatorEvent.LocatorReady, {
            ble: status._bleReady,
            gps: status._gpsReady,
            description: `Ble: ${status._bleReady}, Gps: ${status._gpsReady}`
        });
    }

    getLocation() {
        return this.currentLocation;
    }

    _biteMe(methodName, params) {
        return this._bleLocator._biteMe(methodName, params);
    }
}

export default locator;
