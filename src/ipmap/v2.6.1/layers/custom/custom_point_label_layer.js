// @flow
import {layerIdentifier, sourceIdentifier} from './layer_identifier';
import {extend, clone, geojson_utils as GeojsonUtils} from '../../../dependencies.js';
import {IPMap} from '../../map/map';

let defaultCircleLayer = {
    'type': 'circle',
    'paint': {
        'circle-stroke-width': 0.5,
        'circle-stroke-color': '#888',
        'circle-color': '#3bb2d0',
        'circle-radius': 3
    }
};

let defaultTextSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
        'text-color': '#8B8682'
    },
    'layout': {
        'text-font': ['simhei'],
        'text-offset': [0, 0.3],
        'text-anchor': 'top',
        'text-max-width': 20,
        'text-size': 9
    }
};

class custom_point_label_layer {
    name: string;
    map: IPMap | any;

    labelSourceID: string;
    labelSource: Object;

    labelCircleLayerID: string;
    labelCircleLayer: Object;

    labelSymbolLayerID: string;
    labelSymbolLayer: Object;

    constructor(name: string) {
        this.name = name;

        let labelSourceID = sourceIdentifier(name);
        this.labelSourceID = labelSourceID;
        this.labelSource = GeojsonUtils.emptySource;

        let labelCircleLayerID = layerIdentifier(name, 'circle');
        this.labelCircleLayerID = labelCircleLayerID;
        this.labelCircleLayer = extend({id: labelCircleLayerID, source: labelSourceID}, clone(defaultCircleLayer));

        let labelSymbolLayerID = layerIdentifier(name, 'symbol');
        this.labelSymbolLayerID = labelSymbolLayerID;
        this.labelSymbolLayer = extend({id: labelSymbolLayerID, source: labelSourceID}, clone(defaultTextSymbolLayer));
    }

    cloneWithName(name: string): custom_point_label_layer {
        let layer = new custom_point_label_layer(name);
        layer.labelCircleLayer.paint = clone(this.labelCircleLayer.paint);
        layer.labelSymbolLayer.paint = clone(this.labelSymbolLayer.paint);
        layer.labelSymbolLayer.layout = clone(this.labelSymbolLayer.layout);
        return layer;
    }

    addToMap(map: IPMap) {
        this.map = map;
        this.map.addSource(this.labelSourceID, this.labelSource);

        this.map.addLayer(this.labelCircleLayer);
        this.map.addLayer(this.labelSymbolLayer);
    }

    removeFromMap() {
        this.map.removeLayer(this.labelCircleLayerID);
        this.map.removeLayer(this.labelSymbolLayerID);

        this.map.removeSource(this.labelSourceID);
        this.map = null;
    }

    showLabelData(data: Object) {
        let geojson = GeojsonUtils.createPointFeatureCollection(data);
        this.map.getSource(this.labelSourceID).setData(geojson);
    }

    showGeojsonData(geojson: Object) {
        this.map.getSource(this.labelSourceID).setData(geojson);
    }

    setTextField(prop: any) {
        this.labelSymbolLayer.layout['text-field'] = prop;
    }

    setTextColor(color: any) {
        this.labelSymbolLayer.paint['text-color'] = color;
    }

    setTextSize(size: any) {
        this.labelSymbolLayer.layout['text-size'] = size;
    }

    setCircleColor(color: any) {
        this.labelCircleLayer.paint['circle-color'] = color;
    }

    setCircleRadius(radius: any) {
        this.labelCircleLayer.paint['circle-radius'] = radius;
    }

    setCirclePaintProperty(prop: string, value: any) {
        this.labelCircleLayer.paint[prop] = value;
    }

    setTextPaintProperty(prop: string, value: any) {
        this.labelSymbolLayer.paint[prop] = value;
    }

    setTextLayoutProperty(prop: string, value: any) {
        this.labelSymbolLayer.layout[prop] = value;
    }

    updateCircleProperty(type: string, prop: string, value: any) {
        if (type === 'paint') {
            this.map.setPaintProperty(this.labelCircleLayerID, prop, value);
        } else if (type === 'layout') {
            this.map.setLayoutProperty(this.labelCircleLayerID, prop, value);
        }
    }

    updateTextProperty(type: string, prop: string, value: any) {
        if (type === 'paint') {
            this.map.setPaintProperty(this.labelSymbolLayerID, prop, value);
        } else if (type === 'layout') {
            this.map.setLayoutProperty(this.labelSymbolLayerID, prop, value);
        }
    }

    setFilter(filter: any) {
        this.labelCircleLayer.filter = filter;
        this.labelSymbolLayer.filter = filter;
    }

    updateFilter(filter: any) {
        this.map.setFilter(this.labelCircleLayerID, filter);
        this.map.setFilter(this.labelSymbolLayerID, filter);
    }

    setFloor(floorNumber: number) {
        let filter = ['all', ['==', 'floor', floorNumber]];
        this.updateFilter(filter);
    }

    _getLayerID(): string {
        return this.labelCircleLayerID;
    }
}

export {custom_point_label_layer};
