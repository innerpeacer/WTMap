class multi_stop_route_result {
    constructor(completeRes, details) {
        this.completeResult = completeRes;
        this.detailedResult = details;

        this.startPoint = null;
        this.endPoint = null;
        this.stopPoints = null;

        this.startRoomID = null;
        this.endRoomID = null;

        this.indices = null;
        this.rearrangedPoints = null;
    }
}

export default multi_stop_route_result
