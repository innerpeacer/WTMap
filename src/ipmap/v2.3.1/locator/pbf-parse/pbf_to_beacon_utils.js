class pbf_to_beacon {
    constructor() {
    }

    pbfToBeacon(pbf, uuid) {
        let beacon = {};
        beacon["uuid"] = uuid;
        beacon["major"] = pbf.major;
        beacon["minor"] = pbf.minor;
        beacon["x"] = pbf.x;
        beacon["y"] = pbf.y;
        beacon["floor"] = pbf.floor;
        return beacon;
    }

}

export default pbf_to_beacon;