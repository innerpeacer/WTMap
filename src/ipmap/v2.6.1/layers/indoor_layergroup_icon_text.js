import {indoor_layer_base as IndoorGroupLayer} from './indoor_layer_base';
import {extend, clone} from '../../dependencies.js';

let defaultSymbolLayer = {
    'type': 'symbol',
    'paint': {
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
    },
    'layout': {
        'symbol-z-order': 'source',
        'text-offset': [0.6, 0.1],
        'text-padding': 2
    }
};

function _getHeight(use3D) {
    return use3D ? ['/', ['get', 'extrusion-height'], 10] : 0;
}

class indoor_layergroup_icon_text extends IndoorGroupLayer {
    constructor(map, name) {
        super(map);
        this.usePriority = true;
        let subLayerName = name;
        this.styleLayers = {};
        this.buildingID = map.building.buildingID;
        let baseZoom = map.getBaseZoom();

        let height = _getHeight(map._options.use3D);
        let symbolUIDArray = map._layerSymbolMap[subLayerName];
        for (let i = 0; i < symbolUIDArray.length; ++i) {
            let symbolUID = symbolUIDArray[i];
            let symbol = map._iconTextSymbolMap[symbolUID];
            if (!symbol) continue;

            let layerID = `${subLayerName}-${symbolUID}`;
            let layer = extend({
                'id': layerID,
                'symbol': symbol,
                'symbolID': symbol.symbolID,
                'source': this.sourceID,
                'source-layer': subLayerName
            }, clone(defaultSymbolLayer));
            layer.paint['symbol-height'] = height;

            if (symbol.iconVisible) {
                layer.layout['icon-image'] = ['concat', ['get', 'ICON'], '_normal'];
                layer.layout['icon-anchor'] = 'bottom';
                layer.layout['icon-size'] = symbol.iconSize;
            }

            if (symbol.textVisible) {
                layer.paint['text-color'] = symbol.textColor;
                layer.layout['text-field'] = ['get', 'NAME'];
                layer.layout['text-font'] = [`${symbol.textFont}-${this.buildingID}`];
                layer.layout['text-size'] = symbol.textSize;
                if (symbol.iconVisible) {
                    layer.layout['text-variable-anchor'] = ['top', 'bottom', 'left', 'right'];
                    layer.layout['icon-anchor'] = 'bottom';
                    layer.layout['text-radial-offset'] = 0.9;
                    layer.paint['text-translate'] = [0, -12];
                    layer.paint['text-translate-anchor'] = 'viewport';
                    layer.layout['text-justify'] = 'auto';
                } else {
                    layer.layout['text-anchor'] = 'center';
                    layer.layout['text-offset'] = [symbol.textOffsetX, symbol.textOffsetY];
                }
            }

            if (symbol.otherLayout) {
                for (let key in symbol.otherLayout) {
                    if (symbol.otherLayout.hasOwnProperty(key)) {
                        layer.layout[key] = symbol.otherLayout[key];
                    }
                }
            }

            if (symbol.otherPaint) {
                for (let key in symbol.otherPaint) {
                    if (symbol.otherPaint.hasOwnProperty(key)) {
                        layer.paint[key] = symbol.otherPaint[key];
                    }
                }
            }

            let levelMin = symbol.levelMin;
            if (levelMin && levelMin !== 0) {
                layer.minzoom = baseZoom + levelMin;
            }
            let levelMax = symbol.levelMax;
            if (levelMax && levelMax !== 0) {
                layer.maxzoom = baseZoom + levelMax;
            }
            this.styleLayers[layerID] = layer;
        }
        // console.log(subLayerName + ' Layer: ' + symbolUIDArray.length);
    }


    _switch3D(use3D) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setPaintProperty(layerID, 'symbol-height', _getHeight(use3D));
            }
        }
    }

    switchLanguage(options) {
        if (!options || !options.lang) return;
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                let layerDef = layers[layerID];
                let symbol = layerDef.symbol;
                if (symbol.textVisible) {
                    if (options.lang === 'cn') {
                        this.map.setLayoutProperty(layerID, 'text-field', ['get', 'NAME']);
                        this.map.setLayoutProperty(layerID, 'text-font', [`${symbol.textFont}-${this.buildingID}`]);
                    } else if (options.lang === 'en') {
                        this.map.setLayoutProperty(layerID, 'text-field', ['get', 'NAME_EN']);
                        let enFont = options.font || 'simhei';
                        this.map.setLayoutProperty(layerID, 'text-font', [`${enFont}-${this.buildingID}`]);
                    }
                }
            }
        }
    }

    _setLabelIconVisibleRange(minZoom, maxZoom) {
        this._setLabelVisibleRange(minZoom, maxZoom);
    }

    _setLabelVisibleRange(minZoom, maxZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setLayerZoomRange(layerID, minZoom, maxZoom);
            }
        }
    }

    _updateFontIconSize(minZoom) {
        // No Icon!
        this._updateFontSize(minZoom);
    }

    _updateFontSize(minZoom) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setLayoutProperty(layerID, 'text-size', {stops: [[minZoom, 12], [minZoom + 1, 18], [minZoom + 2, 24]]});
            }
        }
    }

    updateLayoutProperty(property, value) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setLayoutProperty(layerID, property, value);
            }
        }
    }

    updatePaintProperty(property, value) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setPaintProperty(layerID, property, value);
            }
        }
    }

    setFont(fontName) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setLayoutProperty(layerID, 'text-font', [`${fontName}-${this.buildingID}`]);
            }
        }
    }

    loadSubGroupLayerData(data) {
        this.map.getSource(this.sourceID).setData(data);
    }

    _setMapInfo(mapInfo) {
        let layers = this.styleLayers;
        for (let layerID in layers) {
            if (layers.hasOwnProperty(layerID)) {
                this.map.setFilter(layerID, ['all',
                    ['==', 'floor', mapInfo.floorNumber],
                    ['==', 'symbolID', layers[layerID].symbolID]
                ]);
            }
        }
    }
}

export {indoor_layergroup_icon_text};
