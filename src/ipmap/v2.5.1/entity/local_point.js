import CoordProjection from '../utils/coord_projection'

class local_point {
    constructor(x, y, f) {
        this.x = x;
        this.y = y;
        this.floor = f;
    }

    toStartParameter() {
        return 'startX=' + this.x + '&startY=' + this.y + '&startF=' + this.floor;
    }

    toStartParameter2() {
        return 'start=' + this.x + ',' + this.y + ',' + this.floor;
    }

    toEndParameter() {
        return 'endX=' + this.x + '&endY=' + this.y + '&endF=' + this.floor;
    }

    toEndParameter2() {
        return 'end=' + this.x + ',' + this.y + ',' + this.floor;
    }

    toString() {
        return `X: ${this.x}, Y: ${this.y}, Floor: ${this.floor}`;
    }

    toLngLatPoint() {
        let m = CoordProjection.mercatorToLngLat(this.x, this.y);
        return new lnglat_point(m.lng, m.lat, this.floor);
    }
}

local_point.toStopParams = function (stops) {
    let str = 'stops=';
    for (let i = 0; i < stops.length; ++i) {
        let sp = stops[i];
        if (i != 0) {
            str += ',';
        }
        str += (sp.x + ',' + sp.y + ',' + sp.floor);
    }
    return str;
};

class lnglat_point {
    constructor(lng, lat, f) {
        this.lng = lng;
        this.lat = lat;
        this.floor = f;
    }

    toString() {
        return `Lng: ${this.lng}, Lat: ${this.lat}, Floor: ${this.floor}`;
    }

    toLocalPoint() {
        let m = CoordProjection.lngLatToMercator(this.lng, this.lat);
        return new local_point(m.x, m.y, this.floor);
    }
}

export {local_point, lnglat_point}
