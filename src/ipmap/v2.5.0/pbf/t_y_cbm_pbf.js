'use strict'; // code generated by pbf v3.1.0

// CBMPbf ========================================

var CBMPbf = exports.CBMPbf = {};

CBMPbf.read = function (pbf, end) {
    return pbf.readFields(CBMPbf._readField, {buildingID: "", Cities: [], Buildings: [], MapInfos: [], FillSymbols: [], IconTextSymbols: [], Symbols: null}, end);
};
CBMPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.buildingID = pbf.readString();
    else if (tag === 2) obj.Cities.push(CityPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) obj.Buildings.push(BuildingPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 4) obj.MapInfos.push(MapInfoPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5) obj.FillSymbols.push(FillSymbolPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.IconTextSymbols.push(IconTextSymbolPbf.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 7) obj.Symbols = SymbolCollectionPbf.read(pbf, pbf.readVarint() + pbf.pos);
};
CBMPbf.write = function (obj, pbf) {
    if (obj.buildingID) pbf.writeStringField(1, obj.buildingID);
    if (obj.Cities) for (var i = 0; i < obj.Cities.length; i++) pbf.writeMessage(2, CityPbf.write, obj.Cities[i]);
    if (obj.Buildings) for (i = 0; i < obj.Buildings.length; i++) pbf.writeMessage(3, BuildingPbf.write, obj.Buildings[i]);
    if (obj.MapInfos) for (i = 0; i < obj.MapInfos.length; i++) pbf.writeMessage(4, MapInfoPbf.write, obj.MapInfos[i]);
    if (obj.FillSymbols) for (i = 0; i < obj.FillSymbols.length; i++) pbf.writeMessage(5, FillSymbolPbf.write, obj.FillSymbols[i]);
    if (obj.IconTextSymbols) for (i = 0; i < obj.IconTextSymbols.length; i++) pbf.writeMessage(6, IconTextSymbolPbf.write, obj.IconTextSymbols[i]);
    if (obj.Symbols) pbf.writeMessage(7, SymbolCollectionPbf.write, obj.Symbols);
};

// CityPbf ========================================

var CityPbf = exports.CityPbf = {};

CityPbf.read = function (pbf, end) {
    return pbf.readFields(CityPbf._readField, {id: "", name: "", sname: "", longitude: 0, latitude: 0}, end);
};
CityPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.name = pbf.readString();
    else if (tag === 3) obj.sname = pbf.readString();
    else if (tag === 4) obj.longitude = pbf.readDouble();
    else if (tag === 5) obj.latitude = pbf.readDouble();
};
CityPbf.write = function (obj, pbf) {
    if (obj.id) pbf.writeStringField(1, obj.id);
    if (obj.name) pbf.writeStringField(2, obj.name);
    if (obj.sname) pbf.writeStringField(3, obj.sname);
    if (obj.longitude) pbf.writeDoubleField(4, obj.longitude);
    if (obj.latitude) pbf.writeDoubleField(5, obj.latitude);
};

// BuildingPbf ========================================

var BuildingPbf = exports.BuildingPbf = {};

BuildingPbf.read = function (pbf, end) {
    return pbf.readFields(BuildingPbf._readField, {id: "", cityID: "", name: "", longitude: 0, latitude: 0, address: "", initAngle: 0, routeURL: "", xmin: 0, ymin: 0, xmax: 0, ymax: 0, initFloorIndex: 0}, end);
};
BuildingPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.cityID = pbf.readString();
    else if (tag === 3) obj.name = pbf.readString();
    else if (tag === 4) obj.longitude = pbf.readDouble();
    else if (tag === 5) obj.latitude = pbf.readDouble();
    else if (tag === 6) obj.address = pbf.readString();
    else if (tag === 7) obj.initAngle = pbf.readDouble();
    else if (tag === 8) obj.routeURL = pbf.readString();
    else if (tag === 10) obj.xmin = pbf.readDouble();
    else if (tag === 11) obj.ymin = pbf.readDouble();
    else if (tag === 12) obj.xmax = pbf.readDouble();
    else if (tag === 13) obj.ymax = pbf.readDouble();
    else if (tag === 14) obj.initFloorIndex = pbf.readVarint();
};
BuildingPbf.write = function (obj, pbf) {
    if (obj.id) pbf.writeStringField(1, obj.id);
    if (obj.cityID) pbf.writeStringField(2, obj.cityID);
    if (obj.name) pbf.writeStringField(3, obj.name);
    if (obj.longitude) pbf.writeDoubleField(4, obj.longitude);
    if (obj.latitude) pbf.writeDoubleField(5, obj.latitude);
    if (obj.address) pbf.writeStringField(6, obj.address);
    if (obj.initAngle) pbf.writeDoubleField(7, obj.initAngle);
    if (obj.routeURL) pbf.writeStringField(8, obj.routeURL);
    if (obj.xmin) pbf.writeDoubleField(10, obj.xmin);
    if (obj.ymin) pbf.writeDoubleField(11, obj.ymin);
    if (obj.xmax) pbf.writeDoubleField(12, obj.xmax);
    if (obj.ymax) pbf.writeDoubleField(13, obj.ymax);
    if (obj.initFloorIndex) pbf.writeVarintField(14, obj.initFloorIndex);
};

// MapInfoPbf ========================================

var MapInfoPbf = exports.MapInfoPbf = {};

MapInfoPbf.read = function (pbf, end) {
    return pbf.readFields(MapInfoPbf._readField, {mapID: "", cityID: "", buildingID: "", floorName: "", floorNumber: 0, size_x: 0, size_y: 0, xmin: 0, ymin: 0, xmax: 0, ymax: 0}, end);
};
MapInfoPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.mapID = pbf.readString();
    else if (tag === 2) obj.cityID = pbf.readString();
    else if (tag === 3) obj.buildingID = pbf.readString();
    else if (tag === 4) obj.floorName = pbf.readString();
    else if (tag === 5) obj.floorNumber = pbf.readVarint(true);
    else if (tag === 6) obj.size_x = pbf.readDouble();
    else if (tag === 7) obj.size_y = pbf.readDouble();
    else if (tag === 8) obj.xmin = pbf.readDouble();
    else if (tag === 9) obj.ymin = pbf.readDouble();
    else if (tag === 10) obj.xmax = pbf.readDouble();
    else if (tag === 11) obj.ymax = pbf.readDouble();
};
MapInfoPbf.write = function (obj, pbf) {
    if (obj.mapID) pbf.writeStringField(1, obj.mapID);
    if (obj.cityID) pbf.writeStringField(2, obj.cityID);
    if (obj.buildingID) pbf.writeStringField(3, obj.buildingID);
    if (obj.floorName) pbf.writeStringField(4, obj.floorName);
    if (obj.floorNumber) pbf.writeVarintField(5, obj.floorNumber);
    if (obj.size_x) pbf.writeDoubleField(6, obj.size_x);
    if (obj.size_y) pbf.writeDoubleField(7, obj.size_y);
    if (obj.xmin) pbf.writeDoubleField(8, obj.xmin);
    if (obj.ymin) pbf.writeDoubleField(9, obj.ymin);
    if (obj.xmax) pbf.writeDoubleField(10, obj.xmax);
    if (obj.ymax) pbf.writeDoubleField(11, obj.ymax);
};

// FillSymbolPbf ========================================

var FillSymbolPbf = exports.FillSymbolPbf = {};

FillSymbolPbf.read = function (pbf, end) {
    return pbf.readFields(FillSymbolPbf._readField, {UID: 0, symbolID: 0, fillColor: "", outlineColor: "", outlineWidth: 0, levelMin: 0, levelMax: 0}, end);
};
FillSymbolPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.UID = pbf.readVarint();
    else if (tag === 2) obj.symbolID = pbf.readVarint();
    else if (tag === 3) obj.fillColor = pbf.readString();
    else if (tag === 4) obj.outlineColor = pbf.readString();
    else if (tag === 5) obj.outlineWidth = pbf.readDouble();
    else if (tag === 6) obj.levelMin = pbf.readDouble();
    else if (tag === 7) obj.levelMax = pbf.readDouble();
};
FillSymbolPbf.write = function (obj, pbf) {
    if (obj.UID) pbf.writeVarintField(1, obj.UID);
    if (obj.symbolID) pbf.writeVarintField(2, obj.symbolID);
    if (obj.fillColor) pbf.writeStringField(3, obj.fillColor);
    if (obj.outlineColor) pbf.writeStringField(4, obj.outlineColor);
    if (obj.outlineWidth) pbf.writeDoubleField(5, obj.outlineWidth);
    if (obj.levelMin) pbf.writeDoubleField(6, obj.levelMin);
    if (obj.levelMax) pbf.writeDoubleField(7, obj.levelMax);
};

// IconTextSymbolPbf ========================================

var IconTextSymbolPbf = exports.IconTextSymbolPbf = {};

IconTextSymbolPbf.read = function (pbf, end) {
    return pbf.readFields(IconTextSymbolPbf._readField, {UID: 0, symbolID: 0, iconVisible: false, iconSize: 0, iconRotate: 0, iconOffsetX: 0, iconOffsetY: 0, textVisible: false, textSize: 0, textRotate: 0, textFont: "", textColor: "", textOffsetX: 0, textOffsetY: 0, levelMin: 0, levelMax: 0, priority: 0, otherPaint: "", otherLayout: ""}, end);
};
IconTextSymbolPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.UID = pbf.readVarint();
    else if (tag === 2) obj.symbolID = pbf.readVarint();
    else if (tag === 3) obj.iconVisible = pbf.readBoolean();
    else if (tag === 4) obj.iconSize = pbf.readDouble();
    else if (tag === 5) obj.iconRotate = pbf.readDouble();
    else if (tag === 6) obj.iconOffsetX = pbf.readDouble();
    else if (tag === 7) obj.iconOffsetY = pbf.readDouble();
    else if (tag === 10) obj.textVisible = pbf.readBoolean();
    else if (tag === 11) obj.textSize = pbf.readDouble();
    else if (tag === 12) obj.textRotate = pbf.readDouble();
    else if (tag === 13) obj.textFont = pbf.readString();
    else if (tag === 14) obj.textColor = pbf.readString();
    else if (tag === 15) obj.textOffsetX = pbf.readDouble();
    else if (tag === 16) obj.textOffsetY = pbf.readDouble();
    else if (tag === 21) obj.levelMin = pbf.readDouble();
    else if (tag === 22) obj.levelMax = pbf.readDouble();
    else if (tag === 23) obj.priority = pbf.readVarint();
    else if (tag === 30) obj.otherPaint = pbf.readString();
    else if (tag === 31) obj.otherLayout = pbf.readString();
};
IconTextSymbolPbf.write = function (obj, pbf) {
    if (obj.UID) pbf.writeVarintField(1, obj.UID);
    if (obj.symbolID) pbf.writeVarintField(2, obj.symbolID);
    if (obj.iconVisible) pbf.writeBooleanField(3, obj.iconVisible);
    if (obj.iconSize) pbf.writeDoubleField(4, obj.iconSize);
    if (obj.iconRotate) pbf.writeDoubleField(5, obj.iconRotate);
    if (obj.iconOffsetX) pbf.writeDoubleField(6, obj.iconOffsetX);
    if (obj.iconOffsetY) pbf.writeDoubleField(7, obj.iconOffsetY);
    if (obj.textVisible) pbf.writeBooleanField(10, obj.textVisible);
    if (obj.textSize) pbf.writeDoubleField(11, obj.textSize);
    if (obj.textRotate) pbf.writeDoubleField(12, obj.textRotate);
    if (obj.textFont) pbf.writeStringField(13, obj.textFont);
    if (obj.textColor) pbf.writeStringField(14, obj.textColor);
    if (obj.textOffsetX) pbf.writeDoubleField(15, obj.textOffsetX);
    if (obj.textOffsetY) pbf.writeDoubleField(16, obj.textOffsetY);
    if (obj.levelMin) pbf.writeDoubleField(21, obj.levelMin);
    if (obj.levelMax) pbf.writeDoubleField(22, obj.levelMax);
    if (obj.priority) pbf.writeVarintField(23, obj.priority);
    if (obj.otherPaint) pbf.writeStringField(30, obj.otherPaint);
    if (obj.otherLayout) pbf.writeStringField(31, obj.otherLayout);
};

// SymbolCollectionPbf ========================================

var SymbolCollectionPbf = exports.SymbolCollectionPbf = {};

SymbolCollectionPbf.read = function (pbf, end) {
    return pbf.readFields(SymbolCollectionPbf._readField, {floor: [], room: [], asset: [], facility: [], label: [], extrusion: []}, end);
};
SymbolCollectionPbf._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.floor.push(pbf.readVarint());
    else if (tag === 2) obj.room.push(pbf.readVarint());
    else if (tag === 3) obj.asset.push(pbf.readVarint());
    else if (tag === 4) obj.facility.push(pbf.readVarint());
    else if (tag === 5) obj.label.push(pbf.readVarint());
    else if (tag === 6) obj.extrusion.push(pbf.readVarint());
};
SymbolCollectionPbf.write = function (obj, pbf) {
    if (obj.floor) for (var i = 0; i < obj.floor.length; i++) pbf.writeVarintField(1, obj.floor[i]);
    if (obj.room) for (i = 0; i < obj.room.length; i++) pbf.writeVarintField(2, obj.room[i]);
    if (obj.asset) for (i = 0; i < obj.asset.length; i++) pbf.writeVarintField(3, obj.asset[i]);
    if (obj.facility) for (i = 0; i < obj.facility.length; i++) pbf.writeVarintField(4, obj.facility[i]);
    if (obj.label) for (i = 0; i < obj.label.length; i++) pbf.writeVarintField(5, obj.label[i]);
    if (obj.extrusion) for (i = 0; i < obj.extrusion.length; i++) pbf.writeVarintField(6, obj.extrusion[i]);
};
