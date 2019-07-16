class geojson_utils {

}

function createPointFeature(lon, lat, props) {
    let feature = {
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
    let pointData = {
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

    let features = [];
    for (let i = 0; i < points.length; ++i) {
        let p = points[i];
        features.push(createPointFeature(p.lng, p.lat, p.properties));
    }
    pointData.features = features;
    return pointData;
};

export default geojson_utils;