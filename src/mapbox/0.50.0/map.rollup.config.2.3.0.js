import fs from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {plugins} from './build/rollup_plugins';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const ip_version = "v2.3.0";

const production = process.env.BUILD === 'production';
// const outputFile = production ? 'dist/mapbox-gl.js' : 'dist/mapbox-gl-dev.js';
const outputFile = production ? 'dist/wtmap-gl-' + ip_version + '.js' : 'dist/wtmap-gl-dev.js';

const config = [{
    // input: ["src/ip_index_2.3.0.js", 'src/source/worker.js'],
    input: ["src/index.js", 'src/source/worker.js'],
    output: {
        // dir: 'rollup/build/mapboxgl',
        dir: 'ip_rollup/build/ipmap',
        format: 'amd',
        sourcemap: 'inline',
        indent: false,
        chunkFileNames: 'shared.js'
    },
    experimentalCodeSplitting: true,
    treeshake: production,
    plugins: plugins()
},
    {
        // input: 'rollup/mapboxgl.js',
        input: 'ip_rollup/ipmap.js',
        output: {
            // name: 'mapboxgl',
            name: 'wtmap',
            file: outputFile,
            format: 'umd',
            sourcemap: production ? true : 'inline',
            indent: false,
            // intro: fs.readFileSync(require.resolve('./rollup/bundle_prelude.js'), 'utf8'),
            intro: fs.readFileSync(require.resolve('./ip_rollup/bundle_prelude.js'), 'utf8'),
            banner: `/* Mapbox GL JS is licensed under the 3-Clause BSD License. Full text of license: https://github.com/mapbox/mapbox-gl-js/blob/v${version}/LICENSE.txt */`
        },
        treeshake: false,
        plugins: [
            // Ingest the sourcemaps produced in the first step of the build.
            // This is the only reason we use Rollup for this second pass
            sourcemaps()
        ],
    }];

export default config
