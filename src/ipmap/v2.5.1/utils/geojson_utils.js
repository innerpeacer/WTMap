class geojson_utils {

}

function createPointFeature(lon, lat, props) {
    var feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat]
        },
        "properties": props
    };
    return feature
}

geojson_utils.createPointFeatureCollection = function (points) {
    // console.log("geojson_utils.createPointFeatureCollection");
    var pointData = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [0, 0]
            },
            "properties": {},
        }]
    };

    var features = [];
    for (var i = 0; i < points.length; ++i) {
        var p = points[i];
        features.push(createPointFeature(p.lng, p.lat, p.properties));
    }
    pointData.features = features;
    return pointData;
};

export default geojson_utils;