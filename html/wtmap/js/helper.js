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

function initFloorSwitch(aMap) {
    // console.log("initFloorSwitch");

    var floorSwitch;
    var outerDiv = document.createElement('div');
    outerDiv.className = "floor-switch-overlay top";
    {
        var innerDiv = document.createElement('div');
        innerDiv.className = "floor-switch-overlay-inner";
        {
            var fieldSet = document.createElement("fieldset");

            var label = document.createElement("label");
            label.innerText = "Select Floor";
            fieldSet.appendChild(label);

            floorSwitch = document.createElement("select");
            floorSwitch.id = "floorSwitch";
            floorSwitch.name = "floorSwitch";
            fieldSet.appendChild(floorSwitch);
            innerDiv.appendChild(fieldSet);
        }
        outerDiv.appendChild(innerDiv);
    }
    // aMap.getContainer().appendChild(outerDiv);
    document.body.appendChild(outerDiv);


    floorSwitch.onchange = function () {
        aMap.setFloor(map.mapInfoArray[floorSwitch.selectedIndex].mapID);
    };

    aMap.mapInfoArray.forEach(function (mapInfo) {
        var floorButton = document.createElement('option');
        floorButton.value = mapInfo.floorName;
        floorButton.text = mapInfo.floorName;
        floorSwitch.appendChild(floorButton);
        floorSwitch.selectedIndex = map.building.initFloorIndex;
    });

    aMap.on("floorend", function (evt) {
        // console.log(evt.mapInfo);
        for (var i = 0; i < aMap.mapInfoArray.length; ++i) {
            var info = aMap.mapInfoArray[i];
            if (info.floorNumber == evt.mapInfo.floorNumber) {
                floorSwitch.selectedIndex = i;
                return;
            }
        }
    });
}
