import {layerIdentifier, sourceIdentifier} from "./layer_identifier";
import {extend, clone} from '../../utils/ip_util';
import {geojson_utils as GeojsonUtils} from '../../utils/geojson_utils';

let defaultLineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': '#d9d6c3',
        'line-width': 0.5,
    }
};

let defaultTextSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
        'text-color': '#8B8682',
    },
    'layout': {
        'text-allow-overlap': true,
        'symbol-placement': 'line-center',
        'text-font': ['simhei'],
        'text-offset': [0, -0.5],
        'text-anchor': 'center',
        'text-size': 9,
    }
};

class custom_segment_line_layer {
    constructor(name) {
        this.name = name;

        let lineSourceID = sourceIdentifier(name);
        this.lineSourceID = lineSourceID;

        let lineSource = GeojsonUtils.emptySource;
        this.lineSource = lineSource;

        let lineLayerID = layerIdentifier(name, "line");
        this.lineLayerID = lineLayerID;
        let lineLayer = extend({id: lineLayerID, source: lineSourceID}, clone(defaultLineLayer));
        this.lineLayer = lineLayer;

        let lineSymbolLayerID = layerIdentifier(name, 'symbol');
        this.lineSymbolLayerID = lineSymbolLayerID;
        let lineSymbolLayer = extend({id: lineSymbolLayerID, source: lineSourceID}, clone(defaultTextSymbolLayer));
        this.lineSymbolLayer = lineSymbolLayer;
    }

    addToMap(map) {
        this.map = map;
        this.map.addSource(this.lineSourceID, this.lineSource);

        this.map.addLayer(this.lineLayer);
        this.map.addLayer(this.lineSymbolLayer);
    }

    removeFromMap(map) {
        this.map.removeLayer(this.lineLayerID);
        this.map.removeLayer(this.lineSymbolLayerID);

        this.map.removeSource(this.lineSourceID);
        this.map = null;
    }

    setLineWidth(width) {
        this.lineLayer.paint["line-width"] = width;
    }

    setLineColor(color) {
        this.lineLayer.paint["line-color"] = color;
    }

    setLineTextField(prop) {
        this.lineSymbolLayer.layout["text-field"] = prop;
    }

    setLineTextColor(color) {
        this.lineSymbolLayer.paint["text-color"] = color;
    }

    setLineTextSize(size) {
        this.lineSymbolLayer.layout["text-size"] = size;
    }

    setLinePaintProperty(prop, value) {
        this.lineLayer.paint[prop] = value;
    }

    setLineLayoutProperty(prop, value) {
        this.lineLayer.layout[prop] = value;
    }

    setTextPaintProperty(prop, value) {
        this.lineSymbolLayer.paint[prop] = value;
    }

    setTextLayoutProperty(prop, value) {
        this.lineSymbolLayer.layout[prop] = value;
    }

    showLineData(data) {
        let geojson = GeojsonUtils.createLineFeatureCollection(data);
        this.map.getSource(this.lineSourceID).setData(geojson);
    }
}

export {custom_segment_line_layer}
