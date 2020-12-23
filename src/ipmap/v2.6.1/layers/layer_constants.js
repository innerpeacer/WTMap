const DefaultVectorSourceID = 'innerpeacer';

const LayerParams = {
    Floor: {
        name: 'floor',
        layerNumber: 1,
        layerType: 'fill',
        sourceLayer: 'fill'
    },
    Room: {
        name: 'room',
        layerNumber: 2,
        layerType: 'fill',
        sourceLayer: 'fill'
    },
    Asset: {
        name: 'asset',
        layerNumber: 3,
        layerType: 'fill',
        sourceLayer: 'fill'
    },
    Facility: {
        name: 'facility',
        layerNumber: 4,
        layerType: 'symbol',
        sourceLayer: 'facility'
    },
    Label: {
        name: 'label',
        layerNumber: 5,
        layerType: 'symbol',
        sourceLayer: 'label'
    },
    Extrusion: {
        name: 'extrusion',
        layerNumber: null,
        layerType: 'ipfill-extrusion',
        sourceLayer: 'fill'
    }
};

// const LayerNames = {
//     Floor: 'floor',
//     Room: 'room',
//     Asset: 'asset',
//     Facility: 'facility',
//     Label: 'label',
//     Extrusion: 'extrusion'
// };
//
// const LayerNumbers = {
//     Floor: 1,
//     Room: 2,
//     Asset: 3,
//     Facility: 4,
//     Label: 5
// };

export {DefaultVectorSourceID, LayerParams};
