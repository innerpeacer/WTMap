import {createLayout} from '../../util/struct_array';

const iplineLayoutAttributes = createLayout([
    {name: 'a_pos_normal', components: 4, type: 'Int16'},
    {name: 'a_data', components: 4, type: 'Uint8'}
], 4);

// export default iplineLayoutAttributes;
export const {members, size, alignment} = iplineLayoutAttributes;
