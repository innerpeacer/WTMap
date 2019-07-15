class icon_symbol {
    constructor(obj) {
        this.symbolID = obj.symbolID;
        this.icon = obj.icon;
    }

    toString() {
        return `IconSymbol: ${this.symbolID}, Icon: ${this.icon}`;
    }
}

icon_symbol.getIconSymbolArray = function (array) {
    let result = [];
    for (let i = 0; i < array.length; ++i) {
        let symbol = new icon_symbol(array[i]);
        result.push(symbol)
    }
    return result;
};

export default icon_symbol