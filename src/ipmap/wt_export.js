// @flow
import {wtVersion} from './wt_version.js';
import * as v261 from './v2.6.1/config/output.js';

let wtExported: Object = {};

if (wtVersion === v261.version) {
    wtExported = v261;
}

export {wtExported};
