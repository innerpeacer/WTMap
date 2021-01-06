// @flow
import {geojson_utils as GeojsonUtils} from '../../../dependencies';
import {unit_location_layer} from '../functional/unit_location_layer';
import {unit_functional_layer} from '../functional/unit_functional_layer';
import {IPMap} from '../../map/map';

class location_layers {
    name: string;
    locationSourceID: string;
    locationLayer: unit_functional_layer;

    sourceIDs: Array<string>;
    unitLayers: Array<unit_functional_layer>;

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

    getSourceIDs(): Array<string> {
        return this.sourceIDs;
    }

    showLocation(map: IPMap, location: Object) {
        let data = GeojsonUtils.createPointFeatureCollection([location]);
        map.getSource(this.locationSourceID).setData(data);
    }

    showLocations(map: IPMap, locations: Object) {
        let data = GeojsonUtils.createPointFeatureCollection(locations);
        map.getSource(this.locationSourceID).setData(data);
    }

    hideLocation(map: IPMap) {
        map.getSource(this.locationSourceID).setData(GeojsonUtils.emptyGeojson);
    }

    hide(map: IPMap) {

    }

    show(map: IPMap) {

    }

    setMapInfo(map: IPMap, floor: number) {
        this.unitLayers.forEach((unitLayer) => {
            map.setFilter(unitLayer.layerID, unitLayer.createDefaultFilter(floor));
        });
    }
}

export {location_layers};
