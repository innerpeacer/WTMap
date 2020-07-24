import {layerIdentifier, sourceIdentifier} from "./layer_identifier";
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

class custom_trace_layer {
    constructor(name) {
        this.name = name;
        let typeName = "trace";
        let traceLineSourceID = sourceIdentifier(`${name}-${typeName}-line`);
        this.traceLineSourceID = traceLineSourceID;
        this.traceLineSource = GeojsonUtils.emptySource;

        let traceLineLayerID = layerIdentifier(`${name}-${typeName}`, "line");
        this.traceLineLayerID = traceLineLayerID;
        this.traceLineLayer = extend({id: traceLineLayerID, source: traceLineSourceID}, clone(defaultLineLayer));

        let tracePointSourceID = sourceIdentifier(`${name}-${typeName}-point`);
        this.tracePointSourceID = tracePointSourceID;
        this.tracePointSource = GeojsonUtils.emptySource;

        let tracePointCircleLayerID = layerIdentifier(`${name}-${typeName}-point`, "circle");
        this.tracePointCircleLayerID = tracePointCircleLayerID;
        this.tracePointCircleLayer = extend({
            id: tracePointCircleLayerID,
            source: tracePointSourceID
        }, clone(defaultCircleLayer));

        let tracePointSymbolLayerID = layerIdentifier(`${name}-${typeName}-point`, "symbol");
        this.tracePointSymbolLayerID = tracePointSymbolLayerID;
        this.tracePointSymbolLayer = extend({
            id: tracePointSymbolLayerID,
            source: tracePointSourceID
        }, clone(defaultTextSymbolLayer));
    }

    addToMap(map) {
        this.map = map;

        this.map.addSource(this.traceLineSourceID, this.traceLineSource);
        this.map.addLayer(this.traceLineLayer);

        this.map.addSource(this.tracePointSourceID, this.tracePointSource);
        this.map.addLayer(this.tracePointCircleLayer);
        this.map.addLayer(this.tracePointSymbolLayer);
    }

    removeFromMap() {
        this.map.removeLayer(this.tracePointCircleLayer);
        this.map.removeLayer(this.tracePointSymbolLayer);
        this.map.removeSource(this.tracePointSourceID);

        this.map.removeLayer(this.traceLineLayer);
        this.map.removeSource(this.traceLineSourceID);

        this.map = null;
    }

    setLinePaintProperty(prop, value) {
        this.traceLineLayer.paint[prop] = value;
    }

    setLineLayoutProperty(prop, value) {
        this.traceLineLayer.layout[prop] = value;
    }

    setTextPaintProperty(prop, value) {
        this.tracePointSymbolLayer.paint[prop] = value;
    }

    setTextLayoutProperty(prop, value) {
        this.tracePointSymbolLayer.layout[prop] = value;
    }

    setCirclePaintProperty(prop, value) {
        this.tracePointCircleLayer.paint[prop] = value;
    }

    setCircleLayoutProperty(prop, value) {
        this.tracePointCircleLayer.layout[prop] = value;
    }

    showTraceData(tracePoints) {
        console.log("showTraceData");
        console.log(tracePoints);

        let pointGeojson = GeojsonUtils.createPointFeatureCollection(tracePoints);
        this.map.getSource(this.tracePointSourceID).setData(pointGeojson);

        let lineGeojson = GeojsonUtils.createLineFeatureCollection([tracePoints]);
        this.map.getSource(this.traceLineSourceID).setData(lineGeojson);
    }
}

export {custom_trace_layer}
