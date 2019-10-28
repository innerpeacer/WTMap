import {Evented} from '../utils/ip_evented'
import {http_request as IPHttpRequest} from "../utils/http_request";
import {t_y_cbm_parser as CBMParser} from '../pbf-parse/t_y_cbm_parser';


import InnerEventManager from "../utils/inner_event_manager"

let InnerDataEvent = InnerEventManager.DataEvent;
let HttpEvent = InnerEventManager.HttpEvent;

let getCBMJson = function (bID, options) {
    if (options._useFile) {
        return `${options._apiHost}/${options._dataRootDir}/cbm/${bID}.json` + "?t=" + Date.now();
    } else {
        return `${options._apiHost}/${options._apiPath}/web/GetCBM?buildingID=${bID}`;
    }
};

let getCBMPbf = function (bID, options) {
    return `${options._apiHost}/${options._dataRootDir}/cbm/${bID}.pbf` + "?t=" + Date.now();
};

let getTilePbf = function (bID, options) {
    return [`${options._apiHost}/${options._dataRootDir}/vectortile/${bID}/{z}/{x}/{y}.pbf`];
};

class data_manager extends Evented {
    constructor(bID, options) {
        super();
        this.buildingID = bID;
        this._options = options;
    }

    getTilePath() {
        return getTilePbf(this.buildingID, this._options);
    }

    getCBM() {
        let request = new IPHttpRequest();
        let that = this;

        request.request(getCBMJson(this.buildingID, this._options));
        request.on(HttpEvent.HttpResult, function (data) {
            if (data.success) {
                that.fire(InnerDataEvent.CBMReady, data);
            } else {
                that.fire(InnerDataEvent.CBMError, data);
            }
        });

        request.on(HttpEvent.HttpError, function (error) {
            that.fire(InnerDataEvent.CBMError, error);
        });
    }

    getCBMPbf() {
        let request = new IPHttpRequest();
        let that = this;

        request.requestBlob(getCBMPbf(this.buildingID, this._options));
        request.on(HttpEvent.HttpResult, function (data) {
            let byteArray = new Uint8Array(data.bytes);
            let parser = new CBMParser(byteArray);
            that.fire(InnerDataEvent.CBMReady, parser.getData());
        });

        request.on(HttpEvent.HttpError, function (error) {
            that.fire(InnerDataEvent.CBMError, error);
        });
    }

    // getPoi() {
    //     let that = this;
    //     let httpRequest = new XMLHttpRequest();
    //     httpRequest.open('GET', getPoiPbf(this.buildingID, this._options), true);
    //     httpRequest.responseType = 'arraybuffer';
    //
    //     httpRequest.onreadystatechange = function () {
    //         if (this.readyState == 4) {
    //             if (this.status == 200) {
    //                 var byteArray = new Uint8Array(httpRequest.response);
    //                 let parse = new TYPoiParser(byteArray);
    //                 let pois = parse.getPois();
    //
    //                 // let geojson = parse.getGeoJson();
    //                 // that.fire('mapdata-ready', {mapInfo: mapInfo, mapData: geojson});
    //             } else {
    //                 // that.fire('mapdata-error', {status: httpRequest.status, statusText: httpRequest.statusText});
    //             }
    //         }
    //     };
    //     httpRequest.send();
    // }

    toString() {
        return `DataManager(${this.buildingID})`;
    };
}

export default data_manager;
