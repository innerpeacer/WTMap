import CoordProjection from '../utils/coord_projection'
import {local_point as TYLocalPoint, lnglat_point as TYLngLatPoint} from './local_point'

class entity_utils {
    constructor() {
    }
}

entity_utils.localPoint2LngLatPoint = function (localPoint) {
    let m = CoordProjection.mercatorToLngLat(localPoint.x, localPoint.y);
    return new TYLngLatPoint(m.lng, m.lat, localPoint.floor);
};

entity_utils.lngLatPoint2LocalPoint = function (lngLatPoint) {
    let m = CoordProjection.lngLatToMercator(lngLatPoint.lng, lngLatPoint.lat);
    return new TYLocalPoint(m.x, m.y, lngLatPoint.floor);
};

entity_utils.getBounds = function (mapInfo) {
    let min = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmin, mapInfo.mapExtent.ymin);
    let max = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmax, mapInfo.mapExtent.ymax);
    return [[min.lng, min.lat], [max.lng, max.lat]];
};

entity_utils.extendedBounds = function (mapInfo, percent) {
    let extentedWidth = (mapInfo.mapExtent.xmax - mapInfo.mapExtent.xmin) * percent;
    let extentedHeight = (mapInfo.mapExtent.ymax - mapInfo.mapExtent.ymin) * percent;
    let min = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmin - extentedWidth, mapInfo.mapExtent.ymin - extentedHeight);
    let max = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmax + extentedWidth, mapInfo.mapExtent.ymax + extentedHeight);
    return [[min.lng, min.lat], [max.lng, max.lat]];
};

entity_utils.extendedBounds2 = function (mapInfo, percent) {
    let extentedWidth = (mapInfo.mapExtent.xmax - mapInfo.mapExtent.xmin) * percent;
    let extentedHeight = (mapInfo.mapExtent.ymax - mapInfo.mapExtent.ymin) * percent;
    let min = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmin - extentedWidth, mapInfo.mapExtent.ymin - extentedHeight);
    let max = CoordProjection.mercatorToLngLat(mapInfo.mapExtent.xmax + extentedWidth, mapInfo.mapExtent.ymax + extentedHeight);
    return [min.lng, min.lat, max.lng, max.lat];
};

export default entity_utils
