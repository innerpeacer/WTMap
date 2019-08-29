const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

const CIRCUMFERENCE_OF_EARTH = 20037508.34789;

class coord_projection {
    constructor() {
    }
}

let mercatorCoordToLngLatCoord = function (xy) {
    let lng = xy[0] / CIRCUMFERENCE_OF_EARTH * 180;
    let lat = xy[1] / CIRCUMFERENCE_OF_EARTH * 180;
    lat = RAD_TO_DEG * (2 * Math.atan(Math.exp(lat * DEG_TO_RAD)) - Math.PI / 2);
    return [lng, lat];
};

let lngLatCoordToMercatorCoord = function (lngLat) {
    let x = lngLat[0] * CIRCUMFERENCE_OF_EARTH / 180;
    let y = Math.log(Math.tan((90 + lngLat[1]) * DEG_TO_RAD / 2)) / (DEG_TO_RAD);
    y = y * CIRCUMFERENCE_OF_EARTH / 180;
    return [x, y];
};

// coord_projection.lngLatToMercator = function (lng, lat) {
//     let xy = lngLatCoordToMercatorCoord([lng, lat]);
//     return {'x': xy[0], 'y': xy[1]};
// };

coord_projection.lngLatToMercator = function (input1, input2) {
    let lng, lat;
    if (Array.isArray(input1) && (input1.length === 2)) {
        lng = Number(input1[0]);
        lat = Number(input1[1]);
    } else if (typeof input1 === "object") {
        lng = input1.lng;
        lat = input1.lat;
    } else {
        lng = Number(input1);
        lat = Number(input2);
    }
    let xy = lngLatCoordToMercatorCoord([lng, lat]);
    return {x: xy[0], y: xy[1], lng: lng, lat: lat};
};

// coord_projection.mercatorToLngLat = function (x, y) {
//     let lngLat = mercatorCoordToLngLatCoord([x, y]);
//     return {'lng': lngLat[0], 'lat': lngLat[1]};
// };

coord_projection.mercatorToLngLat = function (input1, input2) {
    let x, y;
    if (Array.isArray(input1) && (input1.length === 2)) {
        x = Number(input1[0]);
        y = Number(input1[1]);
    } else if (typeof input1 === "object") {
        x = input1.x;
        y = input1.y;
    } else {
        x = Number(input1);
        y = Number(input2);
    }

    let lngLat = mercatorCoordToLngLatCoord([x, y]);
    return {lng: lngLat[0], lat: lngLat[1], x: x, y: y};
};

coord_projection.mercatorArrayToLngLatArray1 = function (coordArray) {
    return mercatorCoordToLngLatCoord(coordArray);
};

coord_projection.mercatorArrayToLngLatArray2 = function (coordArray) {
    let lngLatArray = [];
    for (let i = 0; i < coordArray.length; ++i) {
        let lngLat = mercatorCoordToLngLatCoord(coordArray[i]);
        lngLatArray.push(lngLat);
    }
    return lngLatArray;
};

export default coord_projection
