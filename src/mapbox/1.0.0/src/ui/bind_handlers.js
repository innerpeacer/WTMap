// @flow

import {MapMouseEvent, MapTouchEvent, MapWheelEvent} from '../ui/events';
import DOM from '../util/dom';
// import type Map from './map';
import scrollZoom from './handler/scroll_zoom';
import boxZoom from './handler/box_zoom';
import dragRotate from './handler/drag_rotate';
import dragPan from './handler/drag_pan';
import keyboard from './handler/keyboard';
import doubleClickZoom from './handler/dblclick_zoom';
import touchZoomRotate from './handler/touch_zoom_rotate';
import oneFingerZoom from './handler/one_finger_zoom';

const handlers = {
    scrollZoom,
    boxZoom,
    dragRotate,
    dragPan,
    keyboard,
    doubleClickZoom,
    // oneFingerZoom,
    touchZoomRotate
};

export default function bindHandlers(map, options) {
    const el = map.getCanvasContainer();
    let contextMenuEvent = null;
    let mouseDown = false;
    let startPos = null;

    for (const name in handlers) {
        map[name] = new handlers[name](map, options);
        if (options.interactive && options[name]) {
            (map)[name].enable(options[name]);
        }
    }

    DOM.addEventListener(el, 'mouseout', onMouseOut);
    DOM.addEventListener(el, 'mousedown', onMouseDown);
    DOM.addEventListener(el, 'mouseup', onMouseUp);
    DOM.addEventListener(el, 'mousemove', onMouseMove);
    DOM.addEventListener(el, 'mouseover', onMouseOver);

    // Bind touchstart and touchmove with passive: false because, even though
    // they only fire a map events and therefore could theoretically be
    // passive, binding with passive: true causes iOS not to respect
    // e.preventDefault() in _other_ handlers, even if they are non-passive
    // (see https://bugs.webkit.org/show_bug.cgi?id=184251)
    DOM.addEventListener(el, 'touchstart', onTouchStart, {passive: false});
    DOM.addEventListener(el, 'touchmove', onTouchMove, {passive: false});

    DOM.addEventListener(el, 'touchend', onTouchEnd);
    DOM.addEventListener(el, 'touchcancel', onTouchCancel);
    DOM.addEventListener(el, 'click', onClick);
    DOM.addEventListener(el, 'dblclick', onDblClick);
    DOM.addEventListener(el, 'contextmenu', onContextMenu);
    DOM.addEventListener(el, 'wheel', onWheel, {passive: false});

    function onMouseDown(e) {
        mouseDown = true;
        startPos = DOM.mousePos(el, e);

        const mapEvent = new MapMouseEvent('mousedown', map, e);
        map.fire(mapEvent);

        if (mapEvent.defaultPrevented) {
            return;
        }

        if (options.interactive && !map.doubleClickZoom.isActive()) {
        // if (options.interactive && !map.oneFingerZoom.isActive()) {
            // console.log("I blame for the stop")
            map.stop();
        }

        map.boxZoom.onMouseDown(e);

        if (!map.boxZoom.isActive() && !map.dragPan.isActive()) {
            map.dragRotate.onMouseDown(e);
        }

        if (!map.boxZoom.isActive() && !map.dragRotate.isActive()) {
            map.dragPan.onMouseDown(e);
        }
    }

    function onMouseUp(e) {
        const rotating = map.dragRotate.isActive();

        if (contextMenuEvent && !rotating) {
            // This will be the case for Mac
            map.fire(new MapMouseEvent('contextmenu', map, contextMenuEvent));
        }

        contextMenuEvent = null;
        mouseDown = false;

        map.fire(new MapMouseEvent('mouseup', map, e));
    }

    function onMouseMove(e) {
        if (map.dragPan.isActive()) return;
        if (map.dragRotate.isActive()) return;

        let target = (e.target);
        while (target && target !== el) target = target.parentNode;
        if (target !== el) return;

        map.fire(new MapMouseEvent('mousemove', map, e));
    }

    function onMouseOver(e) {
        let target = (e.target);
        while (target && target !== el) target = target.parentNode;
        if (target !== el) return;

        map.fire(new MapMouseEvent('mouseover', map, e));
    }

    function onMouseOut(e) {
        map.fire(new MapMouseEvent('mouseout', map, e));
    }

    function onTouchStart(e) {
        const mapEvent = new MapTouchEvent('touchstart', map, e);
        map.fire(mapEvent);

        if (mapEvent.defaultPrevented) {
            return;
        }

        if (options.interactive) {
            map.stop();
        }

        if (!map.boxZoom.isActive() && !map.dragRotate.isActive()) {
            map.dragPan.onTouchStart(e);
        }

        map.touchZoomRotate.onStart(e);
        // map.oneFingerZoom.onTouchStart(e);
        map.doubleClickZoom.onTouchStart(mapEvent);
    }

    function onTouchMove(e) {
        map.fire(new MapTouchEvent('touchmove', map, e));
    }

    function onTouchEnd(e) {
        map.fire(new MapTouchEvent('touchend', map, e));
    }

    function onTouchCancel(e) {
        map.fire(new MapTouchEvent('touchcancel', map, e));
    }

    function onClick(e) {
        const pos = DOM.mousePos(el, e);
        if (pos.equals(startPos) || pos.dist(startPos) < options.clickTolerance) {
            map.fire(new MapMouseEvent('click', map, e));
        }
    }

    function onDblClick(e) {
        const mapEvent = new MapMouseEvent('dblclick', map, e);
        map.fire(mapEvent);

        if (mapEvent.defaultPrevented) {
            return;
        }

        map.doubleClickZoom.onDblClick(mapEvent);
        // map.oneFingerZoom.onDblClick(mapEvent);
    }

    function onContextMenu(e) {
        const rotating = map.dragRotate.isActive();
        if (!mouseDown && !rotating) {
            // Windows: contextmenu fired on mouseup, so fire event now
            map.fire(new MapMouseEvent('contextmenu', map, e));
        } else if (mouseDown) {
            // Mac: contextmenu fired on mousedown; we save it until mouseup for consistency's sake
            contextMenuEvent = e;
        }

        // prevent browser context menu when necessary; we don't allow it with rotation
        // because we can't discern rotation gesture start from contextmenu on Mac
        if (map.dragRotate.isEnabled() || map.listens('contextmenu')) {
            e.preventDefault();
        }
    }

    function onWheel(e) {
        if (options.interactive) {
            map.stop();
        }

        const mapEvent = new MapWheelEvent('wheel', map, e);
        map.fire(mapEvent);

        if (mapEvent.defaultPrevented) {
            return;
        }

        map.scrollZoom.onWheel(e);
    }
}
