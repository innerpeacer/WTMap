function getParameter(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};

var AccessToken = "pk.eyJ1IjoiaW5uZXJwZWFjZXIiLCJhIjoiY2lvdHJpa3dtMDBjanU5bTQ1NGJ5azc3MyJ9.lIu8RdS7tUD3uKvsqIjJlg";

function requestBlob(url, callback, errorCallback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url, true);
    httpRequest.responseType = 'arraybuffer';
    let that = this;
    httpRequest.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let bytes = httpRequest.response;
                if (callback) callback(bytes);
            } else {
                if (errorCallback) errorCallback({status: httpRequest.status, statusText: httpRequest.statusText});
            }
        }
    };
    httpRequest.send();
}

function requestJson(url, callback, errorCallback) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url, true);
    let that = this;
    httpRequest.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let json = JSON.parse(httpRequest.responseText);
                if (callback) callback(json);
            } else {
                if (errorCallback) errorCallback({status: httpRequest.status, statusText: httpRequest.statusText});
            }
        }
    };
    httpRequest.send();
}
