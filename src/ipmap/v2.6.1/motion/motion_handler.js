import {Evented} from '../../dependencies.js';
import {ip_agent_utils} from '../utils/ip_agent_utils';

let flag = true;

class motion_handler extends Evented {
    constructor(target) {
        super();
        this._target = target;
        this._isBinded = false;

        let self = this;
        this.motionEventCallback = (event) => {
            self.OnMotionEvent(event);
        };
    }

    bind() {
        if (this._isBinded) return;

        this._isBinded = true;
        window.addEventListener('devicemotion', this.motionEventCallback, false);
    }

    unbind() {
        if (!this._isBinded) return;

        this._isBinded = false;
        window.addEventListener('devicemotion', this.motionEventCallback, false);
    }

    OnMotionEvent(event) {
        // console.log("OnMotionEvent");
        // console.log(event.acceleration);

        if (flag) {
            console.log(event);
            flag = false;
        }

        this._target.fire('motion', {
            acceleration: event.acceleration,
            gravity: event.accelerationIncludingGravity,
            rotationRate: event.rotationRate,
            interval: event.interval
        });
    }
}

export {motion_handler};
