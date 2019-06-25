import Pbf from "pbf";
import BeaconPbf from "../pbf/t_y_beacon_pbf";
let LocatingBeaconListPbf = BeaconPbf.TYLocatingBeaconListPbf;

import BeaconUtils from "./pbf_to_beacon_utils";
let bUtils = new BeaconUtils();

class t_y_beacon_parser {
    constructor(bytes) {
        this._beacons = [];
        let pbf = new Pbf(bytes);
        let data = LocatingBeaconListPbf.read(pbf);
        this._uuid = data.uuid;
        let beacons = data.beacons;
        for (let i = 0; i < beacons.length; ++i) {
            let locationBeaconPbf = beacons[i];
            let beacon = bUtils.pbfToBeacon(locationBeaconPbf, this._uuid);
            this._beacons.push(beacon);
        }
    }

    getBeaconList() {
        // console.log("getBeaconList");
        return this._beacons;
    }

    getUuid() {
        return this._uuid;
    }

}

export default t_y_beacon_parser;