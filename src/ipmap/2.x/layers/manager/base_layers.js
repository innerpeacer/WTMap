// @flow
import {DefaultVectorSourceID, LayerParams} from '../layer_constants';
import {unit_base_layer} from '../base/unit_base_layer';
import type {IPMap} from '../../map/map';

class base_layers {
    name: string;
    params: Object;
    layerClasses: Object;
    uIDList: Array<number>;
    // todo
    symbolMap: Object;
    options: Object;

    unitLayers: Array<unit_base_layer>;
    styleLayers: Array<Object>;

    constructor(layerParams: Object, layerClasses: Object, uIDList: Array<number>, symbolMap: Object, options: Object) {
        this.name = layerParams.name;
        this.params = layerParams;
        this.layerClasses = layerClasses;
        this.uIDList = uIDList;
        this.symbolMap = symbolMap;
        this.options = options;

        this._prepareLayers();
    }

    _prepareLayers() {
        this.unitLayers = [];
        this.styleLayers = [];

        let params = this.params;
        for (let i = 0; i < this.uIDList.length; ++i) {
            let uid = this.uIDList[i];
            let symbol = this.symbolMap.get(uid);
            if (!symbol || (!symbol.visible && !symbol.iconVisible && !symbol.textVisible)) {
                continue;
            }
            let options = {
                buildingID: this.options.buildingID,
                baseZoom: this.options.baseZoom,
                use3D: this.options.use3D,
                sourceID: DefaultVectorSourceID,
                sourceLayer: params.sourceLayer,
                name: params.name,
                layerType: params.layerType,
                layerNumber: params.layerNumber,
                symbol: symbol
            };

            this.layerClasses.forEach((layerClass) => {
                let unitLayer = new layerClass(options);
                this.unitLayers.push(unitLayer);
                this.styleLayers.push(unitLayer.layer);
            });
        }

        if (this.name === LayerParams.Facility.name || this.name === LayerParams.Label.name) {
            this._sortByPriority();
        }
    }

    _sortByPriority() {
        let unitLayers = this.unitLayers;

        let unPrioritized = [];
        let prioritized = [];
        for (let i = 0; i < unitLayers.length; ++i) {
            let layer = unitLayers[i];
            if (layer.symbol.priority === 0) {
                unPrioritized.push(layer);
            } else {
                prioritized.push(layer);
            }
        }
        prioritized.sort(function(layer1, layer2) {
            return layer2.symbol.priority - layer1.symbol.priority;
        });

        this.unitLayers = unPrioritized.concat(prioritized);

        this.styleLayers = [];
        this.unitLayers.forEach((unitLayer) => {
            this.styleLayers.push(unitLayer.layer);
        });
    }

    setMapInfo(map: IPMap, floor: number) {
        this.unitLayers.forEach((unitLayer) => {
            map.setFilter(unitLayer.layerID, unitLayer.createDefaultFilter(floor));
        });
    }

    _switch3D(map: IPMap, use3D: boolean) {
        if (this.name === LayerParams.Extrusion.name || this.name === LayerParams.Facility.name || this.name === LayerParams.Label.name) {
            this.unitLayers.forEach((unitLayer) => {
                unitLayer._switch3D(map, use3D);
            });
        }
    }

    switchLanguage(map: IPMap, options: Object) {
        if (this.name === LayerParams.Facility.name || this.name === LayerParams.Label.name) {
            this.unitLayers.forEach((unitLayer) => {
                unitLayer.switchLanguage(map, options);
            });
        }
    }

    setFont(map: IPMap, fontName: string) {
        if (this.name === LayerParams.Facility.name || this.name === LayerParams.Label.name) {
            this.unitLayers.forEach((unitLayer) => {
                unitLayer.setFont(map, fontName);
            });
        }
    }

    show(map: IPMap) {
        this.unitLayers.forEach((unitLayer) => {
            unitLayer.show(map);
        });
    }

    hide(map: IPMap) {
        this.unitLayers.forEach((unitLayer) => {
            unitLayer.hide(map);
        });
    }

    _getLayerIDList(): Array<string> {
        let layerIDList = [];
        this.unitLayers.forEach((unitLayer) => {
            layerIDList.push(unitLayer.layerID);
        });
        return layerIDList;
    }
}

export {base_layers};
