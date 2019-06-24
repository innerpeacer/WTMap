import IPColorUtils from "../utils/ip_color_utils"

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

export default icon_text_symbol