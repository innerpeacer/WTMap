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

// Note: without adding the explicit type annotation, Flow infers weaker types
// for these objects from their use in the constructor to StyleLayer, as
// {layout?: Properties<...>, paint: Properties<...>}
export default ({paint, layout});
