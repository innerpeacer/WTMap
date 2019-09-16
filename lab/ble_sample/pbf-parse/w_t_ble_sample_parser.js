// import Pbf from 'pbf';
// import MotionPbf from '../js-lite/t_y_motion_pbf';
//
// class t_y_motion_parser {
//     constructor(bytes) {
//         let pbf = new Pbf(bytes);
//         this.data = MotionPbf.TYMotionCollectionPbf.read(pbf);
//     }
// }
//
// export default t_y_motion_parser;

import Pbf from 'pbf';
import WTBleSamplePbf from '../js-lite/w_t_ble_sample_pbf';

class w_t_ble_sample_parser {
    constructor(bytes) {
        let pbf = new Pbf(bytes);
        this.data = WTBleSamplePbf.BleSamplePbf.read(pbf);
        console.log(this.data);
    }
}

export {w_t_ble_sample_parser}
