// @flow
class event_manager {
    static MapEvent: Object;
    static LocatorEvent: Object;
}

let MapEvent = {
    MapReady: 'mapready',
    FloorStart: 'floorstart',
    FloorEnd: 'floorend',

    Error: 'error'
};
event_manager.MapEvent = MapEvent;


let LocatorEvent = {
    LocatorReady: 'locator-ready',
    LocatorFailed: 'locator-failed',
    LocationUpdate: 'location-update',
    LocationUpdateFailed: 'location-update-failed'
};
event_manager.LocatorEvent = LocatorEvent;

export {event_manager};
