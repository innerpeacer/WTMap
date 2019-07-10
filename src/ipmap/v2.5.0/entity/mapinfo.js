import CoordProjection from "../utils/coord_projection"

class map_extent {
    constructor(xmin, ymin, xmax, ymax) {
        this.xmin = xmin;
        this.ymin = ymin;
        this.xmax = xmax;
        this.ymax = ymax;
    }

    getCenter() {
        return {"x": (this.xmin + this.xmax) * 0.5, "y": (this.ymin + this.ymax) * 0.5};
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

    getBounds(scale) {
        if (scale == null) scale = 0;
        let extentedWidth = (this.mapExtent.xmax - this.mapExtent.xmin) * scale;
        let extentedHeight = (this.mapExtent.ymax - this.mapExtent.ymin) * scale;
        let min = CoordProjection.mercatorToLngLat(this.mapExtent.xmin - extentedWidth, this.mapExtent.ymin - extentedHeight);
        let max = CoordProjection.mercatorToLngLat(this.mapExtent.xmax + extentedWidth, this.mapExtent.ymax + extentedHeight);
        return [[min.lng, min.lat], [max.lng, max.lat]];
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

export default mapinfo
