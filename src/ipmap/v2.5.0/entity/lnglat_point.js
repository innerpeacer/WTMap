class lnglat_point {
    constructor(lng, lat, f) {
        this.lng = lng;
        this.lat = lat;
        this.floor = f;
    }

    toString() {
        return `Lng: ${this.lng}, Lat: ${this.lat}, Floor: ${this.floor}`;
    }
}

export {lnglat_point}