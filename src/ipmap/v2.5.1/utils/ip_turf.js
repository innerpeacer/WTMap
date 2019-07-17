import {point, featureCollection, lineString} from '@turf/helpers';
import bearing from '@turf/bearing';
import nearest from '@turf/nearest';
import along from '@turf/along';
import lineDistance from '@turf/line-distance';
import lineSlice from '@turf/line-slice';
import lineSliceAlong from '@turf/line-slice-along';
import lineChunk from '@turf/line-chunk';
import pointOnLine from '@turf/point-on-line';

import pointToLineDistance from '@turf/point-to-line-distance'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import distance from '@turf/distance'

import length from '@turf/length'

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
    pointOnLine: pointOnLine,

    pointToLineDistance: pointToLineDistance,
    nearestPointOnLine: nearestPointOnLine,
    distance: distance,
    length: length
};

export default IPTurf;
