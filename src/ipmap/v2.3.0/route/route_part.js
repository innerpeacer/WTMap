import ipTurf from "../utils/ip_turf"

class route_part {
    constructor(route, info, nodes) {
        this.route = route;
        this.mapInfo = info;
        this.nodes = nodes;

        this.partIndex = null;
        this.previousPart = null;
        this.nextPart = null;
    }

    isFirstPart() {
        return (this.previousPart == null);
    }

    isLastPart() {
        return (this.nextPart == null);
    }


    isMiddlePart() {
        return (this.previousPart != null) && (this.nextPart != null);
    }

    getFirstPoint() {
        var point = null;
        if (this.route != null) {
            point = this.route[0];
        }
        return point;
    }

    getLastPoint() {
        var point = null;
        if (this.route != null) {
            point = this.route[this.route.length - 1];
        }
        return point;
    }

    getGeometry() {
        if (this._geometry == null) {
            this._geometry = ipTurf.lineString(this.route, {floor: this.mapInfo.floorNumber});
        }
        return this._geometry;
    }
}

// module.exports = route_part;
export default route_part