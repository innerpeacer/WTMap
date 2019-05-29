import Beacon from "./beacon"
import {local_point as LocalPoint} from "../entity/local_point"

class locating_beacon extends Beacon {
    constructor(uuid, major, minor, x, y, flooor) {
        super(uuid, major, minor);
        this.location = new LocalPoint(x, y, flooor);
    }
}

export default locating_beacon;