import {Evented} from '../../utils/ip_evented'

const EventTypeGpsError = "inner-gps-error";
const EventTypeGpsResult = "inner-gps-result";

class gps_manager extends Evented {
    constructor(converter) {
        super();

        this._gpsConverter = converter;
        this._isSupported = this._gpsConverter && this._gpsConverter._valid;
        this._isStarted = false;
    }

    startUpdateGps() {
        if (this._isStarted) return;

        if (!this._isSupported) {
            this.fire(EventTypeGpsError, {description: "calibration point is not valid"});
            return;
        }

        let self = this;
        if (navigator.geolocation) {
            this._watchID = navigator.geolocation.watchPosition((gps) => {
                self._gpsCallback(gps);
            }, (error) => {
                self._gpsError(error);
            }, {
                enableHighAcuracy: true,
                timeout: 5000,
                maximumAge: 3000
            });
            this._isStarted = true;
        } else {
            this.fire(EventTypeGpsError, {description: "geolocation is not supported by this browser."});
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
        // console.log("gps_manager.gpsCallback");
        let originGps = {lng: gps.coords.longitude, lat: gps.coords.latitude, accuracy: gps.coords.accuracy};
        let wtGps = this._gpsConverter.convertGPS(originGps);
        wtGps.accuracy = originGps.accuracy;
        this.fire(EventTypeGpsResult, {
            timestamp: (new Date()).valueOf(),
            location: wtGps,
            origin: originGps
        });
    }

    _gpsError(error) {
        // console.log("gps_manager.gpsError");
        this.fire(EventTypeGpsError, error);
    }
}

gps_manager.EventTypeGpsResult = EventTypeGpsResult;
gps_manager.EventTypeGpsError = EventTypeGpsError;

export default gps_manager;
