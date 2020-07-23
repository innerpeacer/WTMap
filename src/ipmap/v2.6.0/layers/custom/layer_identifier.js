function sourceIdentifier(name) {
    return `${name}-source`;
}

function layerIdentifier(name, type) {
    return `${name}-${type}-layer`;
}

export {sourceIdentifier, layerIdentifier};
