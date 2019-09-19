import {coord_projection as CoordProjection} from '../utils/coord_projection'
import {local_point as TYLocalPoint} from './local_point'

class entity_utils {
    constructor() {
    }
}

entity_utils.lngLatPoint2LocalPoint = function (lngLatPoint) {
    return TYLocalPoint.fromLngLat(lngLatPoint);
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
