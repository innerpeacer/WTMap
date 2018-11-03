// @flow

import {IPFillExtrusionLayoutArray} from '../array_types';

import {members as layoutAttributes} from './ipfill_extrusion_attributes';
import SegmentVector from '../segment';
import {ProgramConfigurationSet} from '../program_configuration';
import {TriangleIndexArray} from '../index_array_type';
import EXTENT from '../extent';
import earcut from 'earcut';
import classifyRings from '../../util/classify_rings';
import assert from 'assert';

const EARCUT_MAX_RINGS = 500;
import {register} from '../../util/web_worker_transfer';
import {hasPattern, addPatternDependencies} from './pattern_bucket_features';
import loadGeometry from '../load_geometry';
import EvaluationParameters from '../../style/evaluation_parameters';

import mvt from '@mapbox/vector-tile';

const vectorTileFeatureTypes = mvt.VectorTileFeature.types;

const FACTOR = Math.pow(2, 13);

// From ipline
const EXTRUDE_SCALE = 63;
const COS_HALF_SHARP_CORNER = Math.cos(75 / 2 * (Math.PI / 180));
const SHARP_CORNER_OFFSET = 15;
const LINE_DISTANCE_BUFFER_BITS = 15;
const LINE_DISTANCE_SCALE = 1 / 2;
const MAX_LINE_DISTANCE = Math.pow(2, LINE_DISTANCE_BUFFER_BITS - 1) / LINE_DISTANCE_SCALE;

function addLineVertex(layoutVertexBuffer, point, extrude, round, up, dir, linesofar) {
    layoutVertexBuffer.emplaceBack(
        // a_pos_normal
        0, 0,
        0, 0, 0, 0,
        point.x,
        point.y,
        round ? 1 : 0,
        up ? 1 : -1,
        // a_data
        // add 128 to store a byte in an unsigned byte
        Math.round(EXTRUDE_SCALE * extrude.x) + 128,
        Math.round(EXTRUDE_SCALE * extrude.y) + 128,
        // Encode the -1/0/1 direction value into the first two bits of .z of a_data.
        // Combine it with the lower 6 bits of `linesofar` (shifted by 2 bites to make
        // room for the direction value). The upper 8 bits of `linesofar` are placed in
        // the `w` component. `linesofar` is scaled down by `LINE_DISTANCE_SCALE` so that
        // we can store longer distances while sacrificing precision.
        ((dir === 0 ? 0 : (dir < 0 ? -1 : 1)) + 1) | (((linesofar * LINE_DISTANCE_SCALE) & 0x3F) << 2),
        (linesofar * LINE_DISTANCE_SCALE) >> 6);
}

// From ipline


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


class IPFillExtrusionBucket implements Bucket {
    // From ipline
    distance: number;
    e1: number;
    e2: number;
    e3: number;
    // From ipline

    index: number;
    zoom: number;
    overscaling: number;
    layers: Array<IPFillExtrusionStyleLayer>;
    layerIds: Array<string>;
    stateDependentLayers: Array<IPFillExtrusionStyleLayer>;

    layoutVertexArray: IPFillExtrusionLayoutArray;
    layoutVertexBuffer: VertexBuffer;

    indexArray: TriangleIndexArray;
    indexBuffer: IndexBuffer;

    hasPattern: boolean;
    programConfigurations: ProgramConfigurationSet<IPFillExtrusionStyleLayer>;
    segments: SegmentVector;
    uploaded: boolean;
    features: Array<BucketFeature>;

    constructor(options: BucketParameters<IPFillExtrusionStyleLayer>) {
        this.zoom = options.zoom;
        this.overscaling = options.overscaling;
        this.layers = options.layers;
        this.layerIds = this.layers.map(layer => layer.id);
        this.index = options.index;
        this.hasPattern = false;

        this.features = [];

        this.layoutVertexArray = new IPFillExtrusionLayoutArray();
        this.indexArray = new TriangleIndexArray();
        this.programConfigurations = new ProgramConfigurationSet(layoutAttributes, options.layers, options.zoom);
        this.segments = new SegmentVector();
    }

    populate(features, options) {
        this.features = [];
        this.hasPattern = hasPattern('ipfill-extrusion', this.layers, options);

        for (const {feature, index, sourceLayerIndex} of features) {
            if (!this.layers[0]._featureFilter(new EvaluationParameters(this.zoom), feature)) continue;

            const geometry = loadGeometry(feature);

            const patternFeature = {
                sourceLayerIndex: sourceLayerIndex,
                index: index,
                geometry: geometry,
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
                // this.addExtrusionOutlineFeature(patternFeature, geometry, index, {});
            }

            options.featureIndex.insert(feature, geometry, index, sourceLayerIndex, this.index);
        }
    }

    addFeatures(options, imagePositions) {
        for (const feature of this.features) {
            const {geometry} = feature;
            this.addFillExtrusionFeature(feature, geometry, feature.index, imagePositions);
            // this.addExtrusionOutlineFeature(feature, geometry, feature.index, imagePositions);
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

    // From ipline
    addExtrusionOutlineFeature(feature, geometry, index, imagePositions) {
        const layout = this.layers[0].layout;
        const join = layout.get('ipfill-extrusion-outline-join').evaluate(feature, {});
        const cap = layout.get('ipfill-extrusion-outline-cap');
        const miterLimit = layout.get('ipfill-extrusion-outline-miter-limit');
        const roundLimit = layout.get('ipfill-extrusion-outline-round-limit');

        for (const line of geometry) {
            this.addLine(line, feature, join, cap, miterLimit, roundLimit, index, imagePositions);
        }
    }

    // From ipline


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
                            this.indexArray.emplaceBack(bottomRight, bottomRight + 2, bottomRight + 1);
                            this.indexArray.emplaceBack(bottomRight + 1, bottomRight + 2, bottomRight + 3);

                            // this.indexArray.emplaceBack(bottomRight, bottomRight + 1, bottomRight + 2);
                            // this.indexArray.emplaceBack(bottomRight + 1, bottomRight + 2, bottomRight + 3);

                            segment.vertexLength += 4;
                            segment.primitiveLength += 2;
                        }
                    }
                }
            }

            if (segment.vertexLength + numVertices > SegmentVector.MAX_VERTEX_ARRAY_LENGTH) {
                segment = this.segments.prepareSegment(numVertices, this.layoutVertexArray, this.indexArray);
            }

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
                this.indexArray.emplaceBack(
                    triangleIndex + indices[j],
                    triangleIndex + indices[j + 1],
                    triangleIndex + indices[j + 2]);
            }

            segment.primitiveLength += indices.length / 3;
            segment.vertexLength += numVertices;
        }

        this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length, feature, index, imagePositions);
    }


// From ipline
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

        const isPolygon = vectorTileFeatureTypes[feature.type] === 'Polygon';

        // If the line has duplicate vertices at the ends, adjust start/length to remove them.
        let len = vertices.length;
        while (len >= 2 && vertices[len - 1].equals(vertices[len - 2])) {
            len--;
        }
        let first = 0;
        while (first < len - 1 && vertices[first].equals(vertices[first + 1])) {
            first++;
        }

        // Ignore invalid geometry.
        if (len < (isPolygon ? 3 : 2)) return;

        if (lineDistances) {
            lineDistances.tileTotal = calculateFullDistance(vertices, first, len);
        }

        if (join === 'bevel') miterLimit = 1.05;

        const sharpCornerOffset = SHARP_CORNER_OFFSET * (EXTENT / (512 * this.overscaling));

        const firstVertex = vertices[first];

        // we could be more precise, but it would only save a negligible amount of space
        const segment = this.segments.prepareSegment(len * 10, this.layoutVertexArray, this.indexArray);

        this.distance = 0;

        const beginCap = cap,
            endCap = isPolygon ? 'butt' : cap;
        let startOfLine = true;
        let currentVertex;
        let prevVertex = ((undefined: any): Point);
        let nextVertex = ((undefined: any): Point);
        let prevNormal = ((undefined: any): Point);
        let nextNormal = ((undefined: any): Point);
        let offsetA;
        let offsetB;

        // the last three vertices added
        this.e1 = this.e2 = this.e3 = -1;

        if (isPolygon) {
            currentVertex = vertices[len - 2];
            nextNormal = firstVertex.sub(currentVertex)._unit()._perp();
        }

        for (let i = first; i < len; i++) {

            nextVertex = isPolygon && i === len - 1 ?
                vertices[first + 1] : // if the line is closed, we treat the last vertex like the first
                vertices[i + 1]; // just the next vertex

            // if two consecutive vertices exist, skip the current one
            if (nextVertex && vertices[i].equals(nextVertex)) continue;

            if (nextNormal) prevNormal = nextNormal;
            if (currentVertex) prevVertex = currentVertex;

            currentVertex = vertices[i];

            // Calculate the normal towards the next vertex in this line. In case
            // there is no next vertex, pretend that the line is continuing straight,
            // meaning that we are just using the previous normal.
            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;

            // If we still don't have a previous normal, this is the beginning of a
            // non-closed line, so we're doing a straight "join".
            prevNormal = prevNormal || nextNormal;

            // Determine the normal of the join extrusion. It is the angle bisector
            // of the segments between the previous line and the next line.
            // In the case of 180° angles, the prev and next normals cancel each other out:
            // prevNormal + nextNormal = (0, 0), its magnitude is 0, so the unit vector would be
            // undefined. In that case, we're keeping the joinNormal at (0, 0), so that the cosHalfAngle
            // below will also become 0 and miterLength will become Infinity.
            let joinNormal = prevNormal.add(nextNormal);
            if (joinNormal.x !== 0 || joinNormal.y !== 0) {
                joinNormal._unit();
            }
            /*  joinNormal     prevNormal
             *             ↖      ↑
             *                .________. prevVertex
             *                |
             * nextNormal  ←  |  currentVertex
             *                |
             *     nextVertex !
             *
             */

            // Calculate the length of the miter (the ratio of the miter to the width).
            // Find the cosine of the angle between the next and join normals
            // using dot product. The inverse of that is the miter length.
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

            // The join if a middle vertex, otherwise the cap.
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
                // The maximum extrude length is 128 / 63 = 2 times the width of the line
                // so if miterLength >= 2 we need to draw a different type of bevel here.
                if (miterLength > 2) currentJoin = 'flipbevel';

                // If the miterLength is really small and the line bevel wouldn't be visible,
                // just draw a miter join to save a triangle.
                if (miterLength < miterLimit) currentJoin = 'miter';
            }

            // Calculate how far along the line the currentVertex is
            if (prevVertex) this.distance += currentVertex.dist(prevVertex);

            if (currentJoin === 'miter') {

                joinNormal._mult(miterLength);
                this.addCurrentVertex(currentVertex, this.distance, joinNormal, 0, 0, false, segment, lineDistances);

            } else if (currentJoin === 'flipbevel') {
                // miter is too big, flip the direction to make a beveled join

                if (miterLength > 100) {
                    // Almost parallel lines
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

                // Close previous segment with a bevel
                if (!startOfLine) {
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, offsetA, offsetB, false, segment, lineDistances);
                }

                if (currentJoin === 'fakeround') {
                    // The join angle is sharp enough that a round join would be visible.
                    // Bevel joins fill the gap between segments with a single pie slice triangle.
                    // Create a round join by adding multiple pie slices. The join isn't actually round, but
                    // it looks like it is at the sizes we render lines at.

                    // Add more triangles for sharper angles.
                    // This math is just a good enough approximation. It isn't "correct".
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

                // Start next segment
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -offsetA, -offsetB, false, segment, lineDistances);
                }

            } else if (currentJoin === 'butt') {
                if (!startOfLine) {
                    // Close previous segment with a butt
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);
                }

                // Start next segment with a butt
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, 0, 0, false, segment, lineDistances);
                }

            } else if (currentJoin === 'square') {

                if (!startOfLine) {
                    // Close previous segment with a square cap
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, false, segment, lineDistances);

                    // The segment is done. Unset vertices to disconnect segments.
                    this.e1 = this.e2 = -1;
                }

                // Start next segment
                if (nextVertex) {
                    this.addCurrentVertex(currentVertex, this.distance, nextNormal, -1, -1, false, segment, lineDistances);
                }

            } else if (currentJoin === 'round') {

                if (!startOfLine) {
                    // Close previous segment with butt
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 0, 0, false, segment, lineDistances);

                    // Add round cap or linejoin at end of segment
                    this.addCurrentVertex(currentVertex, this.distance, prevNormal, 1, 1, true, segment, lineDistances);

                    // The segment is done. Unset vertices to disconnect segments.
                    this.e1 = this.e2 = -1;
                }


                // Start next segment with a butt
                if (nextVertex) {
                    // Add round cap before first segment
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

    addCurrentVertex(currentVertex, distance, normal, endLeft, endRight, round, segment, distancesForScaling) {
        let extrude;
        const layoutVertexArray = this.layoutVertexArray;
        const indexArray = this.indexArray;

        if (distancesForScaling) {
            // For gradient lines, scale distance from tile units to [0, 2^15)
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

        // There is a maximum "distance along the line" that we can store in the buffers.
        // When we get close to the distance, reset it to zero and add the vertex again with
        // a distance of zero. The max distance is determined by the number of bits we allocate
        // to `linesofar`.
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

// From ipline
}

register('IPFillExtrusionBucket', IPFillExtrusionBucket, {omit: ['layers', 'features']});

export default IPFillExtrusionBucket;

function scaleDistance(tileDistance, stats) {
    return ((tileDistance / stats.tileTotal) * (stats.end - stats.start) + stats.start) * (MAX_LINE_DISTANCE - 1);
}

/**
 * Calculate the total distance, in tile units, of this tiled line feature
 *
 * @param {Array<Point>} vertices the full geometry of this tiled line feature
 * @param {number} first the index in the vertices array representing the first vertex we should consider
 * @param {number} len the count of vertices we should consider from `first`
 *
 * @private
 */
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

function isBoundaryEdge(p1, p2) {
    return (p1.x === p2.x && (p1.x < 0 || p1.x > EXTENT)) ||
        (p1.y === p2.y && (p1.y < 0 || p1.y > EXTENT));
}

function isEntirelyOutside(ring) {
    return ring.every(p => p.x < 0) ||
        ring.every(p => p.x > EXTENT) ||
        ring.every(p => p.y < 0) ||
        ring.every(p => p.y > EXTENT);
}
