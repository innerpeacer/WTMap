// @flow
import {Evented} from '../../dependencies.js';
import type {CallbackType} from '../../dependencies.js';
import {ip_agent_utils} from '../utils/ip_agent_utils';

class orientation_handler extends Evented {
    _target: any;
    _agent: number;

    _threhold: number;
    _isBinded: boolean;

    orientationEventCallback: CallbackType;
    absoluteOrientationEventCallbackForAndroid: CallbackType;

    heading: number;
    _lastHeading: number;

    constructor(target: Object, options: Object) {
        super();
        this._target = target;
        this._agent = ip_agent_utils.getAgent().type;
        this._threhold = (options && options['threhold']) || 2;

        this._lastHeading = 1000;
        this._isBinded = false;
        let self = this;
        this.orientationEventCallback = (event) => {
            self.OnOrientationChange(event);
        };
        this.absoluteOrientationEventCallbackForAndroid = (event) => {
            self.OnAbsoluteOrientationChange(event);
        };
    }

    bind() {
        if (this._isBinded) return;

        this._isBinded = true;
        if (this._agent === 1) {
            window.addEventListener('deviceorientationabsolute', this.absoluteOrientationEventCallbackForAndroid, false);
        } else {
            window.addEventListener('deviceorientation', this.orientationEventCallback, false);
        }
    }

    unbind() {
        if (!this._isBinded) return;

        this._isBinded = false;
        if (this._agent === 1) {
            window.removeEventListener('deviceorientationabsolute', this.absoluteOrientationEventCallbackForAndroid, false);
        } else {
            window.removeEventListener('deviceorientation', this.orientationEventCallback, false);
        }
    }

    OnOrientationChange(event: Object) {
        if (this._agent !== 1) {
            if (event.hasOwnProperty('webkitCompassHeading')) {
                this._NotifyAngle(360 - event.webkitCompassHeading);
            } else {
                this._NotifyAngle(event.alpha);
            }
        }
    }

    OnAbsoluteOrientationChange(event: Object) {
        if (this._agent === 1) {
            this._NotifyAngle(event.alpha);
        }
    }

    _NotifyAngle(heading: number) {
        let diff = Math.abs(this._lastHeading - heading);
        if (diff > this._threhold) {
            this._lastHeading = heading;
            this.heading = heading;
            this._target.fire('heading', {heading: this.heading});
        }
    }
}

export {orientation_handler};
