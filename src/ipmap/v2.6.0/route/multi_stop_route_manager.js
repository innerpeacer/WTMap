import {Evented} from '../utils/ip_evented'
import ipTurf from '../utils/ip_turf'

let Point = ipTurf.point;
let FeatureCollection = ipTurf.featureCollection;

import IPRoutePart from './route_part'
import IPRouteResult from './route_result'
import IPMutliRouteResult from './multi_stop_route_result'
import {http_request as IPHttpRequest} from "../utils/http_request";
import {coord_projection as CoordProjection} from '../utils/coord_projection'
import {local_point as IPLocalPoint} from '../entity/local_point'

import InnerEventManager from "../utils/inner_event_manager"

let RouteEvent = InnerEventManager.RouteEvent;
let HttpEvent = InnerEventManager.HttpEvent;

// let getRoutePath = function (bID, options, start, end, stops, params) {
//     // console.log('getRoutePath: ');
//     let rearrange = true;
//     if (params && !params.rearrangeStops) {
//         // console.log(params.rearrangeStops);
//         // console.log('no');
//         rearrange = false;
//     } else {
//         // console.log('yes');
//     }
//
//
//     // return `${options._apiHost}/${options._apiRoute}/route/RouteService?buildingID=${bID}&${start.toStartParameter()}&${end.toEndParameter()}`;
//     // return `${options._apiRouteHost}/${options._apiRoute}/route/RouteService?buildingID=${bID}&${start.toStartParameter()}&${end.toEndParameter()}`;
//     let stopParams = null;
//     if (stops != null && stops.length > 0) {
//         stopParams = IPLocalPoint.toStopParams(stops);
//     }
//
//     // if (stopParams == null) {
//     //     return `${options._apiRouteHost}/${options._apiRoute}/route/RouteServiceV2?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}`;
//     // } else {
//     //     return `${options._apiRouteHost}/${options._apiRoute}/route/RouteServiceV2?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}&${stopParams}`;
//     // }
//
//     if (stopParams == null) {
//         return `${options._apiRouteHost}/${options._apiRoute}/route/RouteServiceV3?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}&rearrangeStops=${rearrange}`;
//     } else {
//         return `${options._apiRouteHost}/${options._apiRoute}/route/RouteServiceV3?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}&${stopParams}&rearrangeStops=${rearrange}`;
//     }
// };

let getRoutePath = function (bID, options, start, end, stops, params) {
    // console.log('getRoutePath: ');
    // console.log(params);
    let rearrange = true;
    if (params && !params["rearrangeStops"]) {
        rearrange = false;
    }

    // let routeVersion = 'V3';
    // if (params && params.version) {
    //     routeVersion = params.version;
    // }

    let stopParams = null;
    if (stops != null && stops.length > 0) {
        stopParams = IPLocalPoint.toStopParams(stops);
    }

    // let url = `${options._apiRouteHost}/${options._apiRoute}/route/RouteService${routeVersion}?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}&rearrangeStops=${rearrange}`;
    let url = `${options._apiRouteHost}/${options._apiRoute}/route/routeService?buildingID=${bID}&${start.toStartParameter2()}&${end.toEndParameter2()}&rearrangeStops=${rearrange}`;
    if (stopParams != null) {
        url += `&${stopParams}`;
    }

    let vehicle = false;
    if (params && params["vehicle"]) vehicle = true;
    if (vehicle) {
        url += `&vehicle=${vehicle}`;
    }

    let sameFloorFirst = true;
    if (params.sameFloorFirst === undefined) {
    } else {
        sameFloorFirst = Boolean(params.sameFloorFirst);
    }
    url += `&sameFloorFirst=${sameFloorFirst}`;

    let ignoreList = [];
    if (params && params.ignore) {
        ignoreList = params.ignore;
    }

    if (ignoreList.length > 0) {
        let ignoreStr = '';
        for (let i = 0; i < ignoreList.length; ++i) {
            if (i !== 0) ignoreStr += ',';
            ignoreStr += ignoreList[i];
        }
        url += `&ignore=${ignoreStr}`;
    }
    // console.log(url);
    return url;
};

let searchMapInfoFromArray = function (mapInfoArray, floor) {
    let info = null;
    for (let i = 0; i < mapInfoArray.length; ++i) {
        let mapInfo = mapInfoArray[i];
        if (mapInfo.floorNumber === floor) {
            info = mapInfo;
            break;
        }
    }
    return info;
};

function dist(c1, c2) {
    return Math.sqrt((c1[0] - c2[0]) * (c1[0] - c2[0]) + (c1[1] - c2[1]) * (c1[1] - c2[1]));
}

let parseSingleRouteResult = function (result, mapInfoArray, startPoint, endPoint) {
    let routePartArray = [];
    for (let i = 0; i < result["routeResult"].length; ++i) {
        let part = result["routeResult"][i];
        let processedCoordinates = [];
        if (part.coordinates.length >= 3) {
            processedCoordinates.push(part.coordinates[0]);
            let lastCoord = processedCoordinates[0];
            for (let i = 1; i < part.coordinates.length - 1; ++i) {
                let c = part.coordinates[i];
                if (dist(c, lastCoord) > 0.1) {
                    processedCoordinates.push(c);
                    lastCoord = c;
                }
            }

            let endCoord = part.coordinates[part.coordinates.length - 1];
            let endCoord2 = processedCoordinates[processedCoordinates.length - 1];
            if (dist(endCoord, endCoord2) > 0.1) {
                processedCoordinates.push(endCoord);
            } else {
                processedCoordinates[processedCoordinates.length - 1] = endCoord;
            }
        } else {
            processedCoordinates = part.coordinates;
        }

        // let routeLine = CoordProjection.mercatorArrayToLonLatArray2(part.coordinates);
        let routeLine = CoordProjection.mercatorArrayToLngLatArray2(processedCoordinates);
        let info = searchMapInfoFromArray(mapInfoArray, part.floor);
        let nodes = part.nodes;
        let routePart = new IPRoutePart(routeLine, info, nodes);
        routePart.partIndex = part.partIndex;
        routePartArray.push(routePart);
    }

    for (let j = 0; j < routePartArray.length; ++j) {
        let rp = routePartArray[j];
        if (j > 0) {
            rp.previousPart = routePartArray[j - 1];
        }
        if (j < routePartArray.length - 1) {
            rp.nextPart = routePartArray[j + 1];
        }
    }

    return new IPRouteResult(convertPoint(startPoint), convertPoint(endPoint), routePartArray);
};

function convertPoint(localPoint) {
    let point = CoordProjection.mercatorToLngLat(localPoint.x, localPoint.y);
    point.x = localPoint.x;
    point.y = localPoint.y;
    point.floor = localPoint.floor;
    return point;
}

function checkMultiStopResult(msr) {
    let success = msr.success;
    if (!success) return false;
    let t = (parseInt(msr.code) - parseInt(msr.start.y)) / parseInt(msr.start.x);
    let delta = (new Date()).valueOf() / 1000 - t;
    return Math.abs(delta) <= 3600;
}

let parseMultiStopRouteResult = function (multiStopResult, mapInfoArray, startPoint, endPoint, stopPoints, callback, errorCallback) {
    // console.log('parseMultiStopRouteResult');

    if (!checkMultiStopResult(multiStopResult)) {
        if (errorCallback != null) {
            errorCallback({statusText: '没有找到路径'});
        }
        return;
    }

    let completeRoute = parseSingleRouteResult(multiStopResult["completeRoute"], mapInfoArray, startPoint, endPoint);
    let detailArray = multiStopResult.details;
    let detailRoutes = [];
    for (let i = 0; i < detailArray.length; ++i) {
        // detailRoutes.push(parseSingleRouteResult(detailArray[i], mapInfoArray, startPoint, endPoint));
        detailRoutes.push(parseSingleRouteResult(detailArray[i], mapInfoArray, detailArray[i].start, detailArray[i].end));
    }
    let result = new IPMutliRouteResult(completeRoute, detailRoutes);

    result.startPoint = convertPoint(startPoint);
    result.endPoint = convertPoint(endPoint);
    result.startRoomID = multiStopResult.startRoomID;
    result.endRoomID = multiStopResult.endRoomID;

    let stopArray = multiStopResult.stops;
    let resStops = [];
    if (stopArray !== null && stopArray.length !== 0) {
        for (let i = 0; i < stopArray.length; ++i) {
            resStops.push(convertPoint(stopArray[i]));
        }
    }
    result.stopPoints = resStops;

    result.indices = multiStopResult.indices;

    // let color = '#EEEE00';
    // let color = '#000';
    let color = '#00f';
    let rearrangedStopArray = multiStopResult["rearrangedStop"];
    let rearrangedStopFeatures = [];
    let rearrangedStops = [];
    if (rearrangedStopArray !== null && rearrangedStopArray.length !== 0) {
        for (let i = 0; i < rearrangedStopArray.length; ++i) {
            let rp = convertPoint(rearrangedStopArray[i]);
            rearrangedStops.push(rp);
            rearrangedStopFeatures.push(Point([rp.lng, rp.lat], {'NAME': i + 1, 'color': color, 'floor': rp.floor}));
            // rearrangedStopFeatures.push(Point([rp.lng, rp.lat], {'NAME': '经', 'color': color, 'floor': rp.floor}));
        }
    }
    result.rearrangedPoints = rearrangedStops;
    result.rearrengedStopData = FeatureCollection(rearrangedStopFeatures);
    // console.log(result.rearrengedStopData);
    // console.log(result);

    // if (callback != null) {
    //     callback(result);
    // }
    return result;
};


class multi_stop_route_manager extends Evented {
    constructor(options) {
        super();
        // console.log('multi_stop_route_manager.constructor');
        this._options = options;
    }

    setBM(b, array) {
        this.building = b;
        this.allMapInfos = array;
    }

    getRouteData(startLngLat, endLngLat, stopsLngLat, callback, errorCallback, params) {
        // console.log('getRouteData');
        let start = IPLocalPoint.fromLngLat(startLngLat);
        let end = IPLocalPoint.fromLngLat(endLngLat);
        let stops = [];
        if (stopsLngLat != null && stopsLngLat.length > 0) {
            for (let i = 0; i < stopsLngLat.length; ++i) {
                let sp = IPLocalPoint.fromLngLat(stopsLngLat[i]);
                stops.push(sp);
            }
        }

        let request = new IPHttpRequest();
        let that = this;

        request.request(getRoutePath(that.building.buildingID, that._options, start, end, stops, params));
        request.on(HttpEvent.HttpResult, function (data) {
            if (data.success) {
                let result = parseMultiStopRouteResult(data, that.allMapInfos, start, end, stops, callback, errorCallback);
                that.fire(RouteEvent.RouteResult, result);
            } else {
                that.fire(RouteEvent.RouteError, {statusText: '没有找到路径'});
            }
        });
        request.on(HttpEvent.HttpError, function (error) {
            that.fire(RouteEvent.RouteError, error);
        });
    }
}

export default multi_stop_route_manager
