export function extend(dest, ...sources) {
    for (const src of sources) {
        for (const k in src) {
            if (src.hasOwnProperty(k)) {
                dest[k] = src[k];
            }
        }
    }
    return dest;
}

export function mapObject(input, iterator, context) {
    const output = {};
    for (const key in input) {
        if (input.hasOwnProperty(key)) {
            output[key] = iterator.call(context || this, input[key], key, input);
        }
    }
    return output;
}

export function clone(input) {
    if (Array.isArray(input)) {
        return input.map(clone);
    } else if (typeof input === 'object' && input) {
        return ((mapObject(input, clone)));
    } else {
        return input;
    }
}
