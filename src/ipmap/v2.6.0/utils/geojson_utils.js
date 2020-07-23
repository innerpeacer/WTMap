class geojson_utils {

}

function createPointFeature(lng, lat, props) {
    return {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [lng, lat]
        },
        'properties': props
    };
}

function createPointFeatureCollection(points) {
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
}

geojson_utils.createPointFeatureCollection = createPointFeatureCollection;

function createLineFeature(points, props) {
    let coords = [];
    for (let i = 0; i < points.length; ++i) {
        coords.push([points[i].lng, points[i].lat]);
    }
    return {
        'type': 'Feature',
        'geometry': {
            'type': 'LineString',
            'coordinates': coords
        },
        'properties': props
    };
}

function createLineFeatureCollection(lines) {
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
}

geojson_utils.createLineFeatureCollection = createLineFeatureCollection;

geojson_utils.emptySource = {
    'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
};

geojson_utils.emptyGeojson = {'type': 'FeatureCollection', 'features': []};

export {geojson_utils};
