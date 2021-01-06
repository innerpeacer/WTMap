// @flow
class ip_tile_coord {
    static lngLatToTile: (number, number, number) => Object;
}

function toRadians(deg) {
    return deg * Math.PI / 180;
}

function lng2Tile(lng, z) {
    return (lng + 180) / 360 * Math.pow(2.0, z);
}

function lat2Tile(lat, z) {
    return (1 - Math.log(Math.tan(toRadians(lat)) + 1 / Math.cos(toRadians(lat))) / Math.PI) / 2
        * (Math.pow(2.0, z));
}

ip_tile_coord.lngLatToTile = function(lng, lat, zoom) {
    let z = Math.floor(zoom);
    let xtile = Math.floor(lng2Tile(lng, z));
    let ytile = Math.floor(lat2Tile(lat, z));

    xtile = xtile < 0 ? 0 : xtile;
    if (xtile >= (1 << z))
        xtile = ((1 << z) - 1);
    ytile = ytile < 0 ? 0 : ytile;
    if (ytile >= (1 << z))
        ytile = ((1 << z) - 1);
    return {z: z, x: xtile, y: ytile};
};

export {ip_tile_coord};
