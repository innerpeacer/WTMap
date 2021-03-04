// @flow
import type {IPMap} from '../map/map';
import type {
    mapinfo as MapInfo,
    local_point as LocalPoint,
    MultiStopRouteResult as MultiRouteResult
} from '../../dependencies';
import {event_manager} from '../utils/event_manager';
import {route_popup as RoutePopup, PopupType} from './route_popup';

const MapEvent = event_manager.MapEvent;

class popup_manager {
    map: IPMap;
    routePopupArray: Array<RoutePopup>;

    constructor(map: IPMap) {
        console.log('popup_manager.constructor');
        this.map = map;
        this.routePopupArray = [];
    }

    showRoutePopup(routeResult: MultiRouteResult) {
        // console.log('popup_manager.showRoutePopup');
        this.map.on(MapEvent.FloorEnd, this._update.bind(this));

        this.hideRoutePopup();
        this._createPopup(routeResult);
        this._update({mapInfo: this.map.currentMapInfo});
    }

    _createPopup(routeResult: MultiRouteResult) {
        this.routePopupArray = [];
        let data = routeResult.completeResult.getStartEndData().data;
        for (let i = 0; i < data.length; ++i) {
            let p = data[i];
            let routePopup = new RoutePopup(p);
            routePopup.on('popup-click', this.popClicked.bind(this));
            this.routePopupArray.push(routePopup);
        }
    }

    hideRoutePopup() {
        this.map.off(MapEvent.FloorEnd, this._update);
        this.routePopupArray.forEach((routePopup) => {
            routePopup.remove();
            routePopup.off('pop-click', this.popClicked);
        });
        this.routePopupArray = [];
    }

    popClicked(evt: Object) {
        // console.log('popup_manager.popClicked');
        if (!this.map._routePopupInteraction) return;
        let routePopup: RoutePopup = evt.target;
        let targetFloor;
        if (routePopup.type === PopupType.From) {
            targetFloor = routePopup.data.properties.fromFloor;
        } else if (routePopup.type === PopupType.To) {
            targetFloor = routePopup.data.properties.toFloor;
        }
        this.map.setFloor(targetFloor);
    }

    _update(evt: {mapInfo: MapInfo}) {
        // console.log('popup_manager._update');
        this.routePopupArray.forEach((routePopup) => {
            routePopup.updateFloor(this.map, evt.mapInfo.floorNumber);
        });
    }
}

export {popup_manager};
