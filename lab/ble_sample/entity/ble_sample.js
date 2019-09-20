import Pbf from 'pbf';
import WTBleSamplePbf from '../js-lite/w_t_ble_sample_pbf';
import {simulation_data as SimulationData, SimulationDataType as DataType} from "../../simulator/simulation_entity";

class ble_sample {
    constructor() {
        this.timestamp = null;
        this.sampleID = null;
        this.buildingID = null;

        this.location = null;
        this.gpsList = [];
        this.bleList = [];
        this.platform = null;
        this.user = null;
    }

    _copyFrom(obj) {
        this.timestamp = obj.timestamp;
        this.sampleID = obj.sampleID;
        this.buildingID = obj.buildingID;

        this.location = obj.location;
        this.gpsList = obj.gpsList;
        this.bleList = obj.bleList;
        this.platform = obj.platform;
        this.user = obj.user;
    }

    toPbf() {
        let pbf = new Pbf();
        WTBleSamplePbf.BleSamplePbf.write(this, pbf);
        return pbf;
    }

    fromPbf(bytes) {
        let pbf = new Pbf(bytes);
        let data = WTBleSamplePbf.BleSamplePbf.read(pbf);
        this._copyFrom(data);
        return this;
    }

    toSimulatingData() {
        // console.log("toSimulatingData");
        let dataArray = [];
        let gpsList = this.gpsList;
        for (let i = 0; i < gpsList.length; ++i) {
            let gps = gpsList[i];
            gps.index = i;
            dataArray.push(new SimulationData({timestamp: gps.timestamp, dataType: DataType.Gps, value: gps}));
        }

        let bleList = this.bleList;
        for (let i = 0; i < bleList.length; ++i) {
            let ble = bleList[i];
            ble.index = i;
            dataArray.push(new SimulationData({timestamp: ble.timestamp, dataType: DataType.Ble, value: ble}));
        }
        return dataArray;
    }
}

export {ble_sample}
