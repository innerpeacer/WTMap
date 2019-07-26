var geojson_utils = {};

function createPointFeature(lon, lat, props) {
    let feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [lon, lat]
        },
        'properties': props
    };
    return feature
}

function createLineFeature(points, props) {
    let coords = [];
    for (let i = 0; i < points.length; ++i) {
        coords.push([points[i].lng, points[i].lat]);
    }
    let feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': coords
        },
        'properties': props
    };
    return feature
}

geojson_utils.createLineFeature = createLineFeature;
geojson_utils.createLineFeatureCollection = function (lines) {
    let lineData = {
        'type': 'FeatureCollection',
        'features': []
    };

    let features = [];
    for (let i = 0; i < lines.length; ++i) {
        let l = lines[i];
        features.push(createLineFeature(l, l.properties));
    }
    lineData.features = features;
    return lineData;
};

geojson_utils.createPointFeatureCollection = function (points) {
    let pointData = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
            },
            'properties': {},
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

geojson_utils.emptySource = {
    'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
};
