import {local_point as LocalPoint} from "../../dependencies.js";

import {coord_transform as CoordTransform} from "./coord_transform"

class wt_wgs84_converter {
    constructor(wgs84Points, wtPoints) {
        // console.log("wt_wgs84_converter.constructor");
        // console.log(wgs84Points);
        // console.log(wtPoints);

        if (!wgs84Points || wgs84Points.length !== 6 || !wtPoints || wtPoints.length !== 6) {
            this._valid = false;
            return;
        }

        let mercatorXY = [];
        let xy1 = LocalPoint.fromLngLat({lng: wgs84Points[0], lat: wgs84Points[1]});
        let xy2 = LocalPoint.fromLngLat({lng: wgs84Points[2], lat: wgs84Points[3]});
        let xy3 = LocalPoint.fromLngLat({lng: wgs84Points[4], lat: wgs84Points[5]});
        mercatorXY.push(xy1.x);
        mercatorXY.push(xy1.y);
        mercatorXY.push(xy2.x);
        mercatorXY.push(xy2.y);
        mercatorXY.push(xy3.x);
        mercatorXY.push(xy3.y);

        this._valid = true;
        this._transform = new CoordTransform(mercatorXY, wtPoints);
    }

    getMercator(wgs84) {
        if (!this._valid) return;
        let mercatorXY = LocalPoint.fromLngLat(wgs84);
        return this._transform.tranformTo(mercatorXY);
    }

    convertGPS(wgs84) {
        if (!this._valid) return;
        let mercatorXY = LocalPoint.fromLngLat(wgs84);
        let transformMercatorXY = this._transform.tranformTo(mercatorXY);
        return LocalPoint.fromXY(transformMercatorXY);
    }
}

export default wt_wgs84_converter;
