// @flow
function getCBMJson(bID, options) {
    if (options._useFile) {
        return `${options._apiHost}/${options._resourceRootDir}/mapdata/cbm/${bID}.json` + '?t=' + Date.now();
    } else {
        return `${options._apiHost}/${options._apiPath}/web/GetCBM?buildingID=${bID}`;
    }
}

function getCBMPbf(bID, options) {
    return `${options._apiHost}/${options._resourceRootDir}/mapdata/cbm/${bID}.pbf` + '?t=' + Date.now();
}

export function getThemePbfPath(themeID: string, options: Object): string {
    return `${options._apiHost}/${options._resourceRootDir}/theme/Theme_${themeID}.pbf` + '?t=' + Date.now();
}

export function getCBMPath(bID: string, options: Object): string {
    if (options.usePbf) {
        return getCBMPbf(bID, options);
    } else {
        return getCBMJson(bID, options);
    }
}

function getTilePbf(bID, options) {
    return [`${options._apiHost}/${options._resourceRootDir}/mapdata/vectortile/${bID}/{z}/{x}/{y}.pbf`];
}

export function getTilePath(bID: string, options: Object): Array<string> {
    return getTilePbf(bID, options);
}
