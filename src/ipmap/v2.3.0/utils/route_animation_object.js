class route_animation_object {
    constructor() {
        this.globalAnimationID = null;
        this.globalMap = null;
        this.lastTime = -1;

        this.globalWholeRouteResult = null;
        this.globalWholeRouteArrowSourceID = null;
        this.globalWholeOffset = 0;

        this.globalSegmentRouteResult = null;
        this.globalSegmentRouteArrowSourceID = null;
        this.globalSegmentOffset = 0;

        this.running = false;
    }

    reset() {
        this.globalAnimationID = null;
        this.globalMap = null;
        this.lastTime = -1;

        this.globalWholeRouteResult = null;
        this.globalWholeRouteArrowSourceID = null;
        this.globalWholeOffset = 0;

        this.globalSegmentRouteResult = null;
        this.globalSegmentRouteArrowSourceID = null;
        this.globalSegmentOffset = 0;

        this.running = false;
    }
}

export default route_animation_object