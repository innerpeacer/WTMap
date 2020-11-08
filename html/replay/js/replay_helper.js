let replayLayer1;
let replayLayer2;

function initReplayLayers(map) {
    let name = 'replay';
    replayLayer1 = new wtmap.CustomTraceLayer(name + '-1');
    replayLayer1.setTextLayoutProperty("text-field", ["concat", ["get", "index"]]);
    replayLayer1.addToMap(map);

    replayLayer2 = new wtmap.CustomTraceLayer(name + '-2');
    replayLayer2.setTextLayoutProperty("text-field", ["concat", ["get", "index"]]);
    replayLayer2.setLinePaintProperty("line-color", 'red');
    replayLayer2.addToMap(map);
    return {r1: replayLayer1, r2: replayLayer2}
}

function setLayerVisible(map, visible) {
    map.setLayoutProperty(replayLayer1.traceLineLayerID, 'visibility', visible ? 'visible' : 'none');
    map.setLayoutProperty(replayLayer1.tracePointCircleLayerID, 'visibility', visible ? 'visible' : 'none');
    map.setLayoutProperty(replayLayer1.tracePointSymbolLayerID, 'visibility', visible ? 'visible' : 'none');
    map.setLayoutProperty(replayLayer2.traceLineLayerID, 'visibility', visible ? 'visible' : 'none');
    map.setLayoutProperty(replayLayer2.tracePointCircleLayerID, 'visibility', visible ? 'visible' : 'none');
    map.setLayoutProperty(replayLayer2.tracePointSymbolLayerID, 'visibility', visible ? 'visible' : 'none');
}

function showReplayData(data, modifiedData) {
    // console.log('showReplayData');
    // console.log(data);
    replayLayer1.showTraceData(replayPointsToGeojson(data));
    replayLayer2.showTraceData(replayPointsToGeojson(modifiedData));
}

function replayPointsToGeojson(replayPoints) {
    let tpArray = [];
    for (let i = 0; i < replayPoints.length; ++i) {
        let tp = replayPoints[i];
        let lp = new wtmap.LocalPoint(tp.x, tp.y, tp.floor);
        let lngLat = lp.getLngLat();
        lngLat.properties = {
            index: tp.index,
            date: tp.date,
            floor: tp.floor
        };
        tpArray.push(lngLat);
    }
    return tpArray;
}