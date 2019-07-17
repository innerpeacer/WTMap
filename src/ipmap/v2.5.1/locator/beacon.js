class beacon {
    constructor(uuid, major, minor) {
        this.uuid = uuid.toUpperCase();
        this.major = major;
        this.minor = minor;
        this.key = this.major + '-' + this.minor;
    }
}

export default beacon;
