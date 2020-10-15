// 设备方向
function FacilityOrientation() {
    this.angle = 0;
    this.location = null;
    this.target = null;
}

FacilityOrientation.prototype = Object.assign(FacilityOrientation.prototype, {
    setLocation: function (loc) {
        this.location = loc;
        this.angle = this.calculateAngle();
    },

    setTarget: function (target) {
        this.target = target;
        this.angle = this.calculateAngle();
    },

    setAngle(angle) {
        this.angle = angle;
    },

    getAngle() {
        return this.angle;
    },

    calculateAngle: function () {
        if (this.location && this.target) {
            let angleRad = Math.atan2(this.target.x - this.location.x, this.target.y - this.location.y);
            let angle = parseFloat((angleRad * 180 / Math.PI).toFixed(1));
            return angle < 0 ? angle + 360 : angle;
        }
        return 0;
    },

    getGeojsonData: function () {
        let symbolData;
        if (this.location) {
            let startLngLat = wtmap.CoordProjection.mercatorToLngLat(this.location);
            startLngLat.properties = {floor: this.location.floor, angle: this.getAngle()};
            symbolData = wtmap.GeojsonUtils.createPointFeatureCollection([startLngLat]);
        } else {
            symbolData = wtmap.GeojsonUtils.createPointFeatureCollection([]);
        }

        let lineData;
        if (this.location && this.target) {
            let startLngLat = wtmap.CoordProjection.mercatorToLngLat(this.location);
            let targetLngLat = wtmap.CoordProjection.mercatorToLngLat(this.target);
            let line = [startLngLat, targetLngLat];
            line.properties = {floor: this.location.floor};
            lineData = wtmap.GeojsonUtils.createLineFeatureCollection([line]);
        } else {
            lineData = wtmap.GeojsonUtils.createLineFeatureCollection([]);
        }
        return {
            symbolData, lineData
        }
    }
});

function OrientationLayer(name) {
    this.sourceID = name + '-ort-source';
    this.source = {
        'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
    };
    this.lineSource = {
        'type': 'geojson', 'data': {'type': 'FeatureCollection', 'features': []}
    };

    this.symbolLayerID = name + '-ort-symbol';
    this.symbolLayer = {
        'type': 'symbol',
        'id': this.symbolLayerID,
        'source': this.sourceID,
        'paint': {},
        'layout': {
            'text-font': ['simhei'],
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-max-width': 20,
            'text-size': 9,
            'text-field': ['get', 'angle'],
            'icon-size': .5,
            'icon-image': 'facility-orientation',
            'icon-rotate': ['get', 'angle'],
            'icon-rotation-alignment': 'map',
            'text-allow-overlap': true,
            'icon-allow-overlap': true,
        }
    };

    this.lineSourceID = name + '-ort-line-source';
    this.lineLayerID = name + '-ort-line';
    this.lineLayer = {
        'type': 'line',
        'id': this.lineLayerID,
        'source': this.lineSourceID,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'red',
            'line-width': 1,
        }
    };
}

OrientationLayer.prototype = Object.assign(OrientationLayer.prototype, {
    addToMap: function (map) {
        this.map = map;
        this.map.addSource(this.lineSourceID, this.lineSource);
        this.map.addLayer(this.lineLayer);

        this.map.addSource(this.sourceID, this.source);
        this.map.addLayer(this.symbolLayer);
    },

    showOrientation: function (ort) {
        let gData = ort.getGeojsonData();
        this.map.getSource(this.lineSourceID).setData(gData.lineData);
        this.map.getSource(this.sourceID).setData(gData.symbolData);
    },

    updateFilter(filter) {
        this.map.setFilter(this.lineLayerID, filter);
        this.map.setFilter(this.symbolLayerID, filter);
    },

    setFloor(floorNumber) {
        let filter = ["all", ['==', 'floor', floorNumber]];
        this.updateFilter(filter);
    }
});



