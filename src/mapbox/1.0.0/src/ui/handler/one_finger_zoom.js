import {bindAll} from '../../util/util';
import DOM from "../../util/dom";
import window from "../../util/window";

class OneFingerZoomHandler {
    constructor(map, options) {
        this._map = map;
        this._el = map.getCanvasContainer();
        this._clickTolerance = options.clickTolerance || 1;

        bindAll([
            '_onMove',
            '_onTouchEnd',
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
        if (e.touches.length > 1) return;

        this._hasPanned = false;
        if (!this._tapped) {
            this._tapped = setTimeout(() => {
                this._tapped = null;
            }, 500);
        } else {
            this._map.fire("onef_zoom_start");
            clearTimeout(this._tapped);
            this._tapped = null;
            DOM.addEventListener(window.document, 'touchmove', this._onMove, {capture: true, passive: false});
            this._map.on("touchend", this._onTouchEnd);
            this._active = true;
            this._mouseDownPos = this._lastPos = DOM.mousePos(this._el, e);
        }
    }

    _onMove(e) {
        e.preventDefault();
        this._hasPanned = true;
        this._map.fire("onef_zoom");
        const pos = DOM.mousePos(this._el, e);
        if (this._lastPos.equals(pos) || (pos.dist(this._mouseDownPos) < this._clickTolerance)) {
            return;
        }
        this._panZoom(e);
    }

    _onTouchEnd(e) {
        this._unbind();
        if (!this._hasPanned) {
            this._zoomIn(e);
        } else {
            this._active = false;
        }
        this._map.fire("onef_zoom_end");
    }

    onDblClick(e) {
        if (!this.isEnabled()) return;
        e.originalEvent.preventDefault();
        this._zoom(e);
    }

    _unbind() {
        DOM.removeEventListener(window.document, 'touchmove', this._onMove, {capture: true, passive: false});
        this._map.off("touchend", this._onTouchEnd);
    }

    _panZoom(e) {
        this._active = true;

        const pos = DOM.mousePos(this._el, e);
        const vec = this._lastPos.sub(pos);
        this._lastPos = pos;
        let deltaZoom = vec.y / 50;

        this._map.setZoom(this._map.getZoom() + deltaZoom);
    }

    _zoom(e) {
        this._active = true;
        this._map.on('zoomend', this._onZoomEnd);
        this._map.zoomTo(
            this._map.getZoom() + 1,
            {around: e.lngLat},
            e
        );
    }

    _zoomIn(e) {
        this._hasPanned = false;
        this._active = true;
        this._map.on('zoomend', this._onZoomEnd);
        this._map.zoomTo(
            this._map.getZoom() + 1,
            {around: e.lngLat},
            e
        );
    }

    _onZoomEnd() {
        this._active = false;
        this._map.off('zoomend', this._onZoomEnd);
    }
}

export default OneFingerZoomHandler;
