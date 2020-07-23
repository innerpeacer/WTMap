import fs from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {plugins} from './build/rollup_plugins';

const ip_version = "v2.6.0";

const {BUILD, MINIFY} = process.env;
const minified = MINIFY === 'true';
const production = BUILD === 'production';
// const outputFile =
//     !production ? 'dist/mapbox-gl-dev.js' :
//     minified ? 'dist/mapbox-gl.js' : 'dist/mapbox-gl-unminified.js';
const outputFile =
    !production ? '../../../dist/wtmap-gl-dev.js' :
        minified ? '../../../dist/wtmap-gl-' + ip_version + '.js' : '../../../dist/wtmap-gl-' + ip_version + '.js';

export default [{
    // First, use code splitting to bundle GL JS into three "chunks":
    // - rollup/build/index.js: the main module, plus all its dependencies not shared by the worker module
    // - rollup/build/worker.js: the worker module, plus all dependencies not shared by the main module
    // - rollup/build/shared.js: the set of modules that are dependencies of both the main module and the worker module
    //
    // This is also where we do all of our source transformations: removing
    // flow annotations, transpiling ES6 features using buble, inlining shader
    // sources as strings, etc.
    input: ['src/index.js', 'src/source/worker.js'],
    output: {
        // dir: 'rollup/build/mapboxgl',
        dir: 'ip_rollup/build/ipmap-' + ip_version,
        format: 'amd',
        sourcemap: 'inline',
        indent: false,
        chunkFileNames: 'shared.js'
    },
    treeshake: production,
    plugins: plugins(minified, production)
}, {
    // Next, bundle together the three "chunks" produced in the previous pass
    // into a single, final bundle. See rollup/bundle_prelude.js and
    // rollup/mapboxgl.js for details.
    // input: 'rollup/mapboxgl.js',
    input: 'ip_rollup/ipmap-' + ip_version + '.js',
    output: {
        name: 'wtmap',
        file: outputFile,
        format: 'umd',
        sourcemap: production ? true : 'inline',
        indent: false,
        intro: fs.readFileSync(require.resolve('./rollup/bundle_prelude.js'), 'utf8'),
        // banner
    },
    treeshake: false,
    plugins: [
        // Ingest the sourcemaps produced in the first step of the build.
        // This is the only reason we use Rollup for this second pass
        sourcemaps()
    ],
}];
