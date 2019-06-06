//
// Our custom intro provides a specialized "define()" function, called by the
// AMD modules below, that sets up the worker blob URL and then executes the
// main module, storing its exported value as 'mapboxgl'

// The three "chunks" imported here are produced by a first Rollup pass,
// which outputs them as AMD modules.

// Shared dependencies, i.e.:
/*
define(['exports'], function (exports) {
    // Code for all common dependencies
    // Each module's exports are attached attached to 'exports' (with
    // names rewritten to avoid collisions, etc.)
})
*/
// import './build/mapboxgl/shared';
// import './build/share';
import './build/ipmap-v2.4.0/shared';

// Worker and its unique dependencies, i.e.:
/*
define(['./shared.js'], function (__shared__js) {
    //  Code for worker script and its unique dependencies.
    //  Expects the output of 'shared' module to be passed in as an argument,
    //  since all references to common deps look like, e.g.,
    //  __shared__js.shapeText().
});
*/
// When this wrapper function is passed to our custom define() above,
// it gets stringified, together with the shared wrapper (using
// Function.toString()), and the resulting string of code is made into a
// Blob URL that gets used by the main module to create the web workers.
// import './build/mapboxgl/worker';
// import './build/ipmap/worker';
import './build/ipmap-v2.4.0/worker';

// Main module and its unique dependencies
/*
define(['./shared.js'], function (__shared__js) {
    //  Code for main GL JS module and its unique dependencies.
    //  Expects the output of 'shared' module to be passed in as an argument,
    //  since all references to common deps look like, e.g.,
    //  __shared__js.shapeText().
    //
    //  Returns the actual mapboxgl (i.e. src/index.js)
});
*/

// This filename cannot be changed to other than "index"????
// import './build/mapboxgl/index';
// import './build/ipmap/ip_index_2.3.0.js';
// import './build/ipmap/index';
import './build/ipmap-v2.4.0/index';

export default mapboxgl;
