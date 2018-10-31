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