import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'index.js',
    plugins: [
        resolve(),
        commonjs()
    ],
    output: [
        {
            format: 'umd',
            name: 'lab',
            file: '../dist/lab.js',
            indent: '\t'
        }
    ]
};
