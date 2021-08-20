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

let defaultLineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': '#d9d6c3',
        'line-width': 2,
        'line-dasharray': [1, 3]
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

class custom_trace_layer {
    name: string;
    map: IPMap | any;

    traceLineSourceID: string;
    traceLineSource: Object;

    traceLineLayerID: string;
    traceLineLayer: Object;

    tracePointSourceID: string;
    tracePointSource: Object;

    tracePointCircleLayerID: string;
    tracePointCircleLayer: Object;

    tracePointSymbolLayerID: string;
    tracePointSymbolLayer: Object;

    constructor(name: string) {
        this.name = name;
        let typeName = 'trace';
        let traceLineSourceID = sourceIdentifier(`${name}-${typeName}-line`);
        this.traceLineSourceID = traceLineSourceID;
        this.traceLineSource = GeojsonUtils.emptySource;

        let traceLineLayerID = layerIdentifier(`${name}-${typeName}`, 'line');
        this.traceLineLayerID = traceLineLayerID;
        this.traceLineLayer = extend({id: traceLineLayerID, source: traceLineSourceID}, clone(defaultLineLayer));

        let tracePointSourceID = sourceIdentifier(`${name}-${typeName}-point`);
        this.tracePointSourceID = tracePointSourceID;
        this.tracePointSource = GeojsonUtils.emptySource;

        let tracePointCircleLayerID = layerIdentifier(`${name}-${typeName}-point`, 'circle');
        this.tracePointCircleLayerID = tracePointCircleLayerID;
        this.tracePointCircleLayer = extend({
            id: tracePointCircleLayerID,
            source: tracePointSourceID
        }, clone(defaultCircleLayer));

        let tracePointSymbolLayerID = layerIdentifier(`${name}-${typeName}-point`, 'symbol');
        this.tracePointSymbolLayerID = tracePointSymbolLayerID;
        this.tracePointSymbolLayer = extend({
            id: tracePointSymbolLayerID,
            source: tracePointSourceID
        }, clone(defaultTextSymbolLayer));
    }

    cloneWithName(name: string): custom_trace_layer {
        let layer = new custom_trace_layer(name);
        layer.tracePointCircleLayer.paint = clone(this.tracePointCircleLayer.paint) || {};
        layer.tracePointCircleLayer.layout = clone(this.tracePointCircleLayer.layout) || {};
        layer.tracePointSymbolLayer.paint = clone(this.tracePointSymbolLayer.paint) || {};
        layer.tracePointSymbolLayer.layout = clone(this.tracePointSymbolLayer.layout) || {};
        layer.traceLineLayer.paint = clone(this.traceLineLayer.paint) || {};
        layer.traceLineLayer.layout = clone(this.traceLineLayer.layout) || {};
        return layer;
    }

    addToMap(map: IPMap) {
        this.map = map;

        this.map.addSource(this.traceLineSourceID, this.traceLineSource);
        this.map.addLayer(this.traceLineLayer);

        this.map.addSource(this.tracePointSourceID, this.tracePointSource);
        this.map.addLayer(this.tracePointSymbolLayer);
        this.map.addLayer(this.tracePointCircleLayer);
    }

    removeFromMap() {
        this.map.removeLayer(this.tracePointCircleLayer);
        this.map.removeLayer(this.tracePointSymbolLayer);
        this.map.removeSource(this.tracePointSourceID);

        this.map.removeLayer(this.traceLineLayer);
        this.map.removeSource(this.traceLineSourceID);

        this.map = null;
    }

    setLinePaintProperty(prop: string, value: any) {
        this.traceLineLayer.paint[prop] = value;
    }

    setLineLayoutProperty(prop: string, value: any) {
        this.traceLineLayer.layout[prop] = value;
    }

    setTextPaintProperty(prop: string, value: any) {
        this.tracePointSymbolLayer.paint[prop] = value;
    }

    setTextLayoutProperty(prop: string, value: any) {
        this.tracePointSymbolLayer.layout[prop] = value;
    }

    setCirclePaintProperty(prop: string, value: any) {
        this.tracePointCircleLayer.paint[prop] = value;
    }

    setCircleLayoutProperty(prop: string, value: any) {
        this.tracePointCircleLayer.layout[prop] = value;
    }

    setFilter(filter: any) {
        this.traceLineLayer.filter = filter;
        this.tracePointCircleLayer.filter = filter;
        this.tracePointSymbolLayer.filter = filter;
    }

    updateFilter(filter: any) {
        this.map.setFilter(this.traceLineLayerID, filter);
        this.map.setFilter(this.tracePointCircleLayerID, filter);
        this.map.setFilter(this.tracePointSymbolLayerID, filter);
    }

    show() {
        this.updateCircleVisible(true);
        this.updateTextVisible(true);
        this.updateLineVisible(true);
    }

    hide() {
        this.updateCircleVisible(false);
        this.updateTextVisible(false);
        this.updateLineVisible(false);
    }

    updateCircleVisible(isVisible: boolean) {
        this.map.setLayoutProperty(this.tracePointCircleLayerID, 'visibility', !!isVisible ? 'visible' : 'none');
    }

    updateTextVisible(isVisible: boolean) {
        this.map.setLayoutProperty(this.tracePointSymbolLayerID, 'visibility', !!isVisible ? 'visible' : 'none');
    }

    updateLineVisible(isVisible: boolean) {
        this.map.setLayoutProperty(this.traceLineLayerID, 'visibility', !!isVisible ? 'visible' : 'none');
    }

    updateTextProperty(type: string, prop: string, value: any) {
        if (type === 'paint') {
            this.map.setPaintProperty(this.tracePointSymbolLayerID, prop, value);
        } else if (type === 'layout') {
            this.map.setLayoutProperty(this.tracePointSymbolLayerID, prop, value);
        }
    }

    setFloor(floorNumber: number) {
        let filter = ['all', ['==', 'floor', floorNumber]];
        this.updateFilter(filter);
    }

    showTraceData(tracePoints: Object) {
        // console.log("showTraceData");
        // console.log(tracePoints);

        let pointGeojson = GeojsonUtils.createPointFeatureCollection(tracePoints);
        this.map.getSource(this.tracePointSourceID).setData(pointGeojson);

        let lineGeojson = GeojsonUtils.createLineFeatureCollection([tracePoints]);
        this.map.getSource(this.traceLineSourceID).setData(lineGeojson);
    }
}

export {custom_trace_layer};
