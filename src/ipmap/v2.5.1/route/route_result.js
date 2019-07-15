import ipTurf from "../utils/ip_turf"

let Point = ipTurf.point;
let Bearing = ipTurf.bearing;
let LineString = ipTurf.lineString;
let FeatureCollection = ipTurf.featureCollection;


function sliceLength(zoom) {
    let defaultLength = 5;
    let defaultZoom = 20;
    let deltaZoom = defaultZoom - zoom;
    let scale = Math.pow(2, deltaZoom);
    console.log(scale);

    let length = defaultLength * scale;
    console.log("zoom: " + zoom);
    console.log("length: " + length);
    return length;
}

function sliceLength2(zoom) {
    if (zoom >= 19) return 6;
    if (zoom < 19) return 12;
}

class route_result {
    constructor(start, end, routePartArray) {
        this.start = start;
        this.end = end;
        this._allRoutePartArray = routePartArray;
        this._allFloorRoutePartDict = {};

        let features = [];
        for (let i = 0; i < routePartArray.length; ++i) {
            let rp = routePartArray[i];
            let floor = rp.mapInfo.floorNumber;
            features.push(rp.getGeometry());
            if (typeof this._allFloorRoutePartDict[floor + ""] === "undefined") {
                this._allFloorRoutePartDict[floor + ""] = [];
            }
            let floorArray = this._allFloorRoutePartDict[floor + ""];
            floorArray.push(rp);
        }
        this.data = FeatureCollection(features);
    }


    getArrowPoints(zoom, offset) {
        if (zoom == null) zoom = 20;

        let arrowPoints = [];
        for (let i = 0; i < this._allRoutePartArray.length; ++i) {
            let rp = this._allRoutePartArray[i];
            let floor = rp.mapInfo.floorNumber;
            if (rp._isSinglePointLine) {
                continue;
            }
            let line = rp.getGeometry();

            let lineLength = ipTurf.lineDistance(line, 'meters');
            line = ipTurf.lineSliceAlong(line, offset, lineLength, 'meters');
            if (line.geometry.coordinates.length == 2) continue;

            let chunks = ipTurf.lineChunk(line, sliceLength2(zoom), 'meters');
            chunks.features.forEach(function (segment) {
                let bearing = Bearing(segment.geometry.coordinates[0], segment.geometry.coordinates[1]);
                arrowPoints.push(ipTurf.point(segment.geometry.coordinates[0], {angle: bearing, floor: floor}));
            });
        }
        // this.data.features.forEach(function (line) {
        //     let chunks = ipTurf.lineChunk(line, 5, 'meters');
        //     chunks.features.forEach(function (line) {
        //         let bearing = Bearing(line.geometry.coordinates[0], line.geometry.coordinates[1]);
        //         arrowPoints.push(ipTurf.point(line.geometry.coordinates[0], {angle: bearing}));
        //     });
        // });

        return FeatureCollection(arrowPoints);
    }

    getNearestPoint(location) {
        let features = this.getRoutePartsOnFloor(location.floor);
        if (features != null) {
            let minDistance = 10000000;
            let minRP = null;
            let minNP = null;
            features.forEach(function (rp) {
                // let line = LineString(rp.route);
                let line = rp.getGeometry();
                let p = Point([location.x, location.y]);
                let npOnLine = ipTurf.pointOnLine(line, p, "meters");

                if (npOnLine.properties.dist < minDistance) {
                    minDistance = npOnLine.properties.dist;
                    minRP = rp;
                    minNP = npOnLine;
                }
            });

            return {routePart: minRP, point: minNP, distance: minDistance};
        }
        return null;
    }

    getRoutePart(index) {
        return this._allRoutePartArray[index];
    }

    getRoutePartsOnFloor(floor) {
        return this._allFloorRoutePartDict[floor];
    }
}

export default route_result