var IP_PROJECT_NAME = "WTMap";
var wtVersion = "v2.6.1";

function getParameter(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var targetVersion = getParameter("version");
if (targetVersion != null) {
    wtVersion = targetVersion;
}

document.title = "WTMap-" + wtVersion;
injectScript(IP_PROJECT_NAME, wtVersion);

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