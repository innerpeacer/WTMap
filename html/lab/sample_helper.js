var http = new wtmap.HttpRequest();

function createSingleGpsLayer(name) {
    var gpsLayer = new wtmap.CustomPointLabelLayer(name);
    var gpsText = ["concat", "index: ", ["get", "index"], "\nAccuracy: ", ["get", "accuracy"]];
    gpsLayer.setTextField(gpsText);
    gpsLayer.setTextColor("#000000");
    gpsLayer.setCircleRadius(3);
    // gpsLayer.setCircleColor("#00ff00");
    gpsLayer.setCircleColor("#00cccc");
    gpsLayer.setTextLayoutProperty("text-allow-overlap", true);
    return gpsLayer;
}

function createSingleSampleLayer(name) {
    var sampleLayer = new wtmap.CustomPointLabelLayer(name);
    // sampleLayer.setTextProperty("user");
    // sampleLayer.setTextField(["get", "sampleID"]);
    var sampleText = ["concat", ["get", "sampleID"], "\nble(", ["get", "ble"], "), gps(", ["get", "gps"], ")"];
    sampleLayer.setTextField(sampleText);
    // sampleLayer.setTextColor("#ff0000");
    sampleLayer.setTextColor("#48d448");
    // sampleLayer.setTextSize(20);
    // sampleLayer.setCircleColor("#ff0000");
    sampleLayer.setCircleColor("#c4a000");
    sampleLayer.setCircleRadius(5);
    sampleLayer.setTextLayoutProperty("text-allow-overlap", true);
    return sampleLayer;
}

function createMultiSampleLayer(name) {
    var layer = new wtmap.CustomPointLabelLayer(name);
    // layer.setTextProperty("user");
    layer.setTextField(["get", "sampleID"]);
    // layer.setTextColor("#000000");
    // layer.setTextSize(20);
    // layer.setCircleColor("#ff0000");
    // layer.setCircleRadius(20);
    return layer;
}

function samplePointsToGeojson(samplePoints) {
    var spArray = [];
    for (var i = 0; i < samplePoints.length; ++i) {
        var sp = samplePoints[i];
        var lp = new wtmap.LocalPoint(sp.x, sp.y, sp.floor);
        var lngLat = lp.toLngLatPoint();
        lngLat.properties = {
            user: sp.user,
            sampleID: sp.sampleID,
            ble: sp.ble,
            gps: sp.gps,
            floor: sp.floor,
            platform: sp.platform,
        };
        spArray.push(lngLat);
    }
    return spArray;
}


var allSampleUrl = "/WTMapService/lab/GetAllSamples";

function getAllSampleUrl(buildingID) {
    return allSampleUrl + "?buildingID=" + buildingID;
}
