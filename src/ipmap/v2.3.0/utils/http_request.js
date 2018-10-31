import {Evented} from "./ip_evented"

class http_request extends Evented {
    constructor() {
        super();
    }

    requestData(url, callback, errorCallback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", url, true);
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var json = JSON.parse(httpRequest.responseText);
                    if (callback) {
                        callback(json);
                    }
                } else {
                    var error = {};
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
        httpRequest.open("GET", url, true);
        let that = this;
        httpRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var json = JSON.parse(httpRequest.responseText);
                    that.fire("http-result", json);
                } else {
                    that.fire("http-error", {status: httpRequest.status, statusText: httpRequest.statusText});
                }
            }
        };
        httpRequest.send();
    }
}

export default http_request;