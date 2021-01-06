// @flow
import {IPMap} from '../../map/map';

class unit_functional_layer {
    name: string;
    sourceID: string;
    layerID: string;
    layer: Object;

    constructor(options: Object) {
        this.name = options.name;
        this.sourceID = options.sourceID;
        this.layerID = '';
        this.layer = {};
    }

    setLayoutProperty(prop: string, value: any): unit_functional_layer {
        this.layer.layout[prop] = value;
        return this;
    }

    setLayoutProperties(props: {[string]: any}): unit_functional_layer {
        for (let propName in props) {
            this.layer.layout[propName] = props[propName];
        }
        return this;
    }

    setPaintProperty(prop: string, value: any): unit_functional_layer {
        this.layer.paint[prop] = value;
        return this;
    }

    setPaintProperties(props: {[string]: any}): unit_functional_layer {
        for (let propName in props) {
            this.layer.paint[propName] = props[propName];
        }
        return this;
    }

    show(map: IPMap) {
        map.setLayoutProperty(this.layerID, 'visibility', 'visible');
    }

    hide(map: IPMap) {
        map.setLayoutProperty(this.layerID, 'visibility', 'none');
    }

    createDefaultFilter(floor: number): any {
        return ['all', ['==', 'floor', floor]];
    }
}

export {unit_functional_layer};
