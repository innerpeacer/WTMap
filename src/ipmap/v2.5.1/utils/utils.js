class utils {

}

function getParameter(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

utils.getParameter = getParameter;

function round(value, n) {
    let factor = Math.pow(10, n);
    return parseInt(value * factor) / factor;
}

utils.round = round;

export {utils}
