// @flow

import {bindAll} from '../../util/util';


/**
 * The `DoubleClickZoomHandler` allows the user to zoom the map at a point by
 * double clicking or double tapping.
 */
class DoubleClickZoomHandler {

    /**
     * @private
     */
    constructor(map) {
        this._map = map;

        bindAll([
            '_onDblClick',
            '_onZoomEnd'
        ], this);
    }

    isEnabled() {
        return !!this._enabled;
    }

    isActive() {
        return !!this._active;
    }

    enable() {
        if (this.isEnabled()) return;
        this._enabled = true;
    }

    disable() {
        if (!this.isEnabled()) return;
        this._enabled = false;
    }

    onTouchStart(e) {
        if (!this.isEnabled()) return;
        if (e.points.length > 1) return;

        if (!this._tapped) {
            this._tapped = setTimeout(() => {
                this._tapped = null;
            }, 300);
        } else {
            clearTimeout(this._tapped);
            this._tapped = null;
            this._zoom(e);
        }
    }

    onDblClick(e) {
        if (!this.isEnabled()) return;
        e.originalEvent.preventDefault();
        this._zoom(e);
    }

    _zoom(e) {
        this._active = true;
        this._map.on('zoomend', this._onZoomEnd);
        this._map.zoomTo(
            this._map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1),
            {around: e.lngLat},
            e
        );
    }

    _onZoomEnd() {
        this._active = false;
        this._map.off('zoomend', this._onZoomEnd);
    }
}

export default DoubleClickZoomHandler;
