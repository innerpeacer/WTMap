let worldSize = 1;

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
    var pixels = [lngX(maxBounds[0]), latY(maxBounds[1]), lngX(maxBounds[2]), latY(maxBounds[3])];

    var pixelSize = {x: Math.abs(pixels[0] - pixels[2]), y: Math.abs(pixels[1] - pixels[3])};
    var pixelCenter = {x: (pixels[0] + pixels[2]) * 0.5, y: (pixels[1] + pixels[3]) * 0.5};

    var pixelScaleX = width / pixelSize.x;
    var pixelScaleY = height / pixelSize.y;

    var actualPixels = [pixels[0], pixels[1], pixels[2], pixels[3]];
    if (pixelScaleX < pixelScaleY) {
        var actualSizeX = pixelSize.y * width / height;
        actualPixels[0]= pixelCenter.x - actualSizeX * 0.5;
        actualPixels[2]= pixelCenter.x + actualSizeX * 0.5;
    } else {
        var actualSizeY = pixelSize.x * height / width;
        actualPixels[1] = pixelCenter.y - actualSizeY * 0.5;
        actualPixels[3] = pixelCenter.y + actualSizeY * 0.5;
    }
    return [xLng(actualPixels[0]), yLat(actualPixels[1]), xLng(actualPixels[2]),  yLat(actualPixels[3])];
}

function calculateZoomForMaxBounds(maxBounds, width, height) {
    var actualBounds = getActualBounds(maxBounds, width, height);
    return calculateZoom(actualBounds, width, height);
}

function calculateZoom(bounds, width, height) {
    // console.log("calculate zoom");
    var lng1 = bounds[0];
    var lat1 = bounds[1];
    var lng2 = bounds[2];
    var lat2 = bounds[3];

    var size_x = Math.abs(lng1 - lng2);
    var size_y = Math.abs(lat1 - lat2);

    var scaleX = width * 180 / size_x / 512;
    var scaleY = height * 85.05113 * 2 / size_y / 512;

    var zoom = scaleToZoom(Math.min(scaleX, scaleY)) + 1;
    return zoom;
}

function scaleToZoom(scale) {
    return Math.log(scale) / Math.LN2;
}

export default calculateZoomForMaxBounds;