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

import type Color from '../../style-spec/util/color';

import type {Formatted} from '../../style-spec/expression/definitions/formatted';

export type LayoutProps = {|
    "ipline-cap": DataConstantProperty<"butt" | "round" | "square">,
    "ipline-join": DataDrivenProperty<"bevel" | "round" | "miter">,
    "ipline-miter-limit": DataConstantProperty<number>,
    "ipline-round-limit": DataConstantProperty<number>,
|};

const layout: Properties<LayoutProps> = new Properties({
    "ipline-cap": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-cap"]),
    "ipline-join": new DataDrivenProperty(styleSpec["layout_ipline"]["ipline-join"]),
    "ipline-miter-limit": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-miter-limit"]),
    "ipline-round-limit": new DataConstantProperty(styleSpec["layout_ipline"]["ipline-round-limit"]),
});

export type PaintProps = {|
    "ipline-opacity": DataDrivenProperty<number>,
    "ipline-color": DataDrivenProperty<Color>,
    "ipline-translate": DataConstantProperty<[number, number]>,
    "ipline-translate-anchor": DataConstantProperty<"map" | "viewport">,
    "ipline-width": DataDrivenProperty<number>,
    "ipline-gap-width": DataDrivenProperty<number>,
    "ipline-offset": DataDrivenProperty<number>,
    "ipline-blur": DataDrivenProperty<number>,
    "ipline-dasharray": CrossFadedProperty<Array<number>>,
    "ipline-pattern": CrossFadedDataDrivenProperty<string>,
    "ipline-gradient": ColorRampProperty,
|};

const paint: Properties<PaintProps> = new Properties({
    "ipline-opacity": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-opacity"]),
    "ipline-color": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-color"]),
    "ipline-translate": new DataConstantProperty(styleSpec["paint_ipline"]["ipline-translate"]),
    "ipline-translate-anchor": new DataConstantProperty(styleSpec["paint_ipline"]["ipline-translate-anchor"]),
    "ipline-width": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-width"]),
    "ipline-gap-width": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-gap-width"]),
    "ipline-offset": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-offset"]),
    "ipline-blur": new DataDrivenProperty(styleSpec["paint_ipline"]["ipline-blur"]),
    "ipline-dasharray": new CrossFadedProperty(styleSpec["paint_ipline"]["ipline-dasharray"]),
    "ipline-pattern": new CrossFadedDataDrivenProperty(styleSpec["paint_ipline"]["ipline-pattern"]),
    "ipline-gradient": new ColorRampProperty(styleSpec["paint_ipline"]["ipline-gradient"]),
});

// Note: without adding the explicit type annotation, Flow infers weaker types
// for these objects from their use in the constructor to StyleLayer, as
// {layout?: Properties<...>, paint: Properties<...>}
export default ({ paint, layout }: $Exact<{
  paint: Properties<PaintProps>, layout: Properties<LayoutProps>
}>);
