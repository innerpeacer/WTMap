// @flow
import {layerIdentifier, sourceIdentifier} from './layer_identifier';
import {extend, clone, geojson_utils as GeojsonUtils} from '../../../dependencies.js';
import {IPMap} from '../../map/map';

let defaultLineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': '#d9d6c3',
        'line-width': 0.5
    }
};

let defaultTextSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
        'text-color': '#8B8682'
    },
    'layout': {
        'text-allow-overlap': true,
        'symbol-placement': 'line-center',
        'text-font': ['simhei'],
        'text-offset': [0, -0.5],
        'text-anchor': 'center',
        'text-size': 9
    }
};

class custom_segment_line_layer {
    name: string;
    map: IPMap | any;

    lineSourceID: string;
    lineSource: Object;

    lineLayerID: string;
    lineLayer: Object;

    lineSymbolLayerID: string;
    lineSymbolLayer: Object;

    constructor(name: string) {

        this.name = name;

        let lineSourceID = sourceIdentifier(name);
        this.lineSourceID = lineSourceID;
        this.lineSource = GeojsonUtils.emptySource;

        let lineLayerID = layerIdentifier(name, 'line');
        this.lineLayerID = lineLayerID;
        this.lineLayer = extend({id: lineLayerID, source: lineSourceID}, clone(defaultLineLayer));

        let lineSymbolLayerID = layerIdentifier(name, 'symbol');
        this.lineSymbolLayerID = lineSymbolLayerID;
        this.lineSymbolLayer = extend({id: lineSymbolLayerID, source: lineSourceID}, clone(defaultTextSymbolLayer));
    }

    addToMap(map: IPMap) {
        this.map = map;
        this.map.addSource(this.lineSourceID, this.lineSource);

        this.map.addLayer(this.lineLayer);
        this.map.addLayer(this.lineSymbolLayer);
    }

    removeFromMap() {
        this.map.removeLayer(this.lineLayerID);
        this.map.removeLayer(this.lineSymbolLayerID);

        this.map.removeSource(this.lineSourceID);
        this.map = null;
    }

    setLineWidth(width: any) {
        this.lineLayer.paint['line-width'] = width;
    }

    setLineColor(color: any) {
        this.lineLayer.paint['line-color'] = color;
    }

    setLineTextField(prop: any) {
        this.lineSymbolLayer.layout['text-field'] = prop;
    }

    setLineTextColor(color: any) {
        this.lineSymbolLayer.paint['text-color'] = color;
    }

    setLineTextSize(size: any) {
        this.lineSymbolLayer.layout['text-size'] = size;
    }

    setLinePaintProperty(prop: string, value: any) {
        this.lineLayer.paint[prop] = value;
    }

    setLineLayoutProperty(prop: string, value: any) {
        this.lineLayer.layout[prop] = value;
    }

    setTextPaintProperty(prop: string, value: any) {
        this.lineSymbolLayer.paint[prop] = value;
    }

    setTextLayoutProperty(prop: string, value: any) {
        this.lineSymbolLayer.layout[prop] = value;
    }

    updateLineProperty(type: string, prop: string, value: any) {
        if (type === 'paint') {
            this.map.setPaintProperty(this.lineLayerID, prop, value);
        } else if (type === 'layout') {
            this.map.setLayoutProperty(this.lineLayerID, prop, value);
        }
    }

    updateTextProperty(type: string, prop: string, value: any) {
        if (type === 'paint') {
            this.map.setPaintProperty(this.lineSymbolLayerID, prop, value);
        } else if (type === 'layout') {
            this.map.setLayoutProperty(this.lineSymbolLayerID, prop, value);
        }
    }

    showLineData(data: Array<Object>) {
        let geojson = GeojsonUtils.createLineFeatureCollection(data);
        this.map.getSource(this.lineSourceID).setData(geojson);
    }

    showGeojsonData(geojson: Object) {
        this.map.getSource(this.lineSourceID).setData(geojson);
    }
}

export {custom_segment_line_layer};
