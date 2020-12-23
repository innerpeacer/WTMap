import {extend} from '../../../dependencies';

class unit_base_layer {
    constructor(options) {
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

    setLayoutProperty(prop, value) {
        this.layer.layout[prop] = value;
        return this;
    }

    setLayoutProperties(props) {
        for (let propName in props) {
            this.layer.layout[propName] = props[propName];
        }
        return this;
    }

    setPaintProperty(prop, value) {
        this.layer.paint[prop] = value;
        return this;
    }

    setPaintProperties(props) {
        for (let propName in props) {
            this.layer.paint[propName] = props[propName];
        }
        return this;
    }

    _switch3D(map, use3D) {

    }

    setFont(map, fontName) {

    }

    switchLanguage(map, options) {
        
    }

    show(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'visible');
    }

    hide(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'none');
    }

    // Default to false, needs to be override by sub-classes
    createDefaultFilter(floor) {
        return false;
    }
}

export {unit_base_layer};
