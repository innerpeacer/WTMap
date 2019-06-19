import IPColorUtils from "../utils/ip_color_utils"

class fill_symbol {
    constructor(obj) {
        this.symbolID = obj.symbolID;

        this.fillColor = IPColorUtils.parseColor(obj.fillColor);
        this.fillOpacity = IPColorUtils.parseOpacity(obj.fillColor);

        this.outlineColor = IPColorUtils.parseColor(obj.outlineColor);
        this.outlineOpacity = IPColorUtils.parseOpacity(obj.outlineColor);
        this.outlineWidth = obj.outlineWidth;
    }

    toString() {
        return `FillSymbol: ${this.symbolID}, Color: ${this.fillColor}`;
    }
}

fill_symbol.getFillSymbolArray = function (array) {
    let result = [];
    for (let i = 0; i < array.length; ++i) {
        let symbol = new fill_symbol(array[i]);
        result.push(symbol);
    }
    return result;
};

export default fill_symbol