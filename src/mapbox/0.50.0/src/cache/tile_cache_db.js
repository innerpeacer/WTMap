const tile_db_name = "v_innerpeacer";
const tile_store_name = "tile";

import CacheVersion from "./cache_version";

class tile_cache_db {
    constructor() {
        // console.log("tile_cache_db.constructor");
    }

    init() {
        // console.log("tile_cache_db.init");
        let that = this;

        let versionName = CacheVersion.getVersionName();
        let versionNumber = CacheVersion.getVersionNumber();
        let store_name = tile_store_name + "-" + versionName;
        that._store_name = store_name;

        let openRequest = indexedDB.open(tile_db_name, versionNumber);
        openRequest.onsuccess = function (e) {
            // console.log("onsuccess");
            that._db = e.target.result;
            that.__isSupported = true;
        };

        openRequest.onupgradeneeded = function (e) {
            // console.log("running onupgradeneeded");
            let thisDB = e.target.result;
            // console.log(thisDB.objectStoreNames);
            if (!thisDB.objectStoreNames.contains(store_name)) {
                thisDB.createObjectStore(store_name, {keyPath: "key"});
            }
        };

        openRequest.onerror = function (e) {
            console.log("indexedDB not supported here");
            // console.log(e);
            that.__isSupported = false;
        };
        return this;
    }

    put(key, arrayBuffer) {
        // console.log("tile_cache_db.put");
        // console.log(this.__isSupported);
        // console.log(this);
        if (!this.__isSupported) return;
        // console.log("tile_cache_db Here");

        let transaction = this._db.transaction([this._store_name], "readwrite");
        let store = transaction.objectStore(this._store_name);
        let request = store.put({key: key, data: arrayBuffer});
        request.onerror = function (e) {
            // console.log("put-error: ");
            // console.log(e);
        };

        request.onsuccess = function (e) {
            // console.log("put-success: ");
            // console.log(e);
        };
    }


    get(key, callback, errorCallback) {
        // console.log("tile_cache_db.get");
        // console.log(key)
        if (!this.__isSupported) {
            if (errorCallback) errorCallback();
            return;
        }

        let transaction = this._db.transaction([this._store_name], "readonly");
        let store = transaction.objectStore(this._store_name);
        let request = store.get(key);
        request.onerror = function (e) {
            if (errorCallback) errorCallback(e.target.error);
        };

        request.onsuccess = function (e) {
            let result = e.target.result;
            if (result && result.data) {
                if (callback) callback(result);
            } else {
                if (errorCallback) errorCallback(e.target.error);
            }
        };
    }

    static getInstance() {
        // console.log(tile_cache_db.__instance == null);
        if (tile_cache_db.__instance == null) {
            tile_cache_db.__instance = new tile_cache_db();
        }
        return tile_cache_db.__instance;
    }
}

export default tile_cache_db.getInstance();
