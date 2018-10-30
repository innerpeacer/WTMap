var IP_PROJECT_NAME = "WebMap";
var IP_MAP_VERSION = "v2.3.0";

var ipmapJSPath = '<script src="/' + IP_PROJECT_NAME + '/src/mapbox/0.50.0/dist/ipmap-gl-' + IP_MAP_VERSION + '.js"></script>';
var cssPath = '<link rel="stylesheet" type="text/css" href="/' + IP_PROJECT_NAME + '/src/mapbox/0.50.0/dist/ipmap-gl-'+IP_MAP_VERSION+'.css"/>';
document.write(ipmapJSPath);
document.write(cssPath);

var helperJSPath = '<script src="/' + IP_PROJECT_NAME + '/html/ipmap/js/helper.js"></script>';
document.write(helperJSPath);

var defaultCssPath = '<link rel="stylesheet" type="text/css" href="/' + IP_PROJECT_NAME + '/html/ipmap/css/base.css"/>';
document.write(defaultCssPath);
