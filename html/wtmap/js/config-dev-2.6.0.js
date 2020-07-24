var IP_PROJECT_NAME = "WTMap";
var IP_MAP_VERSION = "v2.6.0";

injectScript(IP_PROJECT_NAME, IP_MAP_VERSION);

function injectScript(projectName, version) {
    console.log("injectScript: ", version);
    var ipmapJSPath = '<script src="/' + projectName + '/dist/wtmap-gl-' + version + '.js"></script>';
    var cssPath = '<link rel="stylesheet" type="text/css" href="/' + projectName + '/dist/wtmap-gl-' + version + '.css"/>';
    document.write(ipmapJSPath);
    document.write(cssPath);

    var helperJSPath = '<script src="/' + projectName + '/html/wtmap/js/helper.js"></script>';
    document.write(helperJSPath);

    var defaultCssPath = '<link rel="stylesheet" type="text/css" href="/' + projectName + '/html/wtmap/css/base.css"/>';
    document.write(defaultCssPath);
}