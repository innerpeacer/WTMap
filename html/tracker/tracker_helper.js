var http = new wtmap.HttpRequest();

function createTrackerLayer(name) {
    var trackerLayer = new wtmap.CustomPointLabelLayer(name);
    var trackerText = ["concat", "", ["get", "userID"]];
    trackerLayer.setTextField(trackerText);
    trackerLayer.setTextColor("#f26522")
    trackerLayer.setCircleRadius(5)
    trackerLayer.setCircleColor("#f26522")
    trackerLayer.setTextLayoutProperty("text-allow-overlap", true);
    return trackerLayer;
}

let heatmapSourceID;
let heatmapLayerID;

function initHeatmapLayer(map) {
    heatmapSourceID = "heatmapSource";
    let heatmapSource = {
        'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
    };
    map.addSource(heatmapSourceID, heatmapSource);

    heatmapLayerID = "heatmapLayer";

    var layerID = map.getLayerIDs("extrusion");
    console.log("layerID");
    console.log(layerID);

    let heatmapLayer = {
        'id': heatmapLayerID,
        'type': 'heatmap',
        'source': heatmapSourceID,
        'paint': {
            // "heatmap-radius": 30,
            // "heatmap-weight": 0.5,
            // "heatmap-opacity": 0.8,
            // "heatmap-intensity": 1,
            // "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0, 0, 255, 0)", 0.1, "royalblue", 0.3, "cyan", 0.5, "lime", 0.7, "yellow", 1, "red"],
            "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(255, 0, 0, 0)", 0.1, "royalblue", 0.3, "cyan", 0.5, "lime", 0.7, "yellow", 1, "red"],
        }
    }
    // map.addLayer(heatmapLayer, layerID[0]);
    map.addLayer(heatmapLayer);
}

function setHeatmapData(map, data) {
    // console.log("setHeatmapData")
    // console.log(data);
    map.getSource(heatmapSourceID).setData(wtmap.GeojsonUtils.createPointFeatureCollection(data));
}

function createHeatmapLayer(name) {

}

function addHeatmapToMap(heatmapLayer, map) {

}

function locationDataToGeojson(locationData) {
    var locationArray = [];
    for (var i = 0; i < locationData.length; ++i) {
        var location = locationData[i];
        var lp = new wtmap.LocalPoint(location.x, location.y, location.floor);
        var lngLat = lp.getLngLat();
        lngLat.properties = {
            userID: location.userID,
            timestamp: location.timestamp
        };
        locationArray.push(lngLat);
    }
    return locationArray;
}


var queryLocationUrl = "/LBServer/queryLocation";

function getLocationDataUrl(userID) {
    if (userID) {
        return queryLocationUrl + "?userID=" + userID;
    }
    return queryLocationUrl;
}