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
    "ipline-cap": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-cap"]),
    "ipline-join": new DataDrivenProperty(styleSpec["layout_ipline"]["ipline-join"]),
    "ipline-miter-limit": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-miter-limit"]),
    "ipline-round-limit": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-round-limit"]),
});

const paint = new Properties({
    "ipline-opacity": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-opacity"]),
    "ipline-color": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-color"]),
    "ipline-translate": new DataConstantProperty(styleSpec["paint_ipline"]["ipline-translate"]),
    "ipline-translate-anchor": new DataConstantProperty(styleSpec["paint_ipline"]["ipline-translate-anchor"]),
    "ipline-width": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-width"]),
    "ipline-height": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-height"]),
    "ipline-gap-width": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-gap-width"]),
    "ipline-offset": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-offset"]),
    "ipline-blur": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-blur"]),
    "ipline-dasharray": new CrossFadedProperty(styleSpec["paint_ipline"]["ipline-dasharray"]),
    "ipline-pattern": new CrossFadedDataDrivenProperty(styleSpec["paint_ipline"]["ipline-pattern"]),
    "ipline-gradient": new ColorRampProperty(styleSpec["paint_ipline"]["ipline-gradient"]),
});

export default ({ paint, layout });
