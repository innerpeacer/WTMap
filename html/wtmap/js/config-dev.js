let IP_PROJECT_NAME = 'WTMap';
let wtVersion = 'v2.7.1';

function getParameter(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

let targetVersion = getParameter('version');
if (targetVersion != null) {
    wtVersion = targetVersion;
}

document.title = document.title + '-' + wtVersion;
injectScript(IP_PROJECT_NAME, wtVersion);

function injectScript(projectName, version) {
    console.log('injectScript: ', version);
    let ipmapJSPath = '<script src="/' + projectName + '/dist/wtmap-gl-' + version + '.js"></script>';
    let cssPath = '<link rel="stylesheet" type="text/css" href="/' + projectName + '/dist/wtmap-gl-' + version + '.css"/>';
    document.write(ipmapJSPath);
    document.write(cssPath);

    let helperJSPath = '<script src="/' + projectName + '/html/wtmap/js/helper.js"></script>';
    document.write(helperJSPath);

    let defaultCssPath = '<link rel="stylesheet" type="text/css" href="/' + projectName + '/html/wtmap/css/base.css"/>';
    document.write(defaultCssPath);

    let floorSwitchCssPath = '<link rel="stylesheet" type="text/css" href="/' + projectName + '/html/wtmap/css/floor-switch.css" >';
    document.write(floorSwitchCssPath);
}
