const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

class coord_projection {
    constructor() {
    }
}

let mercatorCoordToLngLatCoord = function (xy) {
    let lng = xy[0] / 20037508.34 * 180;
    let lat = xy[1] / 20037508.34 * 180;
    lat = RAD_TO_DEG * (2 * Math.atan(Math.exp(lat * DEG_TO_RAD)) - Math.PI / 2);
    return [lng, lat];
};

let lngLatCoordToMercatorCoord = function (lngLat) {
    let x = lngLat[0] * 20037508.342789 / 180;
    let y = Math.log(Math.tan((90 + lngLat[1]) * DEG_TO_RAD / 2)) / (DEG_TO_RAD);
    y = y * 20037508.34789 / 180;
    return [x, y];
};

coord_projection.lngLatToMercator = function (lng, lat) {
    // let x = lon * 20037508.342789 / 180;
    // let y = Math.log(Math.tan((90 + lat) * DEG_TO_RAD / 2)) / (DEG_TO_RAD);
    // y = y * 20037508.34789 / 180;
    // return {"x": x, "y": y}
    let xy = lngLatCoordToMercatorCoord([lng, lat]);
    return {"x": xy[0], "y": xy[1]};
};

coord_projection.mercatorToLngLat = function (x, y) {
    let lngLat = mercatorCoordToLngLatCoord([x, y]);
    return {'lng': lngLat[0], 'lat': lngLat[1]};
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