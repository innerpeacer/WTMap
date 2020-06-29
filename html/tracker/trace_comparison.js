function distanceBetween(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function round(num, N) {
    N = N || 2;
    var power = Math.pow(10, N);
    return Math.round(num * power) / power
}

function analyzeTracePoint(points) {
    console.log("analyzeTracePoint");

    var timestampMap = {};
    var indexList = [];
    var pointMap = {}

    for (var i = 0; i < points.length; ++i) {
        var p = points[i];
        // console.log(p);
        indexList.push(i);
        timestampMap[i] = p.timestamp;
        pointMap[i] = {x: p.x, y: p.y, floor: p.floor, timestamp: p.timestamp};
    }

    return {
        indexList: indexList,
        timestampMap: timestampMap,
        pointMap: pointMap,
    }
}

const timeWindow = 10 * 1000;

function findNearestPoint(tp, res) {
    // console.log("findNearestPoint");
    var t1 = tp.timestamp;
    var pointMap = res.pointMap;
    var timestampMap = res.timestampMap;
    // console.log(timestampMap);

    var nearestIndex = -1;
    var nearestDistance = Number.MAX_VALUE;
    var deltaTime = -1;
    for (var index in timestampMap) {
        var timestamp = timestampMap[index];

        if (Math.abs(timestamp - t1) < timeWindow) {
            // console.log("Valid index: ", index, timestamp);
            var vp = pointMap[index];
            var dis = distanceBetween(tp, vp);
            if (dis < nearestDistance) {
                nearestIndex = index;
                nearestDistance = dis;
                deltaTime = vp.timestamp - tp.timestamp
            }
        }
    }

    if (nearestIndex == -1) return null;

    return {index: nearestIndex, nearestDistance: round(nearestDistance), deltaTime: round(deltaTime / 1000)};
}