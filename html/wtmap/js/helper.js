function getParameter(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
};

var AccessToken = "pk.eyJ1IjoiaW5uZXJwZWFjZXIiLCJhIjoiY2lvdHJpa3dtMDBjanU5bTQ1NGJ5azc3MyJ9.lIu8RdS7tUD3uKvsqIjJlg";