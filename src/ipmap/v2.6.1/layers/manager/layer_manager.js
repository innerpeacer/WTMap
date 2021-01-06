// @flow
import {
    mapinfo as MapInfo,
    theme as Theme,
    local_point as LocalPoint,
    MultiStopRouteResult as MultiRouteResult,
    geojson_utils as GeojsonUtils
} from '../../../dependencies';
import {LayerParams, DefaultVectorSourceID} from '../layer_constants';
import {unit_fill_layer} from '../base/unit_fill_layer';
import {unit_outline_layer} from '../base/unit_outline_layer';
import {unit_symbol_layer} from '../base/unit_symbol_layer';
import {unit_extrusion_layer} from '../base/unit_extrusion_layer';
import {base_layers} from './base_layers';
import {location_layers} from './location_layers';
import {debug_beacon_layers} from './debug_beacon_layers';
import {route_layers} from './route_layers';
import {IPMap} from '../../map/map';
import {unit_base_layer} from '../base/unit_base_layer';
import {unit_functional_layer} from '../functional/unit_functional_layer';
import {locator as Locator} from '../../locator/locator';

type   BaseLayerType = base_layers | route_layers | debug_beacon_layers | location_layers

class layer_manager {
    map: IPMap;
    use3D: boolean;
    debugBeacon: boolean;
    options: Object;
    symbolMap: Object;
    theme: Theme;

    fillSymbolMap: Object;
    iconTextMap: Object;

    sources: {[string]: Object};
    layers: Array<unit_base_layer | unit_functional_layer>;

    floorLayer: base_layers;
    roomLayer: base_layers;
    assetLayer: base_layers;
    extrusionLayer: base_layers;
    facilityLayer: base_layers;
    labelLayer: base_layers;

    routeLayer: route_layers;
    debugBeaconLayer: debug_beacon_layers;
    locationLayer: location_layers;


    _baseLayerArray: Array<BaseLayerType>;
    _3dLayerArray: Array<base_layers>;
    _labelIconLayerArray: Array<base_layers>;

    backgroundLayer: Object;

    constructor(symbolMap: Object, theme: Theme, options: Object) {
        // console.log('layer_manager.constructor');
        this.map = options.map;
        this.use3D = options.use3D;
        this.debugBeacon = options._debugBeacon;
        this.options = options;
        this.symbolMap = symbolMap;
        this.theme = theme;

        let fillMap = this.fillSymbolMap = new Map();
        theme.FillSymbols.forEach((fill) => {
            fillMap.set(fill.UID, fill);
        });
        let iconTextMap = this.iconTextMap = new Map();
        theme.IconTextSymbols.forEach((iconText) => {
            iconTextMap.set(iconText.UID, iconText);
        });

        this.sources = {};
        this.layers = [];
        this.build();
    }

    build() {
        let options = {
            buildingID: this.options.buildingID,
            baseZoom: this.options.baseZoom,
            use3D: this.options.use3D
        };

        this.sources[DefaultVectorSourceID] = {
            'tiles': this.options.tilePath,
            'type': 'vector',
            'bounds': this.options.initBounds
        };

        let floorParams = LayerParams.Floor;
        this.floorLayer = new base_layers(floorParams, [unit_fill_layer, unit_outline_layer], this.symbolMap[floorParams.name], this.fillSymbolMap, options);

        let roomParams = LayerParams.Room;
        this.roomLayer = new base_layers(roomParams, [unit_fill_layer, unit_outline_layer], this.symbolMap[roomParams.name], this.fillSymbolMap, options);

        let assetParams = LayerParams.Asset;
        this.assetLayer = new base_layers(assetParams, [unit_fill_layer, unit_outline_layer], this.symbolMap[assetParams.name], this.fillSymbolMap, options);

        let extrusionParams = LayerParams.Extrusion;
        this.extrusionLayer = new base_layers(extrusionParams, [unit_extrusion_layer], this.symbolMap[extrusionParams.name], this.fillSymbolMap, options);

        let facilityParams = LayerParams.Facility;
        this.facilityLayer = new base_layers(facilityParams, [unit_symbol_layer], this.symbolMap[facilityParams.name], this.iconTextMap, options);

        let labelParams = LayerParams.Label;
        this.labelLayer = new base_layers(labelParams, [unit_symbol_layer], this.symbolMap[labelParams.name], this.iconTextMap, options);

        this.routeLayer = new route_layers();
        this.debugBeaconLayer = new debug_beacon_layers();
        this.locationLayer = new location_layers();

        this._addSources(this.routeLayer.getSourceIDs());
        this._addSources(this.locationLayer.getSourceIDs());
        this._addSources(this.debugBeaconLayer.getSourceIDs());

        this._baseLayerArray = [this.floorLayer, this.roomLayer, this.assetLayer, this.routeLayer, this.extrusionLayer, this.facilityLayer, this.labelLayer, this.debugBeaconLayer, this.locationLayer];
        this._3dLayerArray = [this.extrusionLayer, this.facilityLayer, this.labelLayer];
        this._labelIconLayerArray = [this.facilityLayer, this.labelLayer];

        this.backgroundLayer = {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': 'white'
            }
        };
        this.layers = [].concat(this.floorLayer.unitLayers, this.roomLayer.unitLayers, this.assetLayer.unitLayers, this.extrusionLayer.unitLayers, this.facilityLayer.unitLayers, this.labelLayer.unitLayers, this.debugBeaconLayer.unitLayers, this.locationLayer.unitLayers, this.routeLayer.unitLayers);
    }

    setMapInfo(info: MapInfo) {
        this._baseLayerArray.forEach((baseLayer) => {
            baseLayer.setMapInfo(this.map, info.floorNumber);
        });
    }

    showDebugBeacons(locator: Locator) {
        if (locator && locator._isBleReady()) {
            this.debugBeaconLayer.showDebugBeacons(this.map, locator._biteMe('_getLocatingBeaconGeojson'));
        }
    }

    showDebugSignals(data: Object) {
        this.debugBeaconLayer.showDebugSignals(this.map, data);
    }

    showLocation(location: Object) {
        this.locationLayer.showLocation(this.map, location);
    }

    showLocations(locations: Object) {
        this.locationLayer.showLocations(this.map, locations);
    }

    hideLocation() {
        this.locationLayer.hideLocation(this.map);
    }

    _addSources(sourceIDList: Array<string>) {
        sourceIDList.forEach((sourceID) => {
            this.sources[sourceID] = GeojsonUtils.emptySource;
        });
    }

    prepareStyleSources(): {[string]: Object} {
        return this.sources;
    }

    prepareStyleLayers(): Array<Object> {
        let layers = [this.backgroundLayer];
        this.layers.forEach((unitLayer) => {
            layers.push(unitLayer.layer);
        });
        return layers;
    }

    _switch3D(use3D: boolean) {
        this._3dLayerArray.forEach((baseLayer) => {
            baseLayer._switch3D(this.map, use3D);
        });
    }

    showLayers() {
        this._baseLayerArray.forEach((baseLayer: BaseLayerType) => {
            baseLayer.show(this.map);
        });
    }

    hideLayers() {
        this._baseLayerArray.forEach((baseLayer) => {
            baseLayer.hide(this.map);
        });
    }

    setFont(fontName: string) {
        this._labelIconLayerArray.forEach((baseLayer) => {
            baseLayer.setFont(this.map, fontName);
        });
    }

    switchLanguage(options: Object) {
        this._labelIconLayerArray.forEach((baseLayer) => {
            baseLayer.switchLanguage(this.map, options);
        });
    }

    _showLabels() {
        this._labelIconLayerArray.forEach((baseLayer) => {
            baseLayer.show(this.map);
        });
    }

    _hideLabels() {
        this._labelIconLayerArray.forEach((baseLayer) => {
            baseLayer.hide(this.map);
        });
    }

    showRoute(result: MultiRouteResult, location: LocalPoint, segment: number) {
        this.routeLayer.showRoute(this.map, result, location, segment);
    }

    hideRoute() {
        this.routeLayer.hideRoute(this.map);
    }

    _setRouteColor(color1: string, color2: string, color3: string) {
        this.routeLayer._setRouteColor(this.map, color1, color2, color3);
    }

    getLayerIDs(subLayer: string): ?Array<string> {
        if (subLayer === LayerParams.Floor.name) return this.floorLayer._getLayerIDList();
        if (subLayer === LayerParams.Room.name) return this.roomLayer._getLayerIDList();
        if (subLayer === LayerParams.Asset.name) return this.assetLayer._getLayerIDList();
        if (subLayer === LayerParams.Facility.name) return this.facilityLayer._getLayerIDList();
        if (subLayer === LayerParams.Label.name) return this.labelLayer._getLayerIDList();
        if (subLayer === LayerParams.Extrusion.name) return this.extrusionLayer._getLayerIDList();
    }
}

export {layer_manager};
