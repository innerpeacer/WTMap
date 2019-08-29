import {Evented} from './ip_evented'
import InnerEventManager from "./inner_event_manager"

let HttpEvent = InnerEventManager.HttpEvent;

class http_request extends Evented {
    constructor() {
        super();
    }

    requestData(url, callback, errorCallback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url, true);
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let json = JSON.parse(httpRequest.responseText);
                    if (callback) {
                        callback(json);
                    }
                } else {
                    let error = {};
                    error.status = httpRequest.status;
                    error.statusText = httpRequest.statusText;
                    if (errorCallback) {
                        errorCallback(error);
                    }
                }
            }
        };
        httpRequest.send();
    }

    request(url) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url, true);
        let that = this;
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let json = JSON.parse(httpRequest.responseText);
                    that.fire(HttpEvent.HttpResult, json);
                } else {
                    that.fire(HttpEvent.HttpError, {status: httpRequest.status, statusText: httpRequest.statusText});
                }
            }
        };
        httpRequest.send();
    }

    requestBlob(url) {
        let httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', url, true);
        httpRequest.responseType = 'arraybuffer';
        let that = this;
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let bytes = httpRequest.response;
                    that.fire(HttpEvent.HttpResult, {bytes: bytes});
                } else {
                    that.fire(HttpEvent.HttpError, {status: httpRequest.status, statusText: httpRequest.statusText});
                }
            }
        };
        httpRequest.send();
    }
}

export default http_request;
