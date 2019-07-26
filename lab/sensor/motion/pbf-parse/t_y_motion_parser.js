import Pbf from 'pbf';
import MotionPbf from '../js-lite/t_y_motion_pbf';

class t_y_motion_parser {
    constructor(bytes) {
        let pbf = new Pbf(bytes);
        this.data = MotionPbf.TYMotionCollectionPbf.read(pbf);
    }
}

export default t_y_motion_parser;
