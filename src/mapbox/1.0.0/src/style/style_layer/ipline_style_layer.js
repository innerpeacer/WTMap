// @flow

import Point from '@mapbox/point-geometry';

import StyleLayer from '../style_layer';
import IPLineBucket from '../../data/bucket/ipline_bucket';
import {RGBAImage} from '../../util/image';
import {polygonIntersectsBufferedMultiLine} from '../../util/intersection_tests';
import {getMaximumPaintValue, translateDistance, translate} from '../query_utils';
import properties from './ipline_style_layer_properties';
import {extend} from '../../util/util';
import EvaluationParameters from '../evaluation_parameters';
import renderColorRamp from '../../util/color_ramp';
import {Transitionable, Transitioning, Layout, PossiblyEvaluated, DataDrivenProperty} from '../properties';

class LineFloorwidthProperty extends DataDrivenProperty {
    // useIntegerZoom: true;

    possiblyEvaluate(value, parameters) {
        parameters = new EvaluationParameters(Math.floor(parameters.zoom), {
            now: parameters.now,
            fadeDuration: parameters.fadeDuration,
            zoomHistory: parameters.zoomHistory,
            transition: parameters.transition
        });
        return super.possiblyEvaluate(value, parameters);
    }

    evaluate(value, globals, feature, featureState) {
        globals = extend({}, globals, {zoom: Math.floor(globals.zoom)});
        return super.evaluate(value, globals, feature, featureState);
    }
}

const lineFloorwidthProperty = new LineFloorwidthProperty(properties.paint.properties['ipline-width'].specification);
lineFloorwidthProperty.useIntegerZoom = true;

class IPLineStyleLayer extends StyleLayer {
    // _unevaluatedLayout: Layout<LayoutProps>;
    // layout: PossiblyEvaluated<LayoutProps>;
    //
    // gradient: ?RGBAImage;
    // gradientTexture: ?Texture;
    //
    // _transitionablePaint: Transitionable<PaintProps>;
    // _transitioningPaint: Transitioning<PaintProps>;
    // paint: PossiblyEvaluated<PaintProps>;

    constructor(layer) {
        super(layer, properties);
    }

    _handleSpecialPaintPropertyUpdate(name) {
        if (name === 'ipline-gradient') {
            this._updateGradient();
        }
    }

    _updateGradient() {
        const expression = this._transitionablePaint._values['ipline-gradient'].value.expression;
        this.gradient = renderColorRamp(expression, 'lineProgress');
        this.gradientTexture = null;
    }

    recalculate(parameters) {
        super.recalculate(parameters);

        (this.paint._values)['line-floorwidth'] =
            lineFloorwidthProperty.possiblyEvaluate(this._transitioningPaint._values['ipline-width'].value, parameters);
    }

    createBucket(parameters) {
        return new IPLineBucket(parameters);
    }

    queryRadius(bucket) {
        const lineBucket = (bucket);
        const width = getLineWidth(
            getMaximumPaintValue('ipline-width', this, lineBucket),
            getMaximumPaintValue('ipline-gap-width', this, lineBucket));
        const offset = getMaximumPaintValue('ipline-offset', this, lineBucket);
        return width / 2 + Math.abs(offset) + translateDistance(this.paint.get('ipline-translate'));
    }

    queryIntersectsFeature(queryGeometry,
                           feature,
                           featureState,
                           geometry,
                           zoom,
                           transform,
                           pixelsToTileUnits) {
        const translatedPolygon = translate(queryGeometry,
            this.paint.get('ipline-translate'),
            this.paint.get('ipline-translate-anchor'),
            transform.angle, pixelsToTileUnits);
        const halfWidth = pixelsToTileUnits / 2 * getLineWidth(
            this.paint.get('ipline-width').evaluate(feature, featureState),
            this.paint.get('ipline-gap-width').evaluate(feature, featureState));
        const lineOffset = this.paint.get('ipline-offset').evaluate(feature, featureState);
        if (lineOffset) {
            geometry = offsetLine(geometry, lineOffset * pixelsToTileUnits);
        }
        return polygonIntersectsBufferedMultiLine(translatedPolygon, geometry, halfWidth);
    }

    isTileClipped() {
        return true;
    }
}

export default IPLineStyleLayer;

function getLineWidth(lineWidth, lineGapWidth) {
    if (lineGapWidth > 0) {
        return lineGapWidth + 2 * lineWidth;
    } else {
        return lineWidth;
    }
}

function offsetLine(rings, offset) {
    const newRings = [];
    const zero = new Point(0, 0);
    for (let k = 0; k < rings.length; k++) {
        const ring = rings[k];
        const newRing = [];
        for (let i = 0; i < ring.length; i++) {
            const a = ring[i - 1];
            const b = ring[i];
            const c = ring[i + 1];
            const aToB = i === 0 ? zero : b.sub(a)._unit()._perp();
            const bToC = i === ring.length - 1 ? zero : c.sub(b)._unit()._perp();
            const extrude = aToB._add(bToC)._unit();

            const cosHalfAngle = extrude.x * bToC.x + extrude.y * bToC.y;
            extrude._mult(1 / cosHalfAngle);

            newRing.push(extrude._mult(offset)._add(b));
        }
        newRings.push(newRing);
    }
    return newRings;
}
