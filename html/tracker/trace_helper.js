var http = new wtmap.HttpRequest();

function createTraceLayer(name) {
    var traceLayer = new wtmap.CustomTraceLayer(name);
    // traceLayer.setTextLayoutProperty("text-field", ["concat", "index: ", ["get", "index"]]);
    traceLayer.setTextLayoutProperty("text-field", ["concat", ["get", "date"]]);
    return traceLayer;
}

function createTraceComparsionLayer(name) {
    var traceComparisionLayer = new wtmap.CustomSegmentLineLayer(name);
    return traceComparisionLayer;
}

function tracePointsToGeojson(tracePoints) {
    var tpArray = [];
    for (var i = 0; i < tracePoints.length; ++i) {
        var tp = tracePoints[i];
        var lp = new wtmap.LocalPoint(tp.x, tp.y, tp.floor);
        var lngLat = lp.getLngLat();
        lngLat.properties = {
            index: i,
            date: tp.date,
            floor: tp.floor
        };
        tpArray.push(lngLat);
    }
    return tpArray;
}

var queryTraceUrl = "/LBServer/queryTrace";
var queryFilteredTraceUrl = "/LBServer/queryFilteredTrace";

function getQueryTraceUrl(userID, isFilter) {
    if (isFilter) {
        return queryFilteredTraceUrl + "?distance=20&window=30&date=2020-05-20&userID=" + userID;
        // return queryFilteredTraceUrl + "?distance=20&date=2020-05-19&userID=" + userID;
    }
    return queryTraceUrl + "?date=2020-05-20&userID=" + userID;
}

function getTestTraceUrl() {
    return "http://101.132.138.146/locationServer/location/queryHistoryLocationOne?buildingId=05712001&peopleId=1&startTime=2020-05-15 09:50:17&endTime=2020-05-15 19:50:17&type=0";
}