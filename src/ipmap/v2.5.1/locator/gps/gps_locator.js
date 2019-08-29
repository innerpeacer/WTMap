import {Evented} from '../../utils/ip_evented'
import InnerEventManager from "../../utils/inner_event_manager"

let GpsEvent = InnerEventManager.GpsEvent;

class gps_locator extends Evented {
    constructor(converter) {
        super();

        this._gpsConverter = converter;
        this._isSupported = this._gpsConverter && this._gpsConverter._valid;
        this._isStarted = false;
    }

    startUpdateGps() {
        if (this._isStarted) return;

        if (!this._isSupported) {
            this.fire(GpsEvent.GpsError, {description: "calibration point is not valid"});
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
            this.fire(GpsEvent.GpsError, {description: "geolocation is not supported by this browser."});
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
        this.fire(GpsEvent.GpsResult, {
            timestamp: (new Date()).valueOf(),
            location: wtGps,
            origin: originGps
        });
    }

    _gpsError(error) {
        // console.log("gps_manager.gpsError");
        this.fire(GpsEvent.GpsError, error);
    }
}

export default gps_locator;
