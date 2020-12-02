import {
    local_point as LocalPoint,
    mapinfo as MapInfo,
    http_request as HttpRequest,
    coord_projection as CoordProjection,
    IPTurf as Turf,
    utils as Utils,
    geojson_utils as GeojsonUtils,
    Navigation,
    SimulatedNavigation,
    NavigationEvent, NavigationHintType,
    Directions,
    WebSocketManager
} from '../../dependencies.js';
import {version} from '../version.js';
import {IPMap as WTMap} from '../map/map';
import {debug_options} from './debug_options';
import {ip_tile_coord as TileCoord} from '../utils/ip_tile_coord';
import {ip_agent_utils as AgentUtil} from '../utils/ip_agent_utils';
import {web_gps_updater, GpsEvent} from '../locator/web_gps_updater';
import {custom_point_label_layer as CustomPointLabelLayer} from '../layers/custom/custom_point_label_layer';
import {custom_segment_line_layer as CustomSegmentLineLayer} from '../layers/custom/custom_segment_line_layer';
import {custom_trace_layer as CustomTraceLayer} from '../layers/custom/custom_trace_layer';

export {
    version,
    WTMap,
    debug_options as DebugOptions,
    Navigation,
    SimulatedNavigation,
    NavigationEvent,
    NavigationHintType,
    Directions,
    WebSocketManager,
    CoordProjection,
    Turf,
    MapInfo,
    LocalPoint,
    TileCoord,
    AgentUtil,
    web_gps_updater,
    GpsEvent,
    CustomPointLabelLayer,
    CustomSegmentLineLayer,
    CustomTraceLayer,
    HttpRequest,
    Utils,
    GeojsonUtils
};
