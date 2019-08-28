class coord_transform {
    constructor(from, to) {
        // this._fromArray = from;
        // this._toArray = to;

        this._from1 = {x: from[0], y: from[1]};
        this._from2 = {x: from[2], y: from[3]};
        this._from3 = {x: from[4], y: from[5]};
        this._fromDelta12 = {x: this._from2.x - this._from1.x, y: this._from2.y - this._from1.y};
        this._fromDelta13 = {x: this._from3.x - this._from1.x, y: this._from3.y - this._from1.y};

        this._to1 = {x: to[0], y: to[1]};
        this._to2 = {x: to[2], y: to[3]};
        this._to3 = {x: to[4], y: to[5]};
        this._toDelta12 = {x: this._to2.x - this._to1.x, y: this._to2.y - this._to1.y};
        this._toDelta13 = {x: this._to3.x - this._to1.x, y: this._to3.y - this._to1.y};
    }

    tranformTo(from) {
        let fromDelta = this._getFromDelta(from);
        let lamda = (fromDelta.x * this._fromDelta13.y - fromDelta.y * this._fromDelta13.x) / (this._fromDelta12.x * this._fromDelta13.y - this._fromDelta12.y * this._fromDelta13.x);
        let miu = (fromDelta.x * this._fromDelta12.y - fromDelta.y * this._fromDelta12.x) / (this._fromDelta13.x * this._fromDelta12.y - this._fromDelta12.x * this._fromDelta13.y);
        return {
            x: this._from1.x + lamda * this._fromDelta12.x + miu * this._fromDelta13.x,
            y: this._from1.y + lamda * this._fromDelta12.y + miu * this._fromDelta13.y
        };
    }

    transformFrom(to) {
        let toDelta = this._getToDelta(to);
        let lamda = (toDelta.x * this._toDelta13.y - toDelta.y * this._toDelta13.x) / (this._toDelta12.x * this._toDelta13.y - this._toDelta12.y * this._toDelta13.x);
        let miu = (toDelta.x * this._toDelta12.y - toDelta.y * this._toDelta12.x) / (this._toDelta13.x * this._toDelta12.y - this._toDelta12.x * this._toDelta13.y);
        return {
            x: this._to1.x + lamda * this._toDelta12.x + miu * this._toDelta13.x,
            y: this._to1.y + lamda * this._toDelta12.y + miu * this._toDelta13.y
        };
    }

    _getFromDelta(from) {
        return {x: from.x - this._from1.x, y: from.y - this._from1.y};
    }

    _getToDelta(to) {
        return {x: to.x - this._to1.x, y: to.y - this._to1.y};
    }
}

export default coord_transform;
