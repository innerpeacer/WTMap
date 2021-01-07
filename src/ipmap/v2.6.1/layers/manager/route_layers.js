// @flow
import {
    geojson_utils as GeojsonUtils,
    local_point as LocalPoint,
    IPTurf as ipTurf,
    MultiStopRouteResult as MultiRouteResult,
    coord_projection as CoordProjection
} from '../../../dependencies';
import {unit_route_line_layer} from '../functional/route/unit_route_line_layer';
import {unit_route_symbol_layer} from '../functional/route/unit_route_symbol_layer';
import {route_animation_object as AnimationObject} from '../../utils/route_animation_object';
import {unit_route_circle_layer} from '../functional/route/unit_route_circle_layer';
import {unit_functional_layer} from '../functional/unit_functional_layer';
import type {IPMap} from '../../map/map';

let routeAnimationObject = new AnimationObject();

function sliceLength2(zoom) {
    if (zoom >= 19) return 6;
    if (zoom < 19) return 12;
    return 12;
}

function dist2(c1, c2) {
    return Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y));
}

function showAnimatedArrows(time) {
    // console.log('showAnimatedArrows');
    if (routeAnimationObject.lastTime === -1) {
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
            routeAnimationObject.globalMap.getSource(routeAnimationObject.globalSegmentRouteArrowSourceID).setData(routeAnimationObject.globalSegmentRouteResult.getGeojsonArrowPoints(routeAnimationObject.globalMap.getZoom(), routeAnimationObject.globalSegmentOffset));
        }

        if (routeAnimationObject.globalWholeRouteResult != null) {
            let maxOffset = sliceLength2(routeAnimationObject.globalMap.getZoom());
            routeAnimationObject.globalWholeOffset += maxOffset * 0.08;
            while (routeAnimationObject.globalWholeOffset > maxOffset) {
                routeAnimationObject.globalWholeOffset -= maxOffset;
            }
            routeAnimationObject.globalMap.getSource(routeAnimationObject.globalWholeRouteArrowSourceID).setData(routeAnimationObject.globalWholeRouteResult.getGeojsonArrowPoints(routeAnimationObject.globalMap.getZoom(), routeAnimationObject.globalWholeOffset));
        }
    }
    routeAnimationObject.globalAnimationID = requestAnimationFrame(showAnimatedArrows);
}

class route_layers {
    name: string;
    _isRouteHidden: boolean;

    wholeLineName: string;
    routeWholeLineSourceID: string;
    routeWholeBorderLineLayer: unit_functional_layer;
    routeWholeLineLayer: unit_route_line_layer;

    wholeRouteArrowSourceID: string;
    wholeRouteArrowLayer: unit_functional_layer;

    routeSegmentName: string;
    routeSegmentLineSourceID: string;
    routeSegmentBorderLineLayer: unit_functional_layer;
    routeSegmentLineLayer: unit_route_line_layer;

    segmentRouteArrowSourceID: string;
    segmentRouteArrowLayer: unit_functional_layer;

    routePassedSegmentName: string;
    routePassedSegmentLineSourceID: string;
    routePassedSegmentLineLayer: unit_route_line_layer;

    routeStopName: string;
    routeStopSourceID: string;
    routeStopCircleLayer: unit_functional_layer;
    routeStopSymbolLayer: unit_functional_layer;

    sourceIDs: Array<string>;
    unitLayers: Array<unit_functional_layer>;

    constructor() {
        this.name = 'wt-route';

        this._isRouteHidden = true;

        // ============ whole ============
        this.wholeLineName = `${this.name}-whole-line`;
        this.routeWholeLineSourceID = `${this.wholeLineName}-source`;

        this.routeWholeBorderLineLayer = new unit_route_line_layer({
            name: `${this.wholeLineName}-border`,
            sourceID: this.routeWholeLineSourceID
        }).asBorder();
        this.routeWholeLineLayer = new unit_route_line_layer({
            name: this.wholeLineName,
            sourceID: this.routeWholeLineSourceID
        }).asLine();

        this.wholeRouteArrowSourceID = `${this.wholeLineName}-arrow-source`;
        this.wholeRouteArrowLayer = new unit_route_symbol_layer({
            name: this.wholeLineName,
            sourceID: this.wholeRouteArrowSourceID
        }).asArrow();

        // ============ segment ============
        this.routeSegmentName = `${this.name}-segment-line`;
        this.routeSegmentLineSourceID = `${this.routeSegmentName}-source`;

        this.routeSegmentBorderLineLayer = new unit_route_line_layer({
            name: `${this.routeSegmentName}-border`,
            sourceID: this.routeSegmentLineSourceID
        }).asBorder();
        this.routeSegmentLineLayer = new unit_route_line_layer({
            name: `${this.routeSegmentName}`,
            sourceID: this.routeSegmentLineSourceID
        }).asSegement();

        this.segmentRouteArrowSourceID = `${this.routeSegmentName}-arrow-source`;
        this.segmentRouteArrowLayer = new unit_route_symbol_layer({
            name: this.routeSegmentName,
            sourceID: this.segmentRouteArrowSourceID
        }).asArrow();

        // ============ pass ============
        this.routePassedSegmentName = `${this.name}-passed-segment-line`;
        this.routePassedSegmentLineSourceID = `${this.routePassedSegmentName}-source`;

        this.routePassedSegmentLineLayer = new unit_route_line_layer({
            name: `${this.routePassedSegmentName}`,
            sourceID: this.routePassedSegmentLineSourceID
        }).asPassed();

        // ============ stops ============
        this.routeStopName = `${this.name}-stop`;
        this.routeStopSourceID = `${this.routeStopName}-source`;
        this.routeStopCircleLayer = new unit_route_circle_layer({
            name: this.routeStopName,
            sourceID: this.routeStopSourceID
        });

        this.routeStopSymbolLayer = new unit_route_symbol_layer({
            name: this.routeStopName,
            sourceID: this.routeStopSourceID
        }).asStop();

        this.sourceIDs = [this.routeWholeLineSourceID, this.wholeRouteArrowSourceID, this.routeSegmentLineSourceID, this.routePassedSegmentLineSourceID, this.segmentRouteArrowSourceID, this.routeStopSourceID];
        this.unitLayers = [this.routeWholeBorderLineLayer, this.routeWholeLineLayer, this.routeSegmentBorderLineLayer, this.routeSegmentLineLayer, this.routePassedSegmentLineLayer, this.wholeRouteArrowLayer, this.segmentRouteArrowLayer, this.routeStopCircleLayer, this.routeStopSymbolLayer];
    }

    getSourceIDs(): Array<string> {
        return this.sourceIDs;
    }

    showRoute(map: IPMap, multiResult: MultiRouteResult, location: LocalPoint, segment: ?number) {
        // console.log('route_layers.showRoute');
        if (!location) this.clearSource(map);
        this._isRouteHidden = false;

        let wholeResult = multiResult.completeResult;
        if (wholeResult != null) {
            map.getSource(this.routeWholeLineSourceID).setData(wholeResult.getGeojsonFeatures());
            map.getSource(this.routeStopSourceID).setData(multiResult.rearrangedStopData);

            routeAnimationObject.globalWholeRouteResult = wholeResult;
            routeAnimationObject.globalWholeRouteArrowSourceID = this.wholeRouteArrowSourceID;
        }

        let segmentResult = multiResult.completeResult;
        if (segment != null) {
            segmentResult = multiResult.detailedResult[segment];
        }
        map.getSource(this.routeSegmentLineSourceID).setData(segmentResult.getGeojsonFeatures());
        routeAnimationObject.globalSegmentRouteResult = segmentResult;
        routeAnimationObject.globalSegmentRouteArrowSourceID = this.segmentRouteArrowSourceID;

        if (!routeAnimationObject.running) {
            cancelAnimationFrame(routeAnimationObject.globalAnimationID);
            routeAnimationObject.globalMap = map;
            routeAnimationObject.globalAnimationID = requestAnimationFrame(showAnimatedArrows);
            routeAnimationObject.running = true;
        }

        if (location != null) {
            let points = [];
            points.push(ipTurf.point([location.x, location.y]));

            let npResult = segmentResult.getNearestGeojsonPoint(location);
            if (npResult != null) {
                let targetPart = npResult.routePart;
                let passedLineArray = [];
                let passedRouteParts = [];
                let routeParts = segmentResult.getRoutePartsOnFloor(map.currentMapInfo.floorNumber);
                routeParts.forEach(function(rp) {
                    if (rp.partIndex < targetPart.partIndex) {
                        passedRouteParts.push(rp);
                        passedLineArray.push(rp.getGeojsonGeometry());
                    }
                });


                let sliced = ipTurf.lineSlice(ipTurf.point(targetPart.getFirstPoint().getCoord()), npResult.point, targetPart.getGeojsonGeometry());
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
                sliced.properties = targetPart.getGeojsonGeometry().properties;
                passedLineArray.push(sliced);

                map.getSource(this.routePassedSegmentLineSourceID).setData(ipTurf.featureCollection(passedLineArray));
            }
        }
    }

    _setRouteColor(map: IPMap, color1: string, color2: string, color3: string) {
        if (color1 != null) {
            this.routeSegmentLineLayer.updateLineColor(map, color1);
        }
        if (color2 != null) {
            this.routePassedSegmentLineLayer.updateLineColor(map, color2);
        }
        if (color3 != null) {
            this.routeWholeLineLayer.updateLineColor(map, color3);
        }
    }

    hideRoute(map: IPMap) {
        // console.log('hideRoute');
        this._isRouteHidden = true;
        this.clearSource(map);
    }


    clearSource(map: IPMap) {
        this.sourceIDs.forEach((sourceID) => {
            map.getSource(sourceID).setData(GeojsonUtils.emptyGeojson);
        });

        cancelAnimationFrame(routeAnimationObject.globalAnimationID);
        routeAnimationObject.reset();
    }

    hide(map: IPMap) {
        this.unitLayers.forEach((unitLayer) => {
            unitLayer.hide(map);
        });
    }

    show(map: IPMap) {
        this.unitLayers.forEach((unitLayer) => {
            unitLayer.show(map);
        });
    }

    setMapInfo(map: IPMap, floor: number) {
        this.unitLayers.forEach((unitLayer) => {
            map.setFilter(unitLayer.layerID, unitLayer.createDefaultFilter(floor));
        });
    }
}

export {route_layers};
