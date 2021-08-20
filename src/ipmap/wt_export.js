// @flow
import {wtVersion} from './wt_version.js';
import * as v261 from './2.x/config/output.js';

let wtExported: Object = {};

if (wtVersion === v261.version) {
    wtExported = v261;
}

export {wtExported};
