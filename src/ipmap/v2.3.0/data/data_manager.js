// let TYHttpRequest = require("../utils/http_request");
// let config = require("../config/config");
// let root = config.root;
// let evented = require("../utils/brt_evented");
// let TYPoiParser = require("../pbf-parse/t_y_poi_parser");

import {Evented} from "../utils/ip_evented"
import IPHttpRequest from "../utils/http_request"

let getCBMJson = function (bID, options) {
    if (options._useFile) {
        // return `${options._apiHost}/${options._resourceRootDir}/mapdata/cbm/${bID}.json`;
        // return `${options._apiHost}/${options._dataRootDir}/cbm/${bID}.json`;
        if (options.__ignoreToken) {
            return `${options._apiHost}/${options._resourceRootDir}/mapdata/cbm/${bID}.json`;
        }
        return `${options._cbmPath}?buildingID=${bID}&token=${options.token}`;
    } else {
        return `${options._apiHost}/${options._apiPath}/web/GetCBM?buildingID=${bID}`;
    }
};

// let getPoiPbf = function (bID, options) {
//     return `${options._apiHost}/${options._vectorTileDir}/poi/${bID}_POI.pbf`;
// };

let getTilePbf = function (bID, options) {
    // return [`${options._apiHost}/${options._vectorTileDir}/${bID}/{z}/{x}/{y}.pbf`];
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
        request.on("http-result", function (data) {
            // console.log(data);
            if (data.success) {
                that.fire("cbm-ready", data);
            } else {
                that.fire("cbm-error", data);
            }
        });

        request.on('http-error', function (error) {
            that.fire("cbm-error", error);
        });
    }

    // getPoi() {
    //     let that = this;
    //     let httpRequest = new XMLHttpRequest();
    //     httpRequest.open("GET", getPoiPbf(this.buildingID, this._options), true);
    //     httpRequest.responseType = "arraybuffer";
    //
    //     httpRequest.onreadystatechange = function () {
    //         if (this.readyState == 4) {
    //             if (this.status == 200) {
    //                 var byteArray = new Uint8Array(httpRequest.response);
    //                 let parse = new TYPoiParser(byteArray);
    //                 let pois = parse.getPois();
    //
    //                 // let geojson = parse.getGeoJson();
    //                 // that.fire("mapdata-ready", {mapInfo: mapInfo, mapData: geojson});
    //             } else {
    //                 // that.fire("mapdata-error", {status: httpRequest.status, statusText: httpRequest.statusText});
    //             }
    //         }
    //     };
    //     httpRequest.send();
    // }

    toString() {
        return `DataManager(${this.buildingID})`;
    };
}

// module.exports = data_manager;
export default data_manager;