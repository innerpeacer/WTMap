// module.exports = {
//     point: require('@turf/helpers').point,
//     featureCollection: require('@turf/helpers').featureCollection,
//     lineString: require('@turf/helpers').lineString,
//
//     bearing: require('@turf/bearing'),
//
//     nearest: require('@turf/nearest'),
//
//     along: require('@turf/along'),
//     lineDistance: require('@turf/line-distance'),
//     lineSlice: require('@turf/line-slice'),
//     lineSliceAlong: require('@turf/line-slice-along'),
//     lineChunk: require('@turf/line-chunk'),
//     pointOnLine: require('@turf/point-on-line')
// };

import {point, featureCollection, lineString} from "@turf/helpers";
import bearing from "@turf/bearing";
import nearest from "@turf/nearest";
import along from "@turf/along";
import lineDistance from "@turf/line-distance";
import lineSlice from "@turf/line-slice";
import lineSliceAlong from "@turf/line-slice-along";
import lineChunk from "@turf/line-chunk";
import pointOnLine from "@turf/point-on-line";

let IPTurf = {
    point: point,
    featureCollection: featureCollection,
    lineString: lineString,

    bearing: bearing,
    nearest: nearest,

    along: along,
    lineDistance: lineDistance,
    lineSlice: lineSlice,
    lineSliceAlong: lineSliceAlong,
    lineChunk: lineChunk,
    pointOnLine: pointOnLine
};

export default IPTurf;