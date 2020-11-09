function Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector2.prototype = Object.assign(Vector2.prototype, {
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    multiplyScale(scale) {
        this.x *= scale;
        this.y *= scale;
        return this;
    },

    scaleLength(length) {
        return this.normalize().multiplyScale(length);
    },

    normalize() {
        let length = this.length();
        if (length === 0) return new Vector2();
        return new Vector2(this.x / length, this.y / length);
    },

    getAngle() {
        return Math.atan2(this.x, this.y) * 180 / Math.PI;
    }
});

// console.log(new Vector2(0, 1).getAngle());
// console.log(new Vector2(1, 1).getAngle());
// console.log(new Vector2(1, 0).getAngle());
// console.log(new Vector2(0, -1).getAngle());
// console.log(new Vector2(-1, 0).getAngle());

const ProcessParams = {
    speed: 1,
    MaxTimeInterval: 10
}


function calculateModifiedLocation(lastModified, currentOriginal) {
    let deltaTime = Math.abs(currentOriginal.timestamp - lastModified.timestamp);
    deltaTime = deltaTime < 3 ? 3 : deltaTime;
    // console.log('delta: ', deltaTime);
    let limitedRange = deltaTime * ProcessParams.speed;
    let vec = new Vector2(currentOriginal.x - lastModified.x, currentOriginal.y - lastModified.y);
    let vecLength = vec.length();
    if (vecLength < limitedRange) {
        return currentOriginal;
    }
    let limitedVec = vec.scaleLength(limitedRange);
    let modified = new wtmap.LocalPoint(lastModified.x + limitedVec.x, lastModified.y + limitedVec.y, currentOriginal.floor);
    modified.angle = vec.getAngle();
    return modified;
}
