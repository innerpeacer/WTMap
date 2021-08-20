console.log(`====== build wtmap ======`);

const {spawn} = require('child_process');
const RootPkg = require('../package.json');
const version = RootPkg.version;
const ipmapVersion = RootPkg.ipmapVersion;
const mapboxVersion = RootPkg.mapboxVersion;

console.log('Version:', version);
console.log('IPMap Version: ', ipmapVersion);
console.log('MapBox Version:', mapboxVersion);

let cmdStr = 'rollup -c map.rollup.config.wt.js --environment BUILD:production,MINIFY:true';
let cmd = cmdStr.split(' ')[0];
let params = cmdStr.split(' ').slice(1);
console.log('Cmd: ', cmdStr);

let cwd = `src/mapbox/${mapboxVersion}/`;
console.log('Cwd: ', cwd);

let childProcess = spawn(cmd, params, {cwd});

childProcess.stdout.on('data', (data) => {
    console.log(`\x1B[32m${data}\x1B[0m`);
});

childProcess.stderr.on('data', (data) => {
    console.log(`\x1B[33m${data}\x1B[0m`);
});

childProcess.on('close', (code) => {
    console.log(`\x1B[32mChild process exited with code ${code}\x1B[0m`);
});
