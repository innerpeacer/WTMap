import TYMotionParser from './sensor/motion/pbf-parse/t_y_motion_parser';
import {w_t_ble_sample_parser as WTBleSampleParser} from "./ble_sample/pbf-parse/w_t_ble_sample_parser";

import {simulator as Simulator} from "./simulator/simulator";
import {
    SimulationDataType,
    simulation_interval as SimulationInterval,
    simulation_data as SimulationData
} from "./simulator/simulation_entity";

let lab = {};
lab.TYMotionParser = TYMotionParser;
lab.WTBleSampleParser = WTBleSampleParser;

lab.Simulator = Simulator;
lab.SimulationData = SimulationData;
lab.SimulationDataType = SimulationDataType;
lab.SimulationInterval = SimulationInterval;

export default lab;
