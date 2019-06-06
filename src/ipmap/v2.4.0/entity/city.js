class city {
    constructor(obj) {
        this.cityID = obj.id;
        this.name = obj.name;
        this.sname = obj.sname;
        this.longitude = obj.longitude;
        this.latitude = obj.latitude;
        this.status = obj.status;
    }

    toString() {
        return `${this.name}(${this.cityID})`;
    }
}

export default city