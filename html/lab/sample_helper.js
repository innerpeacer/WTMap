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

function gpsToGeojson(gps, map) {
    var lngLat = map._wtWgs84Converter.convertGPS(gps);
    lngLat.properties = {
        timestamp: gps.timestamp,
        accuracy: wtmap.Utils.round(gps.accuracy, 2),
        index: gps.index,
    };
    return [lngLat];
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

function pbfParserToGeojson(parser, map) {
    var result = {};
    var sample = parser.data;
    var location = sample.location;

    {
        var samplePoints = [];
        var lp = new wtmap.LocalPoint(location.x, location.y, location.floor);
        var lngLat = lp.getLngLat();
        lngLat.properties = {
            timestamp: sample.timestamp,
            sampleID: sample.sampleID,
            ble: sample.bleList.length,
            gps: sample.gpsList.length,
            platform: sample.platform,
        };
        samplePoints.push(lngLat);

        result.samplePoints = samplePoints
    }

    {
        var gpsPoints = [];
        var gpsData = sample.gpsList;
        for (var i = 0; i < gpsData.length; ++i) {
            var gps = gpsData[i];
            var lngLat = map._wtWgs84Converter.convertGPS(gps);
            lngLat.properties = {
                timestamp: gps.timestamp,
                accuracy: wtmap.Utils.round(gps.accuracy, 2),
                index: i + 1,
            };
            gpsPoints.push(lngLat);
        }

        result.gpsPoints = gpsPoints;
    }

    {
        var blePoints = [];
        var bleData = sample.bleList;
        for (var i = 0; i < bleData.length; ++i) {
            var ble = bleData[i];
            var bleRes = map.didRangeBeacons(ble.beacons);
            var lngLat = bleRes.location;
            lngLat.properties = {
                timestamp: ble.timestamp,
                index: i + 1,
            };
            blePoints.push(lngLat);
        }
        result.blePoints = blePoints;
    }
    return result;
}

var allSampleUrl = "/WTMapService/lab/GetAllSamples";
var samplePbfUrl = "/WTMapService/lab/GetSamplePbf";

var sampleSimulatorHtml = "WTMap-BleSampleSimulator.html";

function getAllSampleUrl(buildingID) {
    return allSampleUrl + "?buildingID=" + buildingID;
    // return "http://192.168.100.18:16666/backend/map/api/queryAllBleSample?buildingID=0027003";
}

function getSamplePbfUrl(sampleID) {
    return samplePbfUrl + "?sampleID=" + sampleID;
    // return "http://192.168.100.18:16666/backend/map/api/getBeaconAndGps?sampleId=" + sampleID;
}

function getSampleSimulatorHtml(buildingID, sampleID, floor) {
    var sampleSimulatorHtml = "WTMap-BleSampleSimulator.html";
    sampleSimulatorHtml += "?buildingID=" + buildingID;
    sampleSimulatorHtml += "&sampleID=" + sampleID;
    sampleSimulatorHtml += "&floor=" + floor;
    return sampleSimulatorHtml;
}

function getSampleDetailHtml(buildingID, sampleID, floor) {
    var sampleDetailHtml = "WTMap-BleSampleDetail.html";
    sampleDetailHtml += "?buildingID=" + buildingID;
    sampleDetailHtml += "&sampleID=" + sampleID;
    sampleDetailHtml += "&floor=" + floor;
    return sampleDetailHtml;
}
