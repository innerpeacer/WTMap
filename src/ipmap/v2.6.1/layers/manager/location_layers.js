import {geojson_utils as GeojsonUtils} from '../../../dependencies';
import {unit_location_layer} from '../functional/unit_location_layer';

class location_layers {
    constructor() {
        this.name = 'wt-location';
        this.locationSourceID = `${this.name}-source`;

        this.locationLayer = new unit_location_layer({
            name: this.name,
            sourceID: this.locationSourceID
        });

        this.sourceIDs = [this.locationSourceID];
        this.unitLayers = [this.locationLayer];
    }

    getSourceIDs() {
        return this.sourceIDs;
    }

    showLocation(map, location) {
        let data = GeojsonUtils.createPointFeatureCollection([location]);
        map.getSource(this.locationSourceID).setData(data);
    }

    showLocations(map, locations) {
        let data = GeojsonUtils.createPointFeatureCollection(locations);
        map.getSource(this.locationSourceID).setData(data);
    }

    hideLocation(map) {
        map.getSource(this.locationSourceID).setData(GeojsonUtils.emptyGeojson);
    }

    setMapInfo(map, floor) {
        this.unitLayers.forEach((unitLayer) => {
            map.setFilter(unitLayer.layerID, unitLayer.createDefaultFilter(floor));
        });
    }
}

export {location_layers};
