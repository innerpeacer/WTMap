import ipTurf from '../utils/ip_turf'
import {coord_projection as CoordProjection} from '../utils/coord_projection'
import RouteLayerObject from './route_layer_object'
import AnimationObject from '../utils/route_animation_object'

let routeAnimationObject = new AnimationObject();

function sliceLength2(zoom) {
    if (zoom >= 19) return 6;
    if (zoom < 19) return 12;
}

function dist2(c1, c2) {
    return Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y));
}

function showAnimatedArrows(time) {
    if (routeAnimationObject.lastTime == -1) {
        routeAnimationObject.lastTime = time;
    }

    let deltaTime = time - routeAnimationObject.lastTime;
    if (deltaTime < 150) {

    } else {
        routeAnimationObject.lastTime = time;
        if (routeAnimationObject.globalSegmentRouteResult != null) {
            let maxOffset = sliceLength2(routeAnimationObject.globalMap.getZoom());
            routeAnimationObject.globalSegmentOffset += maxOffset * 0.08;
            while (routeAnimationObject.globalSegmentOffset > maxOffset) {
                routeAnimationObject.globalSegmentOffset -= maxOffset;
            }
            routeAnimationObject.globalMap.getSource(routeAnimationObject.globalSegmentRouteArrowSourceID).setData(routeAnimationObject.globalSegmentRouteResult.getArrowPoints(routeAnimationObject.globalMap.getZoom(), routeAnimationObject.globalSegmentOffset));
        }

        if (routeAnimationObject.globalWholeRouteResult != null) {
            let maxOffset = sliceLength2(routeAnimationObject.globalMap.getZoom());
            routeAnimationObject.globalWholeOffset += maxOffset * 0.08;
            while (routeAnimationObject.globalWholeOffset > maxOffset) {
                routeAnimationObject.globalWholeOffset -= maxOffset;
            }
            routeAnimationObject.globalMap.getSource(routeAnimationObject.globalWholeRouteArrowSourceID).setData(routeAnimationObject.globalWholeRouteResult.getArrowPoints(routeAnimationObject.globalMap.getZoom(), routeAnimationObject.globalWholeOffset));
        }
    }
    routeAnimationObject.globalAnimationID = requestAnimationFrame(showAnimatedArrows);
}

class indoor_layergroup_multi_stop_route {
    constructor(map) {
        // console.log('indoor_layergroup_multi_stop_route.constructor');
        this.map = map;
        let name = 'route';

        let obj = new RouteLayerObject(name);
        this.wholeRouteObject = obj.wholeRouteObject;
        this.wholeArrowObject = obj.wholeArrowObject;
        this.segmentRouteObject = obj.segmentRouteObject;
        this.passedSegmentRouteObject = obj.passedSegmentRouteObject;
        this.segmentArrowObject = obj.segmentArrowObject;
        this.routeStopObject = obj.routeStopObject;

        this._layerObjects = [this.wholeRouteObject, this.wholeArrowObject, this.segmentRouteObject, this.passedSegmentRouteObject, this.segmentArrowObject, this.routeStopObject];
        this._floorIndex = null;
        this._isRouteHidden = true;
    }

    hideRoute() {
        // console.log('hideRoute');
        this._isRouteHidden = true;

        cancelAnimationFrame(routeAnimationObject.globalAnimationID);
        routeAnimationObject.reset();

        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.clearSource(map);
        });
    }

    showRoute(multiResult, location, segment) {
        // this.clearSource();
        var that = this;
        if (!location) this.clearSource();
        // console.log('showRoute');
        // console.log('segment: ' + segment);

        this._isRouteHidden = false;

        let wholeResult = multiResult.completeResult;
        if (wholeResult != null) {
            this.map.getSource(this.wholeRouteObject.sourceID).setData(wholeResult.data);
            this.map.getSource(this.routeStopObject.sourceID).setData(multiResult.rearrengedStopData);

            routeAnimationObject.globalWholeRouteResult = wholeResult;
            routeAnimationObject.globalWholeRouteArrowSourceID = this.wholeArrowObject.sourceID;
        }

        let segmentResult = multiResult.completeResult;
        if (segment != null) {
            segmentResult = multiResult.detailedResult[segment];
        }
        this.map.getSource(this.segmentRouteObject.sourceID).setData(segmentResult.data);
        routeAnimationObject.globalSegmentRouteResult = segmentResult;
        routeAnimationObject.globalSegmentRouteArrowSourceID = this.segmentArrowObject.sourceID;

        // cancelAnimationFrame(routeAnimationObject.globalAnimationID);
        // routeAnimationObject.globalMap = this.map;
        // routeAnimationObject.globalAnimationID = requestAnimationFrame(showAnimatedArrows);

        if (!routeAnimationObject.running) {
            cancelAnimationFrame(routeAnimationObject.globalAnimationID);
            routeAnimationObject.globalMap = this.map;
            routeAnimationObject.globalAnimationID = requestAnimationFrame(showAnimatedArrows);
            routeAnimationObject.running = true;
        }

        if (location != null) {
            let points = [];
            points.push(ipTurf.point([location.x, location.y]));

            let npResult = segmentResult.getNearestPoint(location);
            if (npResult != null) {
                let targetPart = npResult.routePart;
                let passedLineArray = [];
                let passedRouteParts = [];
                let routeParts = segmentResult.getRoutePartsOnFloor(this.map.currentMapInfo.floorNumber);
                routeParts.forEach(function (rp) {
                    if (rp.partIndex < targetPart.partIndex) {
                        passedRouteParts.push(rp);
                        passedLineArray.push(rp.getGeometry());
                    }
                });


                let sliced = ipTurf.lineSlice(ipTurf.point(targetPart.getFirstPoint()), npResult.point, targetPart.getGeometry());
                let allCoords = sliced.geometry.coordinates;

                // Fix a bug here. Duplicate coordinates cause the segment disappear.
                let lastCoord = allCoords[allCoords.length - 1];
                let lastXY = CoordProjection.lngLatToMercator(lastCoord[0], lastCoord[1]);
                let secondLastCoord = allCoords[allCoords.length - 2];
                let secondLastXY = CoordProjection.lngLatToMercator(secondLastCoord[0], secondLastCoord[1]);

                if (dist2(lastXY, secondLastXY) < 0.01) {
                    allCoords = allCoords.slice(0, allCoords.length - 1);
                }

                sliced = ipTurf.lineString(allCoords);
                sliced.properties = targetPart.getGeometry().properties;
                passedLineArray.push(sliced);

                this.map.getSource(this.passedSegmentRouteObject.sourceID).setData(ipTurf.featureCollection(passedLineArray));
            }
        }
    }

    _setRouteColor(color1, color2, color3) {
        if (color1 != null) {
            this.map.setPaintProperty(this.segmentRouteObject.layerID2, 'line-color', color1);
        }
        if (color2 != null) {
            this.map.setPaintProperty(this.passedSegmentRouteObject.layerID, 'line-color', color2);
        }
        if (color3 != null) {
            this.map.setPaintProperty(this.wholeRouteObject.layerID2, 'line-color', color3);
        }
    }

    _setMapInfo(mapInfo) {
        this._floorIndex = mapInfo.floorNumber;
        let map = this.map;
        let filter = ['==', 'floor', this._floorIndex];
        this._layerObjects.forEach(function (obj) {
            obj.setFilter(map, filter);
        });
    }

    // _updateMapInfo(mapInfo) {
    //     this._floorIndex = mapInfo.floorNumber;
    //     let map = this.map;
    //     let filter = ['==', 'floor', this._floorIndex];
    //     this._layerObjects.forEach(function (obj) {
    //         obj.setFilter(map, filter);
    //     });
    // }

    addToMap() {
        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.addToMap(map);
        });
        return this;
    }

    removeFromMap() {
        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.removeFromMap(map);
        });
    }

    clearSource() {
        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.clearSource(map);
        });

        cancelAnimationFrame(routeAnimationObject.globalAnimationID);
        routeAnimationObject.reset();
    }

    hide() {
        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.hide(map);
        });
    }

    show() {
        let map = this.map;
        this._layerObjects.forEach(function (obj) {
            obj.show(map);
        });
    }
}

export default indoor_layergroup_multi_stop_route
