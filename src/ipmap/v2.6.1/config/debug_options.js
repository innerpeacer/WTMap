import {HostUtils} from '../../dependencies.js';

let debugHostUtils = new HostUtils('localhost:8112', 'http:');

const debug_options = {
    _apiHost: debugHostUtils.getHttpHost(),
    _apiRouteHost: debugHostUtils.getHttpHost(),
    _apiPath: 'WTMapService',
    _apiRoute: 'WTRouteService',
    _resourceRootDir: 'WTMapResource',
    beaconUrl: debugHostUtils.getHttpHost() + '/WTMapService/web/pbf/getBeacon',
    spriteName: 'WTMapSprite'
};

export {debug_options};
