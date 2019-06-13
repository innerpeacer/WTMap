class building {
    constructor(obj) {
        this.buildingID = obj.id;
        this.cityID = obj.cityID;
        this.name = obj.name;
        this.address = obj.address;
        this.longitude = obj.longitude;
        this.latitude = obj.latitude;
        this.initAngle = obj.initAngle;
        this.offsetX = obj.offsetX;
        this.offsetY = obj.offsetY;
        this.routeURL = obj.routeURL;
        this.status = obj.status;
        this.initFloorIndex = obj.initFloorIndex || 0;
    }

    toString() {
        return `${this.name}(${this.buildingID})`;
    }
}

export default building