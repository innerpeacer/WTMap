import Pbf from 'pbf';
import TYCBMPbf from '../pbf/t_y_cbm_pbf';

let CBMPbf = TYCBMPbf.CBMPbf;

class t_y_cbm_parser {
    constructor(bytes) {
        let pbf = new Pbf(bytes);
        let cbm = CBMPbf.read(pbf);

        let data = {};
        data.Cities = cbm.Cities;
        data.Buildings = cbm.Buildings;
        data.MapInfo = cbm.MapInfos;
        data.FillSymbols = cbm.FillSymbols;
        data.IconTextSymbols = cbm.IconTextSymbols;
        data.Symbols = cbm.Symbols;
        this.data = data;
    }

    getData() {
        return this.data;
    }
}

export {t_y_cbm_parser};
