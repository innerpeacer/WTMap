import {local_point} from "./local_point";

class map_extent {
    constructor(xmin, ymin, xmax, ymax) {
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    getSw() {
        return new local_point(this.xmin, this.ymin);
    }

    getNe() {
        return new local_point(this.xmax, this.ymax);
    }

    getCenter() {
        return new local_point((this.xmin + this.xmax) * 0.5, (this.ymin + this.ymax) * 0.5);
    }

    _getLngLatBounds() {
        let min = this.getSw().getLngLat();
        let max = this.getNe().getLngLat();
        return [[min.lng, min.lat], [max.lng, max.lat]];
    }

    _getExtendedBounds(scale) {
        if (scale == null) return this._getLngLatBounds();

        let extentedWidth = (this.xmax - this.xmin) * scale;
        let extentedHeight = (this.ymax - this.ymin) * scale;
        let min = new local_point(this.xmin - extentedWidth, this.ymin - extentedHeight).getLngLat();
        let max = new local_point(this.xmax + extentedWidth, this.ymax + extentedHeight).getLngLat();
        return [[min.lng, min.lat], [max.lng, max.lat]];
    }
}

class map_size {
    constructor(x, y) {
        this.size_x = x;
        this.size_y = y;
    }

}

class mapinfo {
    constructor(obj) {
        this.mapSize = new map_size(obj.size_x, obj.size_y);
        this.mapExtent = new map_extent(obj.xmin, obj.ymin, obj.xmax, obj.ymax);
        this.floorName = obj.floorName;
        this.floorNumber = obj.floorIndex || obj.floorNumber;
        this.mapID = obj.mapID;
        this.buildingID = obj.buildingID;
        this.cityID = obj.cityID;
    }

    getCenter() {
        return this.mapExtent.getCenter();
    }

    getLngLatBounds() {
        return this.mapExtent._getLngLatBounds();
    }

    getExtendedBounds(scale) {
        return this.mapExtent._getExtendedBounds(scale);
    }

    getExtendedBounds2(scale) {
        let bounds = this.getExtendedBounds(scale);
        return [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
    }

    toString() {
        return `Floor: ${this.floorName}(${this.mapID})`;
    }
}

mapinfo.getMapInfoArray = function (array) {
    let result = [];
    for (let i = 0; i < array.length; ++i) {
        let info = new mapinfo(array[i]);
        result.push(info);
    }
    return result;
};

export {mapinfo}
