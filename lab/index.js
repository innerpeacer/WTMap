import TYMotionParser from './sensor/motion/pbf-parse/t_y_motion_parser';
import {ble_sample as BleSample} from "./ble_sample/entity/ble_sample";

import {simulator as Simulator} from "./simulator/simulator";
import {
    SimulationDataType,
    simulation_interval as SimulationInterval,
    simulation_data as SimulationData
} from "./simulator/simulation_entity";

let lab = {};
lab.TYMotionParser = TYMotionParser;
lab.BleSample = BleSample;

lab.Simulator = Simulator;
lab.SimulationData = SimulationData;
lab.SimulationDataType = SimulationDataType;
lab.SimulationInterval = SimulationInterval;

export default lab;
