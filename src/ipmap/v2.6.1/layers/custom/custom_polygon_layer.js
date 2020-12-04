import {layerIdentifier, sourceIdentifier} from './layer_identifier';
import {extend, clone, geojson_utils as GeojsonUtils} from '../../../dependencies.js';

let defaultFillLayer = {
    'type': 'fill',
    'layout': {},
    'paint': {
        'fill-color': 'red',
        'fill-opacity': 0.5
    }
};

let defaultFillOutlineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {
        'line-color': 'white',
        'line-width': 1
    }
};

class custom_polygon_layer {
    constructor(name) {
        this.name = name;
        let typeName = 'polygon';
        let polygonSourceID = sourceIdentifier(`${name}-${typeName}-fill`);
        this.polygonSourceID = polygonSourceID;
        this.polygonSource = GeojsonUtils.emptySource;

        let polygonFillLayerID = this.polygonFillLayerID = layerIdentifier(`${name}-${typeName}`, 'fill');
        this.polygonFillLayer = extend({id: polygonFillLayerID, source: polygonSourceID}, clone(defaultFillLayer));

        let polygonOutlineLayerID = this.polygonOutlineLayerID = layerIdentifier(`${name}-${typeName}`, 'line');
        this.polygonOutlineLayer = extend({
            id: polygonOutlineLayerID,
            source: polygonSourceID
        }, clone(defaultFillOutlineLayer));
    }

    addToMap(map) {
        this.map = map;
        this.map.addSource(this.polygonSourceID, this.polygonSource);
        this.map.addLayer(this.polygonFillLayer);
        this.map.addLayer(this.polygonOutlineLayer);
    }

    removeFromMap() {
        this.map.removeLayer(this.polygonFillLayerID);
        this.map.removeLayer(this.polygonOutlineLayerID);
        this.map.removeSource(this.polygonSourceID);
        this.map = null;
    }

    setPolygonPaintProperty(prop, value) {
        this.polygonFillLayer.paint[prop] = value;
    }

    setPolygonLayoutProperty(prop, value) {
        this.polygonFillLayer.layout[prop] = value;
    }

    setPolygonColor(color) {
        this.polygonFillLayer.paint['fill-color'] = color;
    }

    setPolygonOpacity(opacity) {
        this.polygonFillLayer.paint['fill-opacity'] = opacity;
    }

    setPolygonOutlineColor(color) {
        this.polygonOutlineLayer.paint['line-color'] = color;
    }

    setPolygonOutlineWidth(width) {
        this.polygonOutlineLayer.paint['line-width'] = width;
    }

    showPolygonData(polygons) {
        let polygonGeojson = GeojsonUtils.createPolygonFeatureCollections(polygons);
        this.map.getSource(this.polygonSourceID).setData(polygonGeojson);
    }

    showGeojsonData(geojson) {
        this.map.getSource(this.polygonSourceID).setData(geojson);
    }
}

export {custom_polygon_layer};
