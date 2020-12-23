import {LayerParams, DefaultVectorSourceID} from '../layer_constants';
import {unit_fill_layer} from '../base/unit_fill_layer';
import {unit_outline_layer} from '../base/unit_outline_layer';
import {unit_symbol_layer} from '../base/unit_symbol_layer';
import {unit_extrusion_layer} from '../base/unit_extrusion_layer';
import {base_layers} from './base_layers';

class layer_manager {
    constructor(symbolMap, theme, options) {
        console.log('layer_manager.constructor');
        this.map = options.map;
        this.use3D = options.use3D;
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
        this.buildBaseLayers();
    }

    buildBaseLayers() {
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
        // let floorParams = LayerParams.Floor;
        // this.floorLayer = new fill_layers(floorParams, this.symbolMap[floorParams.name], this.fillSymbolMap, options);
        //
        // let roomParams = LayerParams.Room;
        // this.roomLayer = new fill_layers(roomParams, this.symbolMap[roomParams.name], this.fillSymbolMap, options);
        //
        // let assetParams = LayerParams.Asset;
        // this.assetLayer = new fill_layers(assetParams, this.symbolMap[assetParams.name], this.fillSymbolMap, options);
        //
        // let extrusionParams = LayerParams.Extrusion;
        // this.extrusionLayer = new extrusion_layers(extrusionParams, this.symbolMap[extrusionParams.name], this.fillSymbolMap, options);
        //
        // let facilityParams = LayerParams.Facility;
        // this.facilityLayer = new symbol_layers(facilityParams, this.symbolMap[facilityParams.name], this.iconTextMap, options);
        //
        // let labelParams = LayerParams.Label;
        // this.labelLayer = new symbol_layers(labelParams, this.symbolMap[labelParams.name], this.iconTextMap, options);

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

        this._baseLayerArray = [this.floorLayer, this.roomLayer, this.assetLayer, this.extrusionLayer, this.facilityLayer, this.labelLayer];
        this._3dLayerArray = [this.extrusionLayer, this.facilityLayer, this.labelLayer];
        this._labelIconLayerArray = [this.facilityLayer, this.labelLayer];

        this.backgroundLayer = {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': 'white'
            }
        };
        this.layers = [].concat(this.floorLayer.unitLayers, this.roomLayer.unitLayers, this.assetLayer.unitLayers, this.extrusionLayer.unitLayers, this.facilityLayer.unitLayers, this.labelLayer.unitLayers);
        console.log(this.layers);
    }

    setMapInfo(info) {
        this._baseLayerArray.forEach((baseLayer) => {
            baseLayer.setMapInfo(this.map, info.floorNumber);
        });
    }

    prepareStyleSources() {
        return this.sources;
    }

    prepareStyleLayers() {
        let layers = [this.backgroundLayer];
        this.layers.forEach((unitLayer) => {
            layers.push(unitLayer.layer);
        });
        return layers;
    }

    _switch3D(use3D) {
        this._3dLayerArray.forEach((baseLayer) => {
            baseLayer._switch3D(this.map, use3D);
        });
    }

    showLayers() {
        this._baseLayerArray.forEach((baseLayer) => {
            baseLayer.show(this.map);
        });
    }

    hideLayers() {
        this._baseLayerArray.forEach((baseLayer) => {
            baseLayer.hide(this.map);
        });
    }

    setFont(fontName) {
        this._labelIconLayerArray.forEach((baseLayer) => {
            baseLayer.setFont(this.map, fontName);
        });
    }

    switchLanguage(options) {
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

    getLayerIDs(subLayer) {
        if (subLayer === LayerParams.Floor.name) return this.floorLayer._getLayerIDList();
        if (subLayer === LayerParams.Room.name) return this.roomLayer._getLayerIDList();
        if (subLayer === LayerParams.Asset.name) return this.assetLayer._getLayerIDList();
        if (subLayer === LayerParams.Facility.name) return this.facilityLayer._getLayerIDList();
        if (subLayer === LayerParams.Label.name) return this.labelLayer._getLayerIDList();
        if (subLayer === LayerParams.Extrusion.name) return this.extrusionLayer._getLayerIDList();
    }
}

export {layer_manager};
