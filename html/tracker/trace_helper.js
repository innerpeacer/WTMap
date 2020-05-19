var http = new wtmap.HttpRequest();

function createTraceLayer(name) {
    var traceLayer = new wtmap.CustomTraceLayer(name);
    return traceLayer;
}

function tracePointsToGeojson(tracePoints) {
    var tpArray = [];
    for (var i = 0; i < tracePoints.length; ++i) {
        var tp = tracePoints[i];
        var lp = new wtmap.LocalPoint(tp.x, tp.y, tp.floor);
        var lngLat = lp.getLngLat();
        lngLat.properties = {
            floor: tp.floor
        };
        tpArray.push(lngLat);
    }
    return tpArray;
}

var queryTraceUrl = "/LBServer/queryTrace";

function getQueryTraceUrl(userID) {
    return queryTraceUrl + "?userID=" + userID;
}