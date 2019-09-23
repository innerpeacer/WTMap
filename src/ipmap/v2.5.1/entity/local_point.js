import {coord_projection as CoordProjection} from '../utils/coord_projection'

class local_point {
    constructor(x, y, f) {
        this.x = x;
        this.y = y;
        this.floor = f;
        if (!!this.x && !!this.y) {
            this._calculateLngLat();
        }
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


    _calculateLngLat() {
        let lngLat = CoordProjection.mercatorToLngLat(this.x, this.y);
        this.lng = lngLat.lng;
        this.lat = lngLat.lat;
    }

    _calculatreXY() {
        let m = CoordProjection.lngLatToMercator(this.lng, this.lat);
        this.x = m.x;
        this.y = m.y;
    }

    getXY() {
        return {x: this.x, y: this.y, floor: this.floor};
    }

    getLngLat() {
        return {lng: this.lng, lat: this.lat, floor: this.floor};
    }

    distanceTo(lp) {
        return Math.sqrt(Math.pow(this.x - lp.x, 2) + Math.pow(this.y - lp.y, 2));
    }
}

local_point.fromXY = function (obj) {
    let lp = new local_point(obj.x, obj.y, obj.floor);
    lp._calculateLngLat();
    return lp;
};

local_point.fromLngLat = function (obj) {
    let lp = new local_point(null, null, obj.floor);
    lp.lng = obj.lng;
    lp.lat = obj.lat;
    lp._calculatreXY();
    return lp;
};

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

export {local_point}
