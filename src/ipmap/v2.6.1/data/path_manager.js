function getCBMJson(bID, options) {
    if (options._useFile) {
        return `${options._apiHost}/${options._dataRootDir}/cbm/${bID}.json` + '?t=' + Date.now();
    } else {
        return `${options._apiHost}/${options._apiPath}/web/GetCBM?buildingID=${bID}`;
    }
}

function getCBMPbf(bID, options) {
    return `${options._apiHost}/${options._dataRootDir}/cbm/${bID}.pbf` + '?t=' + Date.now();
}

export function getThemePbfPath(themeID, options) {
    return `${options._apiHost}/${options._resourceRootDir}/theme/Theme_${themeID}.pbf` + '?t=' + Date.now();
}

export function getCBMPath(bID, options) {
    if (options.usePbf) {
        return getCBMPbf(bID, options);
    } else {
        return getCBMJson(bID, options);
    }
}

function getTilePbf(bID, options) {
    return [`${options._apiHost}/${options._dataRootDir}/vectortile/${bID}/{z}/{x}/{y}.pbf`];
}

export function getTilePath(bID, options) {
    return getTilePbf(bID, options);
}
