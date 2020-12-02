const worldSize = 1;

function lngX(lng) {
    return (180 + lng) * worldSize / 360;
}

function latY(lat) {
    const y = 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    return (180 - y) * worldSize / 360;
}

function xLng(x) {
    return x * 360 / worldSize - 180;
}

function yLat(y) {
    const y2 = 180 - y * 360 / worldSize;
    return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
}

// maxBounds = [lng1, lat1, lng2, lat2]
function getActualBounds(maxBounds, width, height) {
    let pixels = [lngX(maxBounds[0]), latY(maxBounds[1]), lngX(maxBounds[2]), latY(maxBounds[3])];

    let pixelSize = {x: Math.abs(pixels[0] - pixels[2]), y: Math.abs(pixels[1] - pixels[3])};
    let pixelCenter = {x: (pixels[0] + pixels[2]) * 0.5, y: (pixels[1] + pixels[3]) * 0.5};

    let pixelScaleX = width / pixelSize.x;
    let pixelScaleY = height / pixelSize.y;

    let actualPixels = [pixels[0], pixels[1], pixels[2], pixels[3]];
    if (pixelScaleX < pixelScaleY) {
        let actualSizeX = pixelSize.y * width / height;
        actualPixels[0] = pixelCenter.x - actualSizeX * 0.5;
        actualPixels[2] = pixelCenter.x + actualSizeX * 0.5;
    } else {
        let actualSizeY = pixelSize.x * height / width;
        actualPixels[1] = pixelCenter.y - actualSizeY * 0.5;
        actualPixels[3] = pixelCenter.y + actualSizeY * 0.5;
    }
    return [xLng(actualPixels[0]), yLat(actualPixels[1]), xLng(actualPixels[2]), yLat(actualPixels[3])];
}

function calculateZoomForMaxBounds(maxBounds, width, height) {
    let actualBounds = getActualBounds(maxBounds, width, height);
    return calculateZoom(actualBounds, width, height);
}

function calculateZoom(bounds, width, height) {
    let lng1 = bounds[0];
    let lat1 = bounds[1];
    let lng2 = bounds[2];
    let lat2 = bounds[3];

    let size_x = Math.abs(lng1 - lng2);
    let size_y = Math.abs(lat1 - lat2);

    let pixelRatio = window.devicePixelRatio || 1;
    let scaleX = width / pixelRatio * 180 / size_x / 512;
    let scaleY = height / pixelRatio * 85.05113 * 2 / size_y / 512;

    return scaleToZoom(Math.min(scaleX, scaleY)) + 1;
}

function scaleToZoom(scale) {
    return Math.log(scale) / Math.LN2;
}

export {calculateZoomForMaxBounds};
