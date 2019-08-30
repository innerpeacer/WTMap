import event_manager from "./event_manager";

class inner_event_manager {

}

let HttpEvent = {
    HttpResult: "inner-http-result",
    HttpError: "inner-http-error"
};
inner_event_manager.HttpEvent = HttpEvent;

let DataEvent = {
    CBMReady: "inner-cbm-ready",
    CBMError: "inner-cbm-error",
};
inner_event_manager.DataEvent = DataEvent;

let RouteEvent = {
    RouteError: "inner-route-error",
    RouteResult: "inner-route-result"
};
inner_event_manager.RouteEvent = RouteEvent;

let GpsEvent = {
    GpsReady: "inner-gps-ready",
    GpsFailed: "inner-gps-failed",
    GpsError: "inner-gps-error",
    GpsResult: "inner-gps-result"
};
inner_event_manager.GpsEvent = GpsEvent;

let BleEvent = {
    BleReady: "inner-ble-ready",
    BleFailed: "inner-ble-failed",
    BleResult: "inner-ble-result"
};
inner_event_manager.BleEvent = BleEvent;

let LocatorEvent = {
    LocatorReady: "inner-locator-ready",
    LocatorFailed: "innner-locator-failed",
    LocatorError: "inner-locator-error",
    LocationUpdate: "inner-location-update",
};
inner_event_manager.LocatorEvent = LocatorEvent;

export default inner_event_manager;
