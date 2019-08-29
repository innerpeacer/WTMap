import CoordProjection from "../utils/coord_projection"

class location {
    constructor(lng, lat, x, y, f) {
        this.lng = lng;
        this.lat = lat;
        this.x = x;
        this.y = y;
        this.floor = f;
    }

    toString() {
        return `Location: (${this.x}, ${this.y}), (${this.lng}, ${this.lat}) in ${this.floor}`;
    }
}

location.fromLngLat = function (obj) {
    let lng = obj.lng;
    let lat = obj.lat;
    let mercator = CoordProjection.lngLatToMercator(lng, lat);
    let x = mercator.x;
    let y = mercator.y;
    let floor = obj.floor;
    return new location(lng, lat, x, y, floor);
};

location.fromXY = function (obj) {
    let x = obj.x;
    let y = obj.y;
    let lngLat = CoordProjection.mercatorToLngLat(x, y);
    let lng = lngLat.lng;
    let lat = lngLat.lat;
    let floor = obj.floor;
    return new location(lng, lat, x, y, floor);
};

export default location;
