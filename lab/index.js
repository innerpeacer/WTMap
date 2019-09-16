import TYMotionParser from './sensor/motion/pbf-parse/t_y_motion_parser';
import {w_t_ble_sample_parser as WTBleSampleParser} from "./ble_sample/pbf-parse/w_t_ble_sample_parser";

let lab = {};
lab.TYMotionParser = TYMotionParser;
lab.WTBleSampleParser = WTBleSampleParser;

export default lab;
