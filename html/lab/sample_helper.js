var http = new wtmap.HttpRequest();

function createSingleGpsLayer(name) {
    var gpsLayer = new wtmap.CustomPointLabelLayer(name);
    var gpsText = ["concat", "index: ", ["get", "index"], "\nAccuracy: ", ["get", "accuracy"]];
    gpsLayer.setTextField(gpsText);
    gpsLayer.setTextColor("#3e4145");
    gpsLayer.setCircleRadius(3);
    gpsLayer.setCircleColor("#00cccc");
    gpsLayer.setTextLayoutProperty("text-allow-overlap", true);
    return gpsLayer;
}

function createSingleBleLayer(name) {
    var bleLayer = new wtmap.CustomPointLabelLayer(name);
    var bleText = ["concat", "index: ", ["get", "index"]];
    bleLayer.setTextField(bleText);
    bleLayer.setTextColor("#3e4145");
    bleLayer.setCircleColor("#f47920");
    bleLayer.setCircleRadius(3);
    bleLayer.setTextLayoutProperty("text-allow-overlap", true);
    return bleLayer;
}

function createMultiBleLayer(name) {

}

function createGpsErrorLineLayer(name) {
    var gpsErrorLayer = new wtmap.CustomSegmentLineLayer(name);
    gpsErrorLayer.setLineTextField(["concat", ["get", "error"], "m"]);
    return gpsErrorLayer;
}

function createBleErrorLineLayer(name) {
    var bleErrorLayer = new wtmap.CustomSegmentLineLayer(name);
    bleErrorLayer.setLineTextField(["concat", ["get", "error"], "m"]);
    return bleErrorLayer;
}

function createSingleSampleLayer(name) {
    var sampleLayer = new wtmap.CustomPointLabelLayer(name);
    var sampleText = ["concat", ["get", "sampleID"], "\nble(", ["get", "ble"], "), gps(", ["get", "gps"], ")"];
    sampleLayer.setTextField(sampleText);
    sampleLayer.setTextColor("#48d448");
    sampleLayer.setCircleColor("#c4a000");
    sampleLayer.setCircleRadius(5);
    sampleLayer.setTextLayoutProperty("text-allow-overlap", true);
    return sampleLayer;
}

function createMultiSampleLayer(name) {
    var layer = new wtmap.CustomPointLabelLayer(name);
    layer.setTextField(["get", "sampleID"]);
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
        var lngLat = lp.getLngLat();
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

function bleSampleToGeojson(sample, map) {
    var result = {};
    var location = sample.location;
    var samplePoint = new wtmap.LocalPoint(location.x, location.y, location.floor);

    {
        samplePoint.properties = {
            timestamp: sample.timestamp,
            sampleID: sample.sampleID,
            ble: sample.bleList.length,
            gps: sample.gpsList.length,
            platform: sample.platform,
        };
        result.samplePoint = samplePoint;
        result.samplePoints = [samplePoint];
    }

    {
        var gpsPoints = [];
        var gpsErrorLines = [];
        var gpsData = sample.gpsList;
        for (var i = 0; i < gpsData.length; ++i) {
            var gData = gpsData[i];

            var accuracy = wtmap.Utils.round(gData.accuracy, 2);
            var gps = map._wtWgs84Converter.convertGPS(gData);
            gps.properties = {
                timestamp: gData.timestamp,
                accuracy: accuracy,
                index: i + 1,
            };
            gpsPoints.push(gps);

            var error = wtmap.Utils.round(samplePoint.distanceTo(gps), 2);
            var gpsErrorLine = [samplePoint.getLngLat(), gps.getLngLat()];
            gpsErrorLine.properties = {
                timestamp: gData.timestamp,
                accuracy: wtmap.Utils.round(gData.accuracy, 2),
                index: i + 1,
                error: error,
            };
            gpsErrorLines.push(gpsErrorLine);

            console.log(accuracy + " -> " + error);
        }

        result.gpsPoints = gpsPoints;
        result.gpsErrorLines = gpsErrorLines;
    }

    {
        var blePoints = [];
        var bleErrorLines = [];
        var bleData = sample.bleList;
        for (var i = 0; i < bleData.length; ++i) {
            var bData = bleData[i];

            var bleRes = map.didRangeBeacons(bData.beacons);
            var ble = bleRes.location;
            if (ble == null) continue;
            ble.properties = {
                timestamp: bData.timestamp,
                index: i + 1,
            };
            blePoints.push(ble);

            var error = wtmap.Utils.round(samplePoint.distanceTo(ble), 2);
            var bleErrorLine = [samplePoint.getLngLat(), ble.getLngLat()];
            bleErrorLine.properties = {
                timestamp: bleData.timestamp,
                index: i + 1,
                error: error,
            };
            bleErrorLines.push(bleErrorLine);
            console.log(bleRes);
            console.log(error);
        }
        result.blePoints = blePoints;
        result.bleErrorLines = bleErrorLines;
    }
    return result;
}

var allSampleUrl = "/WTMapService/lab/GetAllSamples";
var samplePbfUrl = "/WTMapService/lab/GetSamplePbf";

var sampleSimulatorHtml = "WTMap-BleSampleSimulator.html";

function getAllSampleUrl(buildingID) {
    return allSampleUrl + "?buildingID=" + buildingID;
    // return "http://192.168.100.18:16666/backend/map/api/queryAllBleSample?buildingId="+buildingID;
    // return "http://gis.cx9z.com/backend/map/api/queryAllBleSample?buildingId=" + buildingID;
    // return "http://gis.cx9z.com/backend/map/api/queryAllBleSample?buildingId=" + buildingID + "&user=oGGal";
}

function getSamplePbfUrl(sampleID) {
    return samplePbfUrl + "?sampleID=" + sampleID;
    // return "http://192.168.100.18:16666/backend/map/api/getBeaconAndGps?sampleId=" + sampleID;
    // return "http://gis.cx9z.com/backend/map/api/getBeaconAndGps?sampleId=" + sampleID;
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
