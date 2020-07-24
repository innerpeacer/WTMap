import {local_point as LocalPoint} from "../../dependencies.js";

class beacon {
    constructor(uuid, major, minor) {
        this.uuid = uuid.toUpperCase();
        this.major = major;
        this.minor = minor;
        this.key = this.major + '-' + this.minor;
    }
}

class locating_beacon extends beacon {
    constructor(uuid, major, minor, x, y, flooor) {
        super(uuid, major, minor);
        this.location = new LocalPoint(x, y, flooor);
    }
}

class scanned_beacon extends beacon {
    constructor(uuid, major, minor, rssi, accuracy) {
        super(uuid, major, minor);
        this.rssi = rssi;
        this.accuracy = accuracy;
    }
}

export {beacon, locating_beacon, scanned_beacon};
