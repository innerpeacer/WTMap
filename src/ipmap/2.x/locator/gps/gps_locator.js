// @flow
import {Evented, wt_wgs84_converter as WtWgs84Converter} from '../../../dependencies.js';
import {inner_event_manager as InnerEventManager} from '../../utils/inner_event_manager';

let GpsEvent = InnerEventManager.GpsEvent;

class gps_locator extends Evented {
    _gpsConverter: WtWgs84Converter;
    _isSupported: boolean;
    _isStarted: boolean;

    _watchID: number;

    constructor(converter: WtWgs84Converter) {
        super();

        this._gpsConverter = converter;
        this._isSupported = this._gpsConverter && this._gpsConverter._valid;
        this._isStarted = false;
    }

    startUpdateGps() {
        if (this._isStarted) return;

        if (!this._isSupported) {
            this.fire(GpsEvent.GpsFailed, {description: 'calibration point is not valid'});
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
            this.fire(GpsEvent.GpsReady, {description: 'gps is started!'});
        } else {
            this.fire(GpsEvent.GpsFailed, {description: 'geolocation is not supported by this browser.'});
        }
    }

    stopUpdateGps() {
        if (!this._isStarted) return;

        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(this._watchID);
            this._isStarted = false;
        }
    }

    _gpsCallback(gps: Object) {
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

    _gpsError(error: Object) {
        // console.log("gps_manager.gpsError");
        this.fire(GpsEvent.GpsError, error);
    }
}

export {gps_locator};
