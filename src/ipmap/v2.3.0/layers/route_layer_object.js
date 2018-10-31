let emptySource = {
    'type': 'geojson', 'data': {"type": "FeatureCollection", "features": []}
};

class layer_object {
    constructor(sourceID, layerID, layerID2) {
        this.sourceID = sourceID;
        this.source = emptySource;

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
        map.getSource(this.sourceID).setData(emptySource.data);
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

class route_layer_object {
    constructor(name) {
        this.name = name;
        // console.log("route_layer_object.constructor");
        // console.log(this.name);
        {
            let wholeRouteSourceID = `whole-${this.name}-source`;
            let wholeRouteLayer1ID = `whole-${this.name}-layer1`;
            let wholeRouteLayer2ID = `whole-${this.name}-layer2`;
            this.wholeRouteObject = new layer_object(wholeRouteSourceID, wholeRouteLayer1ID, wholeRouteLayer2ID);
            this.wholeRouteObject.layer = {
                "id": wholeRouteLayer1ID,
                "type": "line",
                "source": wholeRouteSourceID,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#ffffff",
                    "line-width": 8
                }
            };
            this.wholeRouteObject.layer2 = {
                "id": wholeRouteLayer2ID,
                "type": "line",
                "source": wholeRouteSourceID,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#00ff00",
                    "line-width": 6
                }
            };

            let wholeRouteArrowSourceID = `whole-${this.name}-arrow-source`;
            let wholeRouteArrowLayerID = `whole-${this.name}-arrow-layer`;
            this.wholeArrowObject = new layer_object(wholeRouteArrowSourceID, wholeRouteArrowLayerID);
            this.wholeArrowObject.layer = {
                'id': wholeRouteArrowLayerID,
                'type': 'symbol',
                'source': wholeRouteArrowSourceID,
                'layout': {
                    "icon-image": "icon_route_arrow",
                    "icon-size": 1,
                    "icon-allow-overlap": true,
                    "icon-rotate": {
                        'type': 'identity',
                        'property': 'angle'
                    },
                    "icon-rotation-alignment": "map",
                },
            };
        }


        {
            let segmentRouteSourceID = `segment-${this.name}-source`;
            let segmentRouteLayer1ID = `segment-${this.name}-layer1`;
            let segmentRouteLayer2ID = `segment-${this.name}-layer2`;
            this.segmentRouteObject = new layer_object(segmentRouteSourceID, segmentRouteLayer1ID, segmentRouteLayer2ID);
            this.segmentRouteObject.layer = {
                "id": segmentRouteLayer1ID,
                "type": "line",
                "source": segmentRouteSourceID,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#ffffff",
                    "line-width": 8
                }
            };
            this.segmentRouteObject.layer2 = {
                "id": segmentRouteLayer2ID,
                "type": "line",
                "source": segmentRouteSourceID,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#ff5959",
                    "line-width": 6
                },
            };

            let passedSegmentRouteSourceID = `passed-segment-${this.name}-source`;
            let passedSegmentRouteLayerID = `passed-segment-${this.name}-layer`;
            this.passedSegmentRouteObject = new layer_object(passedSegmentRouteSourceID, passedSegmentRouteLayerID);
            this.passedSegmentRouteObject.layer = {
                "id": passedSegmentRouteLayerID,
                "type": "line",
                "source": passedSegmentRouteSourceID,
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#888888",
                    "line-width": 6
                },
            };

            let segmentArrowSourceID = `segment-${this.name}-arrow-source`;
            let segmentArrowLayerID = `segment-${this.name}-arrow-layer`;
            this.segmentArrowObject = new layer_object(segmentArrowSourceID, segmentArrowLayerID);
            this.segmentArrowObject.layer = {
                'id': segmentArrowLayerID,
                'type': 'symbol',
                'source': segmentArrowSourceID,
                'layout': {
                    "icon-image": "icon_route_arrow",
                    "icon-size": 1,
                    "icon-allow-overlap": true,
                    "icon-rotate": {
                        'type': 'identity',
                        'property': 'angle'
                    },
                    "icon-rotation-alignment": "map",
                },
            };
        }

        {
            let routeStopSourceID = `${this.name}-stop-source`;
            let routeStopLayer1ID = `${this.name}-stop-layer1`;
            let routeStopLayer2ID = `${this.name}-stop-layer2`;
            this.routeStopObject = new layer_object(routeStopSourceID, routeStopLayer1ID, routeStopLayer2ID);
            this.routeStopObject.layer = {
                "id": routeStopLayer1ID,
                "type": "circle",
                "source": routeStopSourceID,
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
            this.routeStopObject.layer2 = {
                "id": routeStopLayer2ID,
                "type": "symbol",
                "source": routeStopSourceID,
                "paint": {
                    "text-color": "#fff",
                },
                'layout': {
                    "text-field": "{NAME}",
                    "text-size": 15,
                    "text-font": ["simhei"],
                    "text-anchor": "center",
                    "text-padding": 0,
                    "text-offset": [0, 0.2]
                }
            };


            // this.routeStopObject1 = new layer_object(routeStopSourceID, routeStopLayer1ID);
            // this.routeStopObject1.layer = {
            //     "id": routeStopLayer1ID,
            //     "type": "circle",
            //     "source": routeStopSourceID,
            //     "paint": {
            //         "circle-radius": 10,
            //         "circle-color": {
            //             'type': 'identity',
            //             'property': 'color'
            //         },
            //         "circle-opacity": 1.0,
            //         "circle-stroke-color": "#fff",
            //         "circle-stroke-width": 2
            //     }
            // };
            //
            // this.routeStopObject2 = new layer_object(routeStopSourceID, routeStopLayer2ID);
            // this.routeStopObject2.layer = {
            //     "id": routeStopLayer2ID,
            //     "type": "symbol",
            //     "source": routeStopSourceID,
            //     "paint": {
            //         "text-color": "#fff",
            //     },
            //     'layout': {
            //         "text-field": "{NAME}",
            //         "text-size": 15,
            //         "text-font": ["simhei"],
            //         "text-anchor": "center",
            //         "text-padding": 0,
            //         "text-offset": [0, 0.2]
            //     }
            // };
        }

    }
}

// module.exports = route_layer_object;
export default route_layer_object