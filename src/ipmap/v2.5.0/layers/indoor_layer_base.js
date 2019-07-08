class indoor_layer_base {
    constructor(map) {
        this.map = map;
        this.sourceID = 'innerpeacer';
        this.styleLayers = {};
        this.usePriority = false;
    }

    hide() {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, 'visibility', 'none');
        }
    }

    show() {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.setLayoutProperty(layerID, 'visibility', 'visible');
        }
    }

    _getLayerArray(styleLayers, usePriority) {
        let layers = [];
        for (let layerID in styleLayers) {
            layers.push(styleLayers[layerID]);
        }

        if (usePriority) {
            let unPrioritized = [];
            let prioritized = [];
            for (let i = 0; i < layers.length; ++i) {
                let layer = layers[i];
                if (layer.symbol.priority == 0) {
                    unPrioritized.push(layer);
                } else {
                    prioritized.push(layer);
                }
            }

            prioritized.sort(function (layer1, layer2) {
                return layer2.symbol.priority - layer1.symbol.priority;
            });

            let sorted = [];
            sorted = sorted.concat(unPrioritized);
            sorted = sorted.concat(prioritized);
            return sorted;
        } else {
            return layers;
        }
    }

    addToMap() {
        let layers = this._getLayerArray(this.styleLayers, this.usePriority);
        for (let layerID in layers) {
            this.map.addLayer(layers[layerID]);
        }
        return this;
    }

    removeFromMap() {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            this.map.removeLayer(layerID);
        }
    }

    _getLayerIDs() {
        return Object.keys(this.styleLayers);
    }
}

export default indoor_layer_base
