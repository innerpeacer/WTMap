class tile_debug {

}

tile_debug.filterCoord = function (source, coord) {
    let targetTile = source.map.__targetTile;
    if (targetTile == null) return true;

    if (targetTile.z == coord.canonical.z &&
        targetTile.x == coord.canonical.x &&
        targetTile.y == coord.canonical.y)
        return true;

    return false;
};

export {tile_debug}
