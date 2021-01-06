// @flow
function sourceIdentifier(name: string): string {
    return `${name}-source`;
}

function layerIdentifier(name: string, type: string): string {
    return `${name}-${type}-layer`;
}

export {sourceIdentifier, layerIdentifier};
