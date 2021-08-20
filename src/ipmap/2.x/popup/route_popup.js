// @flow
import type {
    local_point as LocalPoint
} from '../../dependencies';
import type {IPMap} from '../map/map';

import {
    Evented
} from '../../dependencies';
import {Popup} from '../inherit';

const PopOffsetSize = 36;
const PopOffset = {
    'bottom': [0, -PopOffsetSize],
    'top': [0, PopOffsetSize],
    'left': [PopOffsetSize, 0],
    'right': [-PopOffsetSize, 0]
};

const StartEndPopupClassName = 'start-end-pop-content-class';
const StartEndPopupOptions = {
    closeOnClick: false,
    closeButton: false,
    withTip: false,
    contentClassName: StartEndPopupClassName,
    anchor: 'bottom',
    offset: PopOffset
};

const SwitchPopupClassName = 'switch-pop-content-class';
const SwitchPopupOptions = {
    closeOnClick: false,
    closeButton: false,
    withTip: false,
    contentClassName: SwitchPopupClassName,
    anchor: 'bottom',
    offset: PopOffset
};

const PopupType = {
    Start: 'start',
    End: 'end',
    To: 'to',
    From: 'from'
};

function createRoutePopupStyle(str) {
    let node: Object = document.createElement('style');
    // node.type = 'text/css';
    if (node.styleSheet) {
        node.styleSheet.cssText = str;
    } else {
        node.innerHTML = str;
    }
    document.getElementsByTagName('head')[0].appendChild(node);
}

createRoutePopupStyle(`
.${StartEndPopupClassName}
{
    background: #848C94 !important;
    color: white !important;
    padding: 2px 5px !important;
}`);

createRoutePopupStyle(`
.${SwitchPopupClassName}
{
    background: #85A6E2 !important;
    color: white !important;
    padding: 2px 5px !important;
}`);


class route_popup extends Evented {
    popup: Object;
    data: Object;
    type: string;

    constructor(p: Object) {
        super();
        this.data = p;

        let type = this.type = this.data.properties.type;
        if (type === PopupType.Start || type === PopupType.End) {
            this._createStartEnd();
        } else if (type === PopupType.To || type === PopupType.From) {
            this._createToFrom();
        }
    }

    updateFloor(map: IPMap, floor: number) {
        // console.log('route_popup.updateFloor');
        if (this.type === PopupType.Start || this.type === PopupType.End) {
            if (this.data.properties.floor === floor) {
                this.remove();
            } else {
                this.addToMap(map);
            }
        }

        if (this.type === PopupType.To || this.type === PopupType.From) {
            if (this.data.properties.floor === floor) {
                this.addToMap(map);
            } else {
                this.remove();
            }
        }
    }

    _createStartEnd() {
        this.popup = new Popup(StartEndPopupOptions);
        let p: LocalPoint = this.data;
        let props = this.data.properties;

        let popDom = document.createElement('div');
        popDom.innerHTML = props.floorName;
        this.popup.setDOMContent(popDom);
        this.popup.setLngLat(p.getCoord());
    }

    _createToFrom() {
        this.popup = new Popup(SwitchPopupOptions);
        let p: LocalPoint = this.data;
        let props = this.data.properties;

        let popDom = document.createElement('div');
        if (props.type === PopupType.To) {
            popDom.innerHTML = `乘${props.nodeName}前往${props.toFloorName}层`;
        } else if (props.type === PopupType.From) {
            popDom.innerHTML = `返回到${props.fromFloorName}层`;
        }
        popDom.onclick = () => {
            this.fire('popup-click');
        };
        this.popup.setDOMContent(popDom);
        this.popup.setLngLat(p.getCoord());
    }

    _createFrom() {
        this.popup = new Popup(StartEndPopupOptions);
        let p: LocalPoint = this.data;
        let props = this.data.properties;

        let popDom = document.createElement('div');
        popDom.innerHTML = props.floorName;
        this.popup.setDOMContent(popDom);
        this.popup.setLngLat(p.getCoord());
    }

    addToMap(map: IPMap) {
        this.popup.addTo(map);
    }

    remove() {
        this.popup.remove();
    }
}

export {route_popup, PopupType};
