import IPColorUtils from '../utils/ip_color_utils'

class fill_symbol {
    constructor(obj) {
        this.symbolID = obj.symbolID;
        this.UID = obj.UID;

        this.fillColor = IPColorUtils.parseColor(obj.fillColor);
        this.fillOpacity = IPColorUtils.parseOpacity(obj.fillColor);

        this.outlineColor = IPColorUtils.parseColor(obj.outlineColor);
        this.outlineOpacity = IPColorUtils.parseOpacity(obj.outlineColor);
        this.outlineWidth = obj.outlineWidth;

        this.levelMin = obj.levelMin;
        this.levelMax = obj.levelMax;
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

class icon_text_symbol {
    constructor(obj) {
        this.symbolID = obj.symbolID;
        this.UID = obj.UID;

        this.iconVisible = obj.iconVisible;
        this.iconSize = obj.iconSize;
        this.iconRotate = obj.iconRotate;
        this.iconOffsetX = obj.iconOffsetX;
        this.iconOffsetY = obj.iconOffsetY;

        this.textVisible = obj.textVisible;
        this.textSize = obj.textSize;
        this.textFont = obj.textFont;
        this.textColor = IPColorUtils.parseColor(obj.textColor);
        this.textOpacity = IPColorUtils.parseOpacity(obj.textColor);
        this.textRotate = obj.textRotate;
        this.textOffsetX = obj.textOffsetX;
        this.textOffsetY = obj.textOffsetY;

        this.levelMin = obj.levelMin;
        this.levelMax = obj.levelMax;

        this.priority = obj.priority;

        if (obj.otherPaint) {
            this.otherPaint = JSON.parse(obj.otherPaint);
        }
        if (obj.otherLayout) {
            this.otherLayout = JSON.parse(obj.otherLayout);
        }
    }

    toString() {
        return `IconTextSymbol: ${this.symbolID}`;
    }
}

icon_text_symbol.getIconTextSymbolArray = function (array) {
    let result = [];
    for (let i = 0; i < array.length; ++i) {
        let symbol = new icon_text_symbol(array[i]);
        result.push(symbol);
    }
    return result;
};

export {fill_symbol, icon_text_symbol}
