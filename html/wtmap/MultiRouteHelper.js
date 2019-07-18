var emptySource = {
    'type': 'geojson', 'data': {"type": "FeatureCollection", "features": []}
};

var layerGroup = {};
layerGroup.hintLayer = {
    "id": "hint",
    "type": "circle",
    "source": "hint",
    "paint": {
        "circle-radius": 2,
        "circle-color": "#0f0",
        "circle-opacity": 1.0,
        "circle-stroke-width": 1,
    }
};

layerGroup.startEndLayer1 = {
    "id": "startEnd1",
    "type": "circle",
    "source": "startEnd",
    "paint": {
        "circle-radius": 10,
        "circle-color": {
            'type': 'identity',
            'property': 'color'
        },
        "circle-opacity": 1.0,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 2
    }
};

layerGroup.startEndLayer2 = {
    "id": "startEnd2",
    "type": "symbol",
    "source": "startEnd",
    "paint": {
        // "text-color": "#525252",
        "text-color": "#fff",
    },
    'layout': {
        "text-field": "{NAME}",
        "text-size": 18,
        "text-font": ["simhei"],
        "text-anchor": "center",
        "text-padding": 0,
    }
};

layerGroup.paramsLayer1 = {
    "id": "param1",
    "type": "circle",
    "source": "params",
    "paint": {
        "circle-radius": 10,
        // "circle-color": "#0f0",
        "circle-color": {
            'type': 'identity',
            'property': 'color'
        },
        "circle-opacity": 1.0,
        "circle-translate": [0, -23],
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 2
    }
};

layerGroup.paramsLayer2 = {
    "id": "param2",
    "type": "symbol",
    "source": "params",
    "paint": {
        // "text-color": "#525252",
        // "text-color": "#fff",
        "text-color": "#000",
        "text-translate": [0, -20],
        "text-translate-anchor": "viewport"
    },
    'layout': {
        "text-field": "{NAME}",
        "text-size": 18,
        "text-font": ["simhei"],
        "text-anchor": "center",
        "text-padding": 0,
        // "text-offset": [0, -0.2],
        // "text-offset": [0, -0.9],
        "text-rotation-alignment": "map"
    }
};

function initLayers(amap) {
    amap.addSource("hint", emptySource);
    amap.addSource("params", emptySource);
    amap.addSource("startEnd", emptySource);

    amap.addLayer(layerGroup.paramsLayer1);
    amap.addLayer(layerGroup.paramsLayer2);

    amap.addLayer(layerGroup.startEndLayer1);
    amap.addLayer(layerGroup.startEndLayer2);

    amap.addLayer(layerGroup.hintLayer);
}

function createPointFeature(point, n, c) {
    var name = n;
    var color = c;
    if (name == null) name = "";
    if (color == null) color = "#0f0";

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [point.lng, point.lat]
        },
        "properties": {
            "NAME": name,
            "color": color
        }
    };
}

function createStartEndData(start, end) {
    var features = [];
    if (start) {
        features.push(createPointFeature(start, "S", "#00CD00"));
    }

    if (end) {
        features.push(createPointFeature(end, "E", "#FF3030"));
    }

    return {
        "type": "FeatureCollection",
        "features": features
    };
}

function createParamData(stopPoints) {
    var features = [];
    if (stopPoints) {
        for (var i = 0; i < stopPoints.length; ++i) {
            var sp = stopPoints[i];
            // features.push(createPointFeature(sp, "" + (i + 1), "#EEEE00"));
            features.push(createPointFeature(sp, "" + (i + 1), "#f0f"));
        }
    }
    return {
        "type": "FeatureCollection",
        "features": features
    };
}
