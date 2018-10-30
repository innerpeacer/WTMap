class indoor_layer_base {
    constructor(map) {
        this.map = map;
        this.sourceID = 'innerpeacer';
        this.styleLayers = {};
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

    addToMap() {
        let layers = this.styleLayers;
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
}
// module.exports = indoor_layer_base;
export default indoor_layer_base