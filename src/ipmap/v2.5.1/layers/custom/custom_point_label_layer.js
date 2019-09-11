function sourceIdentifier(name) {
    return `${name}-source`;
}

function circleLayerIdentifier(name) {
    return `${name}-circle-layer`;
}

function lineLayerIdentifier(name) {
    return `${name}-line-layer`;
}

function fillLayerIdentifier(name) {
    return `${name}-fill-layer`;
}

function symbolLayerIdentifier(name) {
    return `${name}-symbol-layer`;
}

import {extend, clone} from '../../utils/ip_util'
import {geojson_utils as GeojsonUtils} from '../../utils/geojson_utils';

let defaultCircleLayer = {
    'type': 'circle',
    'paint': {
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#888',
        'circle-color': '#3bb2d0',
        'circle-radius': 3,
    }
};

let defaultTextSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
        'text-color': '#8B8682',
    },
    'layout': {
        'text-font': ['simhei'],
        'text-offset': [0, 0.3],
        'text-anchor': 'top',
        'text-max-width': 20,
        'text-size': 9,
    }
};

class custom_point_label_layer {
    constructor(name) {
        this.name = name;

        let labelSourceID = sourceIdentifier(name);
        this.labelSourceID = labelSourceID;

        let labelSource = GeojsonUtils.emptySource;
        this.labelSource = labelSource;

        let labelCircleLayerID = circleLayerIdentifier(name);
        this.labelCircleLayerID = labelCircleLayerID;
        let circleLayer = extend({id: labelCircleLayerID, source: labelSourceID}, clone(defaultCircleLayer));
        this.labelCircleLayer = circleLayer;

        let labelSymbolLayerID = symbolLayerIdentifier(name);
        this.labelSymbolLayerID = labelSymbolLayerID;
        let symbolLayer = extend({id: labelSymbolLayerID, source: labelSourceID}, clone(defaultTextSymbolLayer));
        this.labelSymbolLayer = symbolLayer;
    }

    addToMap(map) {
        this.map = map;
        this.map.addSource(this.labelSourceID, this.labelSource);

        this.map.addLayer(this.labelCircleLayer);
        this.map.addLayer(this.labelSymbolLayer);
    }

    removeFromMap(map) {
        this.map.removeLayer(this.labelCircleLayerID);
        this.map.removeLayer(this.labelSymbolLayerID);

        this.map.removeSource(this.labelSourceID);
        this.map = null;
    }

    showLabelData(data) {
        let geojson = GeojsonUtils.createPointFeatureCollection(data);
        this.map.getSource(this.labelSourceID).setData(geojson);

    }

    setTextField(prop) {
        this.labelSymbolLayer.layout["text-field"] = prop;
    }

    setTextColor(color) {
        this.labelSymbolLayer.paint["text-color"] = color;
    }

    setTextSize(size) {
        this.labelSymbolLayer.layout["text-size"] = size;
    }

    setCircleColor(color) {
        this.labelCircleLayer.paint["circle-color"] = color;
    }

    setCircleRadius(radius) {
        this.labelCircleLayer.paint["circle-radius"] = radius;
    }

    _getLayerID() {
        return this.labelCircleLayerID;
    }
}

export {custom_point_label_layer};
