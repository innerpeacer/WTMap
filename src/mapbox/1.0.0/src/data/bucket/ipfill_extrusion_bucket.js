import {IPFillExtrusionLayoutArray} from '../array_types';

import {members as layoutAttributes} from './ipfill_extrusion_attributes';
import SegmentVector from '../segment';
import {ProgramConfigurationSet} from '../program_configuration';
import {TriangleIndexArray} from '../index_array_type';
import EXTENT from '../extent';
import earcut from 'earcut';
import mvt from '@mapbox/vector-tile';

const vectorTileFeatureTypes = mvt.VectorTileFeature.types;
import classifyRings from '../../util/classify_rings';
import assert from 'assert';

const EARCUT_MAX_RINGS = 500;
import {register} from '../../util/web_worker_transfer';
import {hasPattern, addPatternDependencies} from './pattern_bucket_features';
import loadGeometry from '../load_geometry';
import EvaluationParameters from '../../style/evaluation_parameters';

import {flagOutline} from "../../debug_flag";

const EXTRUDE_SCALE = 63;
const COS_HALF_SHARP_CORNER = Math.cos(75 / 2 * (Math.PI / 180));
const SHARP_CORNER_OFFSET = 15;
const LINE_DISTANCE_BUFFER_BITS = 15;
const LINE_DISTANCE_SCALE = 1 / 2;
const MAX_LINE_DISTANCE = Math.pow(2, LINE_DISTANCE_BUFFER_BITS - 1) / LINE_DISTANCE_SCALE;
const FACTOR = Math.pow(2, 13);

function addVertex(vertexArray, x, y, nx, ny, nz, t, e) {
    vertexArray.emplaceBack(
        // a_pos
        x,
        y,
        // a_normal_ed: 3-component normal and 1-component edgedistance
        Math.floor(nx * FACTOR) * 2 + t,
        ny * FACTOR * 2,
        nz * FACTOR * 2,
        // edgedistance (used for wrapping patterns around extrusion sides)
        Math.round(e),
        0, 0, 0, 0,
        0, 0, 0, 0
    );
}

function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
    layoutVertexBuffer.emplaceBack(
        0, 0,
        0, 0, 0, 0,
        // a_pos_normal
        point.x,
        point.y,
        round ? 1 : 0,
        up ? 1 : -1,
        Math.round(EXTRUDE_SCALE * extrude.x) + 128,
        Math.round(EXTRUDE_SCALE * extrude.y) + 128,
        ((dir === 0 ? 0 : (dir < 0 ? -1 : 1)) + 1) | (((linesofar * LINE_DISTANCE_SCALE) & 0x3F) << 2),
        (linesofar * LINE_DISTANCE_SCALE) >> 6);
}

class IPFillExtrusionBucket {
    constructor(options) {
        this.zoom = options.zoom;
        this.overscaling = options.overscaling;
        this.layers = options.layers;
        this.layerIds = this.layers.map(layer => layer.id);
        this.index = options.index;
        this.hasPattern = false;

        this.layoutVertexArray = new IPFillExtrusionLayoutArray();
        this.indexArray = new TriangleIndexArray();
        this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
        this.segments = new SegmentVector();
        this.stateDependentLayerIds = this.layers.filter((l) => l.isStateDependent()).map((l) => l.id);

        this.features = [];
    }

    populate(features, options) {
        this.features = [];
        this.hasPattern = hasPattern('ipfill-extrusion', this.layers, options);

        for (const {feature, index, sourceLayerIndex} of features) {
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) continue;

            const geometry = loadGeometry(feature);

            const patternFeature = {
                sourceLayerIndex,
                index,
                geometry,
                properties: feature.properties,
                type: feature.type,
                patterns: {}
            };

            if (typeof feature.id !== 'undefined') {
                patternFeature.id = feature.id;
            }

            if (this.hasPattern) {
                this.features.push(addPatternDependencies('ipfill-extrusion', this.layers, patternFeature, this.zoom, options));
            } else {
                this.addFillExtrusionFeature(patternFeature, geometry, index, {});
                this.addExtrusionOutlineFeature(patternFeature, geometry, index, {});
            }

            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index, true);
        }
    }

    addFeatures(options, imagePositions) {
        for (const feature of this.features) {
            const {geometry} = feature;
            this.addFillExtrusionFeature(feature, geometry, feature.index, imagePositions);
            this.addExtrusionOutlineFeature(feature, geometry, feature.index, imagePositions);
        }
    }

    update(states, vtLayer, imagePositions) {
        if (!this.stateDependentLayers.length) return;
        this.programConfigurations.updatePaintArrays(states, vtLayer, this.stateDependentLayers, imagePositions);
    }

    isEmpty() {
        return this.layoutVertexArray.length === 0;
    }

    uploadPending() {
        return !this.uploaded || this.programConfigurations.needsUpload;
    }

    upload(context) {
        if (!this.uploaded) {
            this.layoutVertexBuffer = context.createVertexBuffer(this.layoutVertexArray, layoutAttributes);
            this.indexBuffer = context.createIndexBuffer(this.indexArray);
        }
        this.programConfigurations.upload(context);
        this.uploaded = true;
    }

    destroy() {
        if (!this.layoutVertexBuffer) return;
        this.layoutVertexBuffer.destroy();
        this.indexBuffer.destroy();
        this.programConfigurations.destroy();
        this.segments.destroy();
    }

    // addFeature(feature, geometry, index, imagePositions) {
    addFillExtrusionFeature(feature, geometry, index, imagePositions) {
        for (const polygon of classifyRings(geometry, EARCUT_MAX_RINGS)) {
            let numVertices = 0;
            for (const ring of polygon) {
                numVertices += ring.length;
            }
            let segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);

            for (const ring of polygon) {
                if (ring.length === 0) {
                    continue;
                }

                if (isEntirelyOutside(ring)) {
                    continue;
                }

                let edgeDistance = 0;

                for (let p = 0; p < ring.length; p++) {
                    const p1 = ring[p];

                    if (p >= 1) {
                        const p2 = ring[p - 1];

                        if (!isBoundaryEdge(p1, p2)) {
                            if (segment.vertexLength + 4 > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                                segment = this.segments.prepareSegment(4, this.layoutVertexArray, this.indexArray);
                            }

                            const perp = p1.sub(p2)._perp()._unit();
                            const dist = p2.dist(p1);
                            if (edgeDistance + dist > 32768) edgeDistance = 0;

                            addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 0, edgeDistance);
                            addVertex(this.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 1, edgeDistance);

                            edgeDistance += dist;

                            addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 0, edgeDistance);
                            addVertex(this.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 1, edgeDistance);

                            const bottomRight = segment.vertexLength;

                            // ┌──────┐
                            // │ 0  1 │ Counter-clockwise winding order.
                            // │      │ Triangle 1: 0 => 2 => 1
                            // │ 2  3 │ Triangle 2: 1 => 2 => 3
                            // └──────┘
                            this.indexArray.emplaceBack(bottomRight, bottomRight + 1, bottomRight + 2);
                            this.indexArray.emplaceBack(bottomRight + 1, bottomRight + 3, bottomRight + 2);

                            segment.vertexLength += 4;
                            segment.primitiveLength += 2;
                        }
                    }
                }
            }

            if (segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                segment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            }

            //Only triangulate and draw the area of the feature if it is a polygon
            //Other feature types (e.g. LineString) do not have area, so triangulation is pointless / undefined
            if (vectorTileFeatureTypes[feature.type] !== 'Polygon')
                continue;

            const flattened = [];
            const holeIndices = [];
            const triangleIndex = segment.vertexLength;

            for (const ring of polygon) {
                if (ring.length === 0) {
                    continue;
                }

                if (ring !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }

                for (let i = 0; i < ring.length; i++) {
                    const p = ring[i];

                    addVertex(this.layoutVertexArray, p.x, p.y, 0, 0, 1, 1, 0);

                    flattened.push(p.x);
                    flattened.push(p.y);
                }
            }

            const indices = earcut(flattened, holeIndices);
            assert(indices.length % 3 === 0);

            for (let j = 0; j < indices.length; j += 3) {
                // Counter-clockwise winding order.
                this.indexArray.emplaceBack(
                    triangleIndex + indices[j],
                    triangleIndex + indices[j + 2],
                    triangleIndex + indices[j + 1]);
            }

            segment.primitiveLength += indices.length / 3;
            segment.vertexLength += numVertices;
        }

        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
    }

    // addFeature(feature, geometry, index, imagePositions) {
    addExtrusionOutlineFeature(feature, geometry, index, imagePositions) {
        const layout = this.layers[0].layout;
        const join = layout.get('ipfill-extrusion-outline-join').evaluate(feature, {});
        const cap = layout.get('ipfill-extrusion-outline-cap');
        const miterLimit = layout.get('ipfill-extrusion-outline-miter-limit');
        const roundLimit = layout.get('ipfill-extrusion-outline-round-limit');

        let processedGeometry = this._removeEdge(geometry);
        for (const line of processedGeometry) {
        // for (const line of geometry) {
            this.addLine(line, feature, join, cap, miterLimit, roundLimit, index, imagePositions);
        }
    }

    _removeEdgeForSimpleLine(line) {
        if (line.length < 2) return [];

        let res = [];
        let seg = [];
        for (let i = 0; i < line.length; ++i) {
            if (i > 0) {
                if (isOnOrOutBoundaryEdge(line[i], line[i - 1])) {
                    if (seg.length > 1) res.push(seg);
                    seg = [];
                }
            }
            seg.push(line[i]);
        }

        if (seg.length > 1) res.push(seg);
        return res;
    }

    _removeEdge(geometry) {
        let result = [];
        for (const line of geometry) {
            if (line.length > 1) {
                result = result.concat(this._removeEdgeForSimpleLine(line));
            }
        }
        return result;
    }

    addCurrentVertex(currentVertex, distance, normal, endLeft, endRight, round, segment, distancesForScaling) {
        let extrude;
        const layoutVertexArray = this.layoutVertexArray;
        const indexArray = this.indexArray;

        if (distancesForScaling) {
            distance = scaleDistance(distance, distancesForScaling);
        }

        extrude = normal.clone();
        if (endLeft) extrude._sub(normal.perp()._mult(endLeft));
        addLineVertex(layoutVertexArray, currentVertex, extrude, round, false, endLeft, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;

        extrude = normal.mult(-1);
        if (endRight) extrude._sub(normal.perp()._mult(endRight));
        addLineVertex(layoutVertexArray, currentVertex, extrude, round, true, -endRight, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;

        if (distance > MAX_LINE_DISTANCE / 2 && !distancesForScaling) {
            this.distance = 0;
            this.addCurrentVertex(currentVertex, this.distance, normal, endLeft, endRight, round, segment);
        }
    }

    addPieSliceVertex(currentVertex, distance, extrude, lineTurnsLeft, segment, distancesForScaling) {
        extrude = extrude.mult(lineTurnsLeft ? -1 : 1);
        const layoutVertexArray = this.layoutVertexArray;
        const indexArray = this.indexArray;

        if (distancesForScaling) distance = scaleDistance(distance, distancesForScaling);

        addLineVertex(layoutVertexArray, currentVertex, extrude, false, lineTurnsLeft, 0, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            indexArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }

        if (lineTurnsLeft) {
            this.e2 = this.e3;
        } else {
            this.e1 = this.e3;
        }
    }

    addLine(vertices, feature, join, cap, miterLimit, roundLimit, index, imagePositions) {
        let lineDistances = null;
        if (!!feature.properties &&
            feature.properties.hasOwnProperty('mapbox_clip_start') &&
            feature.properties.hasOwnProperty('mapbox_clip_end')) {
            lineDistances = {
                start: feature.properties.mapbox_clip_start,
                end: feature.properties.mapbox_clip_end,
                tileTotal: undefined
            };
        }

        let isPolygon = vectorTileFeatureTypes[feature.type] === 'Polygon';
        // if (vertices.length==2) isPolygon = false;

        let len = vertices.length;
        while (len >= 2 && vertices[len - 1].equals(vertices[len - 2])) {
            len--;
        }
        let first = 0;
        while (first < len - 1 && vertices[first].equals(vertices[first + 1])) {
            first++;
        }

        // if (len < (isPolygon ? 3 : 2)) return;
        if (len < 2) return;
        if (lineDistances) {
            lineDistances.tileTotal = calculateFullDistance(vertices, first, len);
        }

        if (join === 'bevel') miterLimit = 1.05;

        const sharpCornerOffset = SHARP_CORNER_OFFSET * (EXTENT / (512 * this.overscaling));
        const firstVertex = vertices[first];
        const segment = this.segments.prepareSegment(len * 10, this.layoutVertexArray, this.indexArray);

        this.distance = 0;

        const beginCap = cap,
            endCap = isPolygon ? 'butt' : cap;
        let startOfLine = true;
        let currentVertex;
        let prevVertex = ((undefined));
        let nextVertex = ((undefined));
        let prevNormal = ((undefined));
        let nextNormal = ((undefined));
        let offsetA;
        let offsetB;

        this.e1 = this.e2 = this.e3 = -1;

        if (isPolygon && vertices.length > 2) {
            currentVertex = vertices[len - 2];
            nextNormal = firstVertex.sub(currentVertex)._unit()._perp();
        }

        for (let i = first; i < len; i++) {
            nextVertex = (isPolygon && vertices.length > 2) && i === len - 1 ?
                vertices[first + 1] : // if the line is closed, we treat the last vertex like the first
                vertices[i + 1]; // just the next vertex

            if (nextVertex && vertices[i].equals(nextVertex)) continue;

            if (nextNormal) prevNormal = nextNormal;
            if (currentVertex) prevVertex = currentVertex;
            currentVertex = vertices[i];
            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;
            prevNormal = prevNormal || nextNormal;

            let joinNormal = prevNormal.add(nextNormal);
            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
                joinNormal._unit();
            }
            const cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
            const miterLength = cosHalfAngle !== 0 ? 1 / cosHalfAngle : Infinity;
            const isSharpCorner = cosHalfAngle < COS_HALF_SHARP_CORNER && prevVertex && nextVertex;

            if (isSharpCorner && i > first) {
                const prevSegmentLength = currentVertex.dist(prevVertex);
                if (prevSegmentLength > 2 * sharpCornerOffset) {
                    const newPrevVertex = currentVertex.sub(currentVertex.sub(prevVertex)._mult(sharpCornerOffset / prevSegmentLength)._round());
                    this.distance += newPrevVertex.dist(prevVertex);
                    this.addCurrentVertex(newPrevVertex, this.distance, prevNormal.mult(1), 0, 0, false, segment, lineDistances);
                    prevVertex = newPrevVertex;
                }
            }

            const middleVertex = prevVertex && nextVertex;
            let currentJoin = middleVertex ? join : nextVertex ? beginCap : endCap;

            if (middleVertex && currentJoin === 'round') {
                if (miterLength < roundLimit) {
                    currentJoin = 'miter';
                } else if (miterLength <= 2) {
                    currentJoin = 'fakeround';
                }
            }

            if (currentJoin === 'miter' && miterLength > miterLimit) {
                currentJoin = 'bevel';
            }

            if (currentJoin === 'bevel') {
                if (miterLength > 2) currentJoin = 'flipbevel';
                if (miterLength < miterLimit) currentJoin = 'miter';
            }

            if (prevVertex) this.distance += currentVertex.dist(prevVertex);
            if (currentJoin === 'miter') {
                joinNormal._mult(miterLength);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);
            } else if (currentJoin === 'flipbevel') {
                if (miterLength > 100) {
                    joinNormal = nextNormal.clone().mult(-1);
                } else {
                    const direction = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0 ? -1 : 1;
                    const bevelLength = miterLength * prevNormal.add(nextNormal).mag() / prevNormal.sub(nextNormal).mag();
                    joinNormal._perp()._mult(bevelLength * direction);
                }
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal.mult(-1), 0, 0, false, segment, lineDistances);
            } else if (currentJoin === 'bevel' || currentJoin === 'fakeround') {
                const lineTurnsLeft = (prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x) > 0;
                const offset = -Math.sqrt(miterLength * miterLength - 1);
                if (lineTurnsLeft) {
                    offsetB = 0;
                    offsetA = offset;
                } else {
                    offsetA = 0;
                    offsetB = offset;
                }

                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, offsetA, offsetB, false, segment, lineDistances);
                }

                if (currentJoin === 'fakeround') {
                    const n = Math.floor((0.5 - (cosHalfAngle - 0.5)) * 8);
                    let approxFractionalJoinNormal;
                    for (let m = 0; m < n; m++) {
                        approxFractionalJoinNormal = nextNormal.mult((m + 1) / (n + 1))._add(prevNormal)._unit();
                        this.addPieSliceVertex(currentVertex, this.distance, approxFractionalJoinNormal, lineTurnsLeft, segment, lineDistances);
                    }
                    this.addPieSliceVertex(currentVertex, this.distance, joinNormal, lineTurnsLeft, segment, lineDistances);
                    for (let k = n - 1; k >= 0; k--) {
                        approxFractionalJoinNormal = prevNormal.mult((k + 1) / (n + 1))._add(nextNormal)._unit();
                        this.addPieSliceVertex(currentVertex, this.distance, approxFractionalJoinNormal, lineTurnsLeft, segment, lineDistances);
                    }
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -offsetA, -offsetB, false, segment, lineDistances);
                }

            } else if (currentJoin === 'butt') {
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }

            } else if (currentJoin === 'square') {
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, false, segment, lineDistances);
                    this.e1 = this.e2 = -1;
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, false, segment, lineDistances);
                }
            } else if (currentJoin === 'round') {
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, true, segment, lineDistances);
                    this.e1 = this.e2 = -1;
                }

                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, true, segment, lineDistances);
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }
            }

            if (isSharpCorner && i < len - 1) {
                const nextSegmentLength = currentVertex.dist(nextVertex);
                if (nextSegmentLength > 2 * sharpCornerOffset) {
                    const newCurrentVertex = currentVertex.add(nextVertex.sub(currentVertex)._mult(sharpCornerOffset / nextSegmentLength)._round());
                    this.distance += newCurrentVertex.dist(currentVertex);
                    this.addCurrentVertex(newCurrentVertex, this.distance, nextNormal.mult(1), 0, 0, false, segment, lineDistances);
                    currentVertex = newCurrentVertex;
                }
            }
            startOfLine = false;
        }
        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
    }
}

register('IPFillExtrusionBucket', IPFillExtrusionBucket, {omit: ['layers', 'features']});

export default IPFillExtrusionBucket;

function isBoundaryEdge(p1, p2) {
    return (p1.x === p2.x && (p1.x < 0 || p1.x > EXTENT)) ||
        (p1.y === p2.y && (p1.y < 0 || p1.y > EXTENT));
}

function isOnOrOutBoundaryEdge(p1, p2) {
    return (p1.x === p2.x && (p1.x <= 0 || p1.x >= EXTENT)) ||
        (p1.y === p2.y && (p1.y <= 0 || p1.y >= EXTENT));
}

function isEntirelyOutside(ring) {
    return ring.every(p => p.x < 0) ||
        ring.every(p => p.x > EXTENT) ||
        ring.every(p => p.y < 0) ||
        ring.every(p => p.y > EXTENT);
}

function scaleDistance(tileDistance, stats) {
    return ((tileDistance / stats.tileTotal) * (stats.end - stats.start) + stats.start) * (MAX_LINE_DISTANCE - 1);
}

function calculateFullDistance(vertices, first, len) {
    let currentVertex, nextVertex;
    let total = 0;
    for (let i = first; i < len - 1; i++) {
        currentVertex = vertices[i];
        nextVertex = vertices[i + 1];
        total += currentVertex.dist(nextVertex);
    }
    return total;
}

// ============================================================
