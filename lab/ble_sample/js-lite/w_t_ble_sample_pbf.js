'use strict'; // code generated by pbf v3.1.0

// LocationPbf ========================================

var LocationPbf = exports.LocationPbf = {};

LocationPbf.read = function (pbf, end) {
    return pbf.readFields(LocationPbf._readField, {x: 0, y: 0, floor: 0}, end);
};
LocationPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.x = pbf.readDouble();
    else if (tag === 2) obj.y = pbf.readDouble();
    else if (tag === 3) obj.floor = pbf.readVarint(true);
};
LocationPbf.write = function (obj, pbf) {
    if (obj.x) pbf.writeDoubleField(1, obj.x);
    if (obj.y) pbf.writeDoubleField(2, obj.y);
    if (obj.floor) pbf.writeVarintField(3, obj.floor);
};

// BleBeaconPbf ========================================

var BleBeaconPbf = exports.BleBeaconPbf = {};

BleBeaconPbf.read = function (pbf, end) {
    return pbf.readFields(BleBeaconPbf._readField, {uuid: "", major: 0, minor: 0, rssi: 0, accuracy: 0}, end);
};
BleBeaconPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.uuid = pbf.readString();
    else if (tag === 2) obj.major = pbf.readVarint();
    else if (tag === 3) obj.minor = pbf.readVarint();
    else if (tag === 4) obj.rssi = pbf.readVarint(true);
    else if (tag === 5) obj.accuracy = pbf.readDouble();
};
BleBeaconPbf.write = function (obj, pbf) {
    if (obj.uuid) pbf.writeStringField(1, obj.uuid);
    if (obj.major) pbf.writeVarintField(2, obj.major);
    if (obj.minor) pbf.writeVarintField(3, obj.minor);
    if (obj.rssi) pbf.writeVarintField(4, obj.rssi);
    if (obj.accuracy) pbf.writeDoubleField(5, obj.accuracy);
};

// BleSignalPbf ========================================

var BleSignalPbf = exports.BleSignalPbf = {};

BleSignalPbf.read = function (pbf, end) {
    return pbf.readFields(BleSignalPbf._readField, {timestamp: 0, beacons: []}, end);
};
BleSignalPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.timestamp = pbf.readDouble();
    else if (tag === 2) obj.beacons.push(BleBeaconPbf.read(pbf, pbf.readVarint() + pbf.pos));
};
BleSignalPbf.write = function (obj, pbf) {
    if (obj.timestamp) pbf.writeDoubleField(1, obj.timestamp);
    if (obj.beacons) for (var i = 0; i < obj.beacons.length; i++) pbf.writeMessage(2, BleBeaconPbf.write, obj.beacons[i]);
};

// GpsSignalPbf ========================================

var GpsSignalPbf = exports.GpsSignalPbf = {};

GpsSignalPbf.read = function (pbf, end) {
    return pbf.readFields(GpsSignalPbf._readField, {timestamp: 0, lng: 0, lat: 0, accuracy: 0}, end);
};
GpsSignalPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.timestamp = pbf.readDouble();
    else if (tag === 2) obj.lng = pbf.readDouble();
    else if (tag === 3) obj.lat = pbf.readDouble();
    else if (tag === 4) obj.accuracy = pbf.readDouble();
};
GpsSignalPbf.write = function (obj, pbf) {
    if (obj.timestamp) pbf.writeDoubleField(1, obj.timestamp);
    if (obj.lng) pbf.writeDoubleField(2, obj.lng);
    if (obj.lat) pbf.writeDoubleField(3, obj.lat);
    if (obj.accuracy) pbf.writeDoubleField(4, obj.accuracy);
};

// BleSamplePbf ========================================

var BleSamplePbf = exports.BleSamplePbf = {};

BleSamplePbf.read = function (pbf, end) {
    return pbf.readFields(BleSamplePbf._readField, {timestamp: 0, sampleID: "", buildingID: "", location: null, gpsList: [], bleList: [], platform: 0, user: ""}, end);
};
BleSamplePbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.timestamp = pbf.readDouble();
    else if (tag === 2) obj.sampleID = pbf.readString();
    else if (tag === 3) obj.buildingID = pbf.readString();
    else if (tag === 4) obj.location = LocationPbf.read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.gpsList.push(GpsSignalPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.bleList.push(BleSignalPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 7) obj.platform = pbf.readVarint();
    else if (tag === 8) obj.user = pbf.readString();
};
BleSamplePbf.write = function (obj, pbf) {
    if (obj.timestamp) pbf.writeDoubleField(1, obj.timestamp);
    if (obj.sampleID) pbf.writeStringField(2, obj.sampleID);
    if (obj.buildingID) pbf.writeStringField(3, obj.buildingID);
    if (obj.location) pbf.writeMessage(4, LocationPbf.write, obj.location);
    if (obj.gpsList) for (var i = 0; i < obj.gpsList.length; i++) pbf.writeMessage(5, GpsSignalPbf.write, obj.gpsList[i]);
    if (obj.bleList) for (i = 0; i < obj.bleList.length; i++) pbf.writeMessage(6, BleSignalPbf.write, obj.bleList[i]);
    if (obj.platform) pbf.writeVarintField(7, obj.platform);
    if (obj.user) pbf.writeStringField(8, obj.user);
};