// @flow
import {extend} from '../../../dependencies';
import type {IPMap} from '../../map/map';

class unit_base_layer {
    buildingID: string;
    baseZoom: number;
    use3D: boolean;

    sourceID: string;
    sourceLayer: Object;
    name: string;
    layerNumber: number;
    layerType: number;
    // todo
    symbol: Object;
    layerID: string;
    layer: Object;

    constructor(options: Object) {
        this.buildingID = options.buildingID;
        this.baseZoom = options.baseZoom;
        this.use3D = options.use3D;

        this.sourceID = options.sourceID;
        this.sourceLayer = options.sourceLayer;
        this.name = options.name;
        this.layerNumber = options.layerNumber;
        this.layerType = options.layerType;
        this.symbol = options.symbol;

        this.layerID = `${this.name}-${this.layerType}-${this.symbol.UID}`;
        let layer = this.layer = extend({
            'id': this.layerID,
            'symbolID': this.symbol.symbolID,
            'source': this.sourceID,
            'type': this.layerType,
            'source-layer': this.sourceLayer
        });

        let levelMin = this.symbol.levelMin;
        if (levelMin && levelMin != 0) {
            layer.minzoom = this.baseZoom + levelMin;
        }

        let levelMax = this.symbol.levelMax;
        if (levelMax && levelMax != 0) {
            layer.maxzoom = this.baseZoom + levelMax;
        }
    }

    setLayoutProperty(prop: string, value: any): unit_base_layer {
        this.layer.layout[prop] = value;
        return this;
    }

    setLayoutProperties(props: {[string]: any}): unit_base_layer {
        for (let propName in props) {
            this.layer.layout[propName] = props[propName];
        }
        return this;
    }

    setPaintProperty(prop: string, value: any): unit_base_layer {
        this.layer.paint[prop] = value;
        return this;
    }

    setPaintProperties(props: {[string]: any}): unit_base_layer {
        for (let propName in props) {
            this.layer.paint[propName] = props[propName];
        }
        return this;
    }

    _switch3D(map: IPMap, use3D: boolean) {

    }

    setFont(map: IPMap, fontName: string) {

    }

    switchLanguage(map: IPMap, options: Object) {

    }

    show(map: IPMap) {
        map.setLayoutProperty(this.layerID, 'visibility', 'visible');
    }

    hide(map: IPMap) {
        map.setLayoutProperty(this.layerID, 'visibility', 'none');
    }

    // Default to false, needs to be override by sub-classes
    createDefaultFilter(floor: number): any {
        return false;
    }
}

export {unit_base_layer};
