import styleSpec from '../../style-spec/reference/latest';

import {
    Properties,
    DataConstantProperty,
    DataDrivenProperty,
    CrossFadedDataDrivenProperty,
} from '../properties';

const paint = new Properties({
    "ipfill-extrusion-opacity": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-opacity"]),
    "ipfill-extrusion-color": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-color"]),
    "ipfill-extrusion-translate": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-translate"]),
    "ipfill-extrusion-translate-anchor": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-translate-anchor"]),
    "ipfill-extrusion-pattern": new CrossFadedDataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-pattern"]),
    "ipfill-extrusion-height": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-height"]),
    "ipfill-extrusion-base": new DataDrivenProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-base"]),
    "ipfill-extrusion-vertical-gradient": new DataConstantProperty(styleSpec["paint_ipfill-extrusion"]["ipfill-extrusion-vertical-gradient"]),
});

// Note: without adding the explicit type annotation, Flow infers weaker types
// for these objects from their use in the constructor to StyleLayer, as
// {layout?: Properties<...>, paint: Properties<...>}
export default ({paint});
