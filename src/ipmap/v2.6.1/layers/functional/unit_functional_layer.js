class unit_functional_layer {
    constructor(options) {
        this.name = options.name;
        this.sourceID = options.sourceID;
        this.layerID = '';
        this.layer = {};
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

    show(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'visible');
    }

    hide(map) {
        map.setLayoutProperty(this.layerID, 'visibility', 'none');
    }

    createDefaultFilter(floor) {
        return ['all', ['==', 'floor', floor]];
    }
}

export {unit_functional_layer};
