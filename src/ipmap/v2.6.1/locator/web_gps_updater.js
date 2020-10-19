import {Evented} from "../../dependencies.js";

const GpsEvent = {
    GpsReady: "gps-ready",
    GpsFailed: "gps-failed",
    GpsError: "gps-error",
    GpsResult: "gps-result"
};

const GpsEventCode = {
    CalibrationFailed: 1001,
};

const DefaultGpsOptions = {
    enableHighAcuracy: true,
    timeout: 5000,
    maximumAge: 3000
};

class web_gps_updater extends Evented {
    constructor(converter) {
        super();

        this._gpsConverter = converter;
        this._isSupported = this._gpsConverter && this._gpsConverter._valid;
        this._isStarted = false;
    }

    startUpdateGps() {
        if (this._isStarted) return;
        if (!this._isSupported) {
            this.fire(GpsEvent.GpsFailed, {
                code: GpsEventCode.CalibrationFailed,
                msg: 'calibration point is not valid!'
            });
            return;
        }

        if (navigator.geolocation) {
            this._watchID = navigator.geolocation.watchPosition((gps) => {
                this._gpsCallback(gps);
            }, (error) => {
                this._gpsError(error);
            }, DefaultGpsOptions);
            this._isStarted = true;
            this.fire(GpsEvent.GpsReady, {description: "gps is started!"});
        } else {
            this.fire(GpsEvent.GpsFailed, {description: "geolocation is not supported by this browser."});
        }
    }

    stopUpdateGps() {
        if (!this._isStarted) return;
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(this._watchID);
            this._isStarted = false;
        }
    }

    _gpsCallback(gps) {
        let originGps = {lng: gps.coords.longitude, lat: gps.coords.latitude, accuracy: gps.coords.accuracy};
        let wtGps = this._gpsConverter.convertGPS(originGps);
        wtGps.accuracy = originGps.accuracy;
        this.fire(GpsEvent.GpsResult, {
            timestamp: Date.now(),
            location: wtGps,
            origin: originGps
        });
    }

    _gpsError(error) {
        this.fire(GpsEvent.GpsError, error);
    }
}

export {web_gps_updater, GpsEvent}