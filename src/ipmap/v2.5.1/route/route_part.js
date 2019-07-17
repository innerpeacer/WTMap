import ipTurf from '../utils/ip_turf'

class route_part {
    constructor(route, info, nodes) {
        this.route = route;
        // Special Treatment for single coordinate route part. (Such as starting from a Elevator to another floor)
        this._isSinglePointLine = false;
        if (this.route.length == 1) {
            this.route = [this.route[0], this.route[0]];
            this._isSinglePointLine = true;
        }

        if (this.route.length == 2) {
            if (this.route[0][0] == this.route[1][0] && this.route[0][1] == this.route[1][1]) {
                this._isSinglePointLine = true;
            }
        }
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

export default route_part
