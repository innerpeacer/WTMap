import Pbf from 'pbf';
import WTBleSamplePbf from '../js-lite/w_t_ble_sample_pbf';
import {simulation_data as SimulationData, SimulationDataType as DataType} from "../../simulator/simulation_entity";

class w_t_ble_sample_parser {
    constructor(bytes) {
        let pbf = new Pbf(bytes);
        this.data = WTBleSamplePbf.BleSamplePbf.read(pbf);
    }

    toSimulatingData() {
        console.log("toSimulatingData");
        console.log(this.data);
        let dataArray = [];
        let gpsList = this.data.gpsList;
        for (let i = 0; i < gpsList.length; ++i) {
            let gps = gpsList[i];
            gps.index = i;
            dataArray.push(new SimulationData({timestamp: gps.timestamp, dataType: DataType.Gps, value: gps}));
        }

        let bleList = this.data.bleList;
        for (let i = 0; i < bleList.length; ++i) {
            let ble = bleList[i];
            ble.index = i;
            dataArray.push(new SimulationData({timestamp: ble.timestamp, dataType: DataType.Ble, value: ble}));
        }
        return dataArray;
    }
}

export {w_t_ble_sample_parser}
