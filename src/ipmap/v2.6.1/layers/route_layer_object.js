import {extend, clone, geojson_utils} from '../../dependencies.js';

class layer_object {
    constructor(sourceID, layerID, layerID2) {
        this.sourceID = sourceID;
        this.source = geojson_utils.emptySource;

        this.layerID = layerID;
        this.layerID2 = layerID2;

        this.layer = null;
        this.layer2 = null;
    }

    addToMap(map) {
        map.addSource(this.sourceID, this.source);
        map.addLayer(this.layer);
        if (this.layer2 != null) map.addLayer(this.layer2);
    }

    removeFromMap(map) {
        map.removeSource(this.sourceID);
        map.removeLayer(this.layerID);
        if (this.layerID2 != null) {
            map.removeLayer(this.layerID2);
        }
    }

    setFilter(map, filter) {
        map.setFilter(this.layerID, filter);
        if (this.layerID2 != null) {
            map.setFilter(this.layerID2, filter);
        }
    }

    clearSource(map) {
        map.getSource(this.sourceID).setData(geojson_utils.emptySource.data);
    }

    hide(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'none');
        if (this.layerID2 != null) {
            map.setLayoutProperty(this.layerID2, 'visibility', 'none');
        }
    }

    show(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'visible');
        if (this.layerID2 != null) {
            map.setLayoutProperty(this.layerID2, 'visibility', 'visible');
        }
    }
}

let defaultLineLayer = {
    'type': 'line',
    'layout': {
        'line-join': 'round',
        'line-cap': 'round'
    },
    'paint': {}
};

let defaultSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-color': '#fff'
    },
    'layout': {
        'text-anchor': 'center',
        'text-padding': 0,
        'icon-allow-overlap': true,
        'icon-rotation-alignment': 'map'
    }
};

let defaultCircleLayer = {
    'type': 'circle',
    'paint': {
        'circle-radius': 10,
        'circle-color': ['get', 'color'],
        'circle-opacity': 1.0,
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 2
    }
};

class route_layer_object {
    constructor(name) {
        this.name = name;
        // console.log('route_layer_object.constructor');
        // console.log(this.name);
        {
            let wholeRouteSourceID = `whole-${this.name}-source`;
            let wholeRouteLayer1ID = `whole-${this.name}-layer1`;
            let wholeRouteLayer2ID = `whole-${this.name}-layer2`;
            this.wholeRouteObject = new layer_object(wholeRouteSourceID, wholeRouteLayer1ID, wholeRouteLayer2ID);
            this.wholeRouteObject.layer = extend({
                'id': wholeRouteLayer1ID,
                'source': wholeRouteSourceID
            }, clone(defaultLineLayer));
            this.wholeRouteObject.layer.paint['line-color'] = '#ffffff';
            this.wholeRouteObject.layer.paint['line-width'] = 8;

            this.wholeRouteObject.layer2 = extend({
                'id': wholeRouteLayer2ID,
                'source': wholeRouteSourceID
            }, clone(defaultLineLayer));
            this.wholeRouteObject.layer2.paint['line-color'] = '#00ff00';
            this.wholeRouteObject.layer2.paint['line-width'] = 6;

            let wholeRouteArrowSourceID = `whole-${this.name}-arrow-source`;
            let wholeRouteArrowLayerID = `whole-${this.name}-arrow-layer`;
            this.wholeArrowObject = new layer_object(wholeRouteArrowSourceID, wholeRouteArrowLayerID);
            this.wholeArrowObject.layer = extend({
                'id': wholeRouteArrowLayerID,
                'source': wholeRouteArrowSourceID
            }, clone(defaultSymbolLayer));
            this.wholeArrowObject.layer.layout['icon-image'] = 'icon_route_arrow';
            this.wholeArrowObject.layer.layout['icon-size'] = 1;
            this.wholeArrowObject.layer.layout['icon-rotate'] = ['get', 'angle'];
        }

        {
            let segmentRouteSourceID = `segment-${this.name}-source`;
            let segmentRouteLayer1ID = `segment-${this.name}-layer1`;
            let segmentRouteLayer2ID = `segment-${this.name}-layer2`;
            this.segmentRouteObject = new layer_object(segmentRouteSourceID, segmentRouteLayer1ID, segmentRouteLayer2ID);
            this.segmentRouteObject.layer = extend({
                'id': segmentRouteLayer1ID,
                'source': segmentRouteSourceID
            }, clone(defaultLineLayer));
            this.segmentRouteObject.layer.paint['line-color'] = '#ffffff';
            this.segmentRouteObject.layer.paint['line-width'] = 8;

            this.segmentRouteObject.layer2 = extend({
                'id': segmentRouteLayer2ID,
                'source': segmentRouteSourceID
            }, clone(defaultLineLayer));
            this.segmentRouteObject.layer2.paint['line-color'] = '#ff5959';
            this.segmentRouteObject.layer2.paint['line-width'] = 6;

            let passedSegmentRouteSourceID = `passed-segment-${this.name}-source`;
            let passedSegmentRouteLayerID = `passed-segment-${this.name}-layer`;
            this.passedSegmentRouteObject = new layer_object(passedSegmentRouteSourceID, passedSegmentRouteLayerID);
            this.passedSegmentRouteObject.layer = extend({
                'id': passedSegmentRouteLayerID,
                'source': passedSegmentRouteSourceID
            }, clone(defaultLineLayer));
            this.passedSegmentRouteObject.layer.paint['line-color'] = '#888888';
            this.passedSegmentRouteObject.layer.paint['line-width'] = 8;

            let segmentArrowSourceID = `segment-${this.name}-arrow-source`;
            let segmentArrowLayerID = `segment-${this.name}-arrow-layer`;
            this.segmentArrowObject = new layer_object(segmentArrowSourceID, segmentArrowLayerID);
            this.segmentArrowObject.layer = extend({
                'id': segmentArrowLayerID,
                'source': segmentArrowSourceID
            }, clone(defaultSymbolLayer));
            this.segmentArrowObject.layer.layout['icon-image'] = 'icon_route_arrow';
            this.segmentArrowObject.layer.layout['icon-rotate'] = ['get', 'angle'];
            this.segmentArrowObject.layer.layout['icon-size'] = 1;
        }

        {
            let routeStopSourceID = `${this.name}-stop-source`;
            let routeStopLayer1ID = `${this.name}-stop-layer1`;
            let routeStopLayer2ID = `${this.name}-stop-layer2`;
            this.routeStopObject = new layer_object(routeStopSourceID, routeStopLayer1ID, routeStopLayer2ID);
            this.routeStopObject.layer = extend({
                'id': routeStopLayer1ID,
                'source': routeStopSourceID
            }, clone(defaultCircleLayer));

            this.routeStopObject.layer2 = extend({
                'id': routeStopLayer2ID,
                'source': routeStopSourceID
            }, clone(defaultSymbolLayer));
            this.routeStopObject.layer2.layout['text-field'] = ['get', 'NAME'];
            this.routeStopObject.layer2.layout['text-font'] = ['simhei'];
            this.routeStopObject.layer2.layout['text-size'] = 15;
        }
    }
}

export default route_layer_object;
