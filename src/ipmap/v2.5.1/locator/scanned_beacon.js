import Beacon from './beacon'

class scanned_beacon extends Beacon {
    constructor(uuid, major, minor, rssi, accuracy) {
        super(uuid, major, minor);
        this.rssi = rssi;
        this.accuracy = accuracy;
    }
}

export default scanned_beacon;
