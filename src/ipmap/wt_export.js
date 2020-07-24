import {wtVersion} from "./wt_version.js";
import * as v260 from "./v2.6.0/config/output.js";

let wtExported = {};

if (wtVersion === v260.version) {
    wtExported = v260;
}

export {wtExported};