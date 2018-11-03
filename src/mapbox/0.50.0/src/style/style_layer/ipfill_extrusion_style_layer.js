// @flow

import StyleLayer from '../style_layer';

import IPFillExtrusionBucket from '../../data/bucket/ipfill_extrusion_bucket';
import { multiPolygonIntersectsMultiPolygon } from '../../util/intersection_tests';
import properties from './ipfill_extrusion_style_layer_properties';

import Point from '@mapbox/point-geometry';
import IPLineBucket from '../../data/bucket/ipline_bucket';
import {RGBAImage} from '../../util/image';
import {multiPolygonIntersectsBufferedMultiLine} from '../../util/intersection_tests';
import {getMaximumPaintValue, translateDistance, translate} from '../query_utils';
import {extend} from '../../util/util';
import EvaluationParameters from '../evaluation_parameters';
import renderColorRamp from '../../util/color_ramp';
import {Transitionable, Transitioning, Layout, PossiblyEvaluated, DataDrivenProperty} from '../properties';


class LineFloorwidthProperty extends DataDrivenProperty<number> {
    useIntegerZoom: true;

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

const lineFloorwidthProperty = new LineFloorwidthProperty(properties.paint.properties['ipfill-extrusion-outline-width'].specification);
lineFloorwidthProperty.useIntegerZoom = true;


class IPFillExtrusionStyleLayer extends StyleLayer {
    _unevaluatedLayout: Layout<LayoutProps>;
    layout: PossiblyEvaluated<LayoutProps>;

    _transitionablePaint: Transitionable<PaintProps>;
    _transitioningPaint: Transitioning<PaintProps>;
    paint: PossiblyEvaluated<PaintProps>;
    viewportFrame: ?Framebuffer;

    constructor(layer: LayerSpecification) {
        super(layer, properties);
    }

    _handleSpecialPaintPropertyUpdate(name: string) {
        if (name === 'ipfill-extrusion-line-gradient') {
            this._updateGradient();
        }
    }

    _updateGradient() {
        const expression = this._transitionablePaint._values['ipfill-extrusion-outline-gradient'].value.expression;
        this.gradient = renderColorRamp(expression, 'iplineProgress');
        this.gradientTexture = null;
    }

    recalculate(parameters: EvaluationParameters) {
        super.recalculate(parameters);
        (this.paint._values:any)['ipfill-extrusion-outline-floorwidth'] =
            lineFloorwidthProperty.possiblyEvaluate(this._transitioningPaint._values['ipfill-extrusion-outline-width'].value, parameters);
    }

    createBucket(parameters: BucketParameters<IPFillExtrusionStyleLayer>) {
        return new IPFillExtrusionBucket(parameters);
    }

    queryRadius(): number {
        return translateDistance(this.paint.get('ipfill-extrusion-translate'));
    }

    queryIntersectsFeature(queryGeometry: Array<Array<Point>>,
                           feature: VectorTileFeature,
                           featureState: FeatureState,
                           geometry: Array<Array<Point>>,
                           zoom: number,
                           transform: Transform,
                           pixelsToTileUnits: number): boolean {
        const translatedPolygon = translate(queryGeometry,
            this.paint.get('ipfill-extrusion-translate'),
            this.paint.get('ipfill-extrusion-translate-anchor'),
            transform.angle, pixelsToTileUnits);
        return multiPolygonIntersectsMultiPolygon(translatedPolygon, geometry);
    }

    hasOffscreenPass() {
        return this.paint.get('ipfill-extrusion-opacity') !== 0 && this.visibility !== 'none';
    }

    resize() {
        if (this.viewportFrame) {
            this.viewportFrame.destroy();
            this.viewportFrame = null;
        }
    }
}

export default IPFillExtrusionStyleLayer;


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
