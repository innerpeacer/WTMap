// This file is generated. Edit build/generate-style-code.js, then run `yarn run codegen`.
// @flow
/* eslint-disable */

import styleSpec from '../../style-spec/reference/latest';

import {
    Properties,
    DataConstantProperty,
    DataDrivenProperty,
    CrossFadedDataDrivenProperty,
    CrossFadedProperty,
    ColorRampProperty
} from '../properties';

const layout = new Properties({
    "ipfill-extrusion-outline-cap": new DataConstantProperty(styleSpec["layout_ipfill-extrusion"]["ipfill-extrusion-outline-cap"]),
    "ipfill-extrusion-outline-join": new DataDrivenProperty(styleSpec["layout_ipfill-extrusion"]["ipfill-extrusion-outline-join"]),
    "ipfill-extrusion-outline-miter-limit": new DataConstantProperty(styleSpec["layout_ipfill-extrusion"]["ipfill-extrusion-outline-miter-limit"]),
    "ipfill-extrusion-outline-round-limit": new DataConstantProperty(styleSpec["layout_ipfill-extrusion"]["ipfill-extrusion-outline-round-limit"]),
});

const paint = new Properties({
    "ipfill-extrusion-opacity": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-opacity"]),
    "ipfill-extrusion-color": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-color"]),
    "ipfill-extrusion-translate": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-translate"]),
    "ipfill-extrusion-translate-anchor": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-translate-anchor"]),
    "ipfill-extrusion-pattern": new CrossFadedDataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-pattern"]),
    "ipfill-extrusion-height": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-height"]),
    "ipfill-extrusion-base": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-base"]),

    "ipfill-extrusion-outline-opacity": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-opacity"]),
    "ipfill-extrusion-outline-color": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-color"]),
    "ipfill-extrusion-outline-translate": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-translate"]),
    "ipfill-extrusion-outline-translate-anchor": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-translate-anchor"]),
    "ipfill-extrusion-outline-width": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-width"]),
    "ipfill-extrusion-outline-height": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-height"]),
    "ipfill-extrusion-outline-gap-width": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-gap-width"]),
    "ipfill-extrusion-outline-offset": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-offset"]),
    "ipfill-extrusion-outline-blur": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-blur"]),
    "ipfill-extrusion-outline-dasharray": new CrossFadedProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-dasharray"]),
    "ipfill-extrusion-outline-pattern": new CrossFadedDataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-pattern"]),
    "ipfill-extrusion-outline-gradient": new ColorRampProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-outline-gradient"]),
});

export default ({ paint, layout });