// @flow
class route_animation_object {
    globalAnimationID: AnimationFrameID | any;
    globalMap: Object;
    lastTime: number;

    // TODO
    globalWholeRouteResult: Object;
    globalWholeRouteArrowSourceID: ?string;
    globalWholeOffset: number | any;

    // TODO
    globalSegmentRouteResult: Object;
    globalSegmentRouteArrowSourceID: ?string;
    globalSegmentOffset: number | any;

    running: boolean;

    constructor() {
        this.reset();
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

export {route_animation_object};
