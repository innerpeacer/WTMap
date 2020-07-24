export function toStartParameter(p) {
    return 'startX=' + p.x + '&startY=' + p.y + '&startF=' + p.floor;
}

export function toStartParameter2(p) {
    return 'start=' + p.x + ',' + p.y + ',' + p.floor;
}

export function toEndParameter(p) {
    return 'endX=' + p.x + '&endY=' + p.y + '&endF=' + p.floor;
}

export function toEndParameter2(p) {
    return 'end=' + p.x + ',' + p.y + ',' + p.floor;
}

export function toStopParams(stops) {
    let str = 'stops=';
    for (let i = 0; i < stops.length; ++i) {
        let sp = stops[i];
        if (i !== 0) {
            str += ',';
        }
        str += (sp.x + ',' + sp.y + ',' + sp.floor);
    }
    return str;
}