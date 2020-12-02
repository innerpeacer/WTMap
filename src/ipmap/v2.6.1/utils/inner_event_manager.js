class inner_event_manager {

}

let GpsEvent = {
    GpsReady: 'inner-gps-ready',
    GpsFailed: 'inner-gps-failed',
    GpsError: 'inner-gps-error',
    GpsResult: 'inner-gps-result'
};
inner_event_manager.GpsEvent = GpsEvent;

let LocatorEvent = {
    LocatorReady: 'inner-locator-ready',
    LocatorFailed: 'innner-locator-failed',
    LocatorError: 'inner-locator-error',
    LocationUpdate: 'inner-location-update',
    LocationUpdateFailed: 'inner-location-update-failed'
};
inner_event_manager.LocatorEvent = LocatorEvent;

export {inner_event_manager};
