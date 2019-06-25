const tile_db_name = "v_innerpeacer";
const tile_store_name = "tile";

import CacheVersion from "./cache_version";

class tile_cache_db {
    constructor() {
        // console.log("tile_cache_db.constructor");
        this.__disabled = false;
    }

    disable() {
        this.__disabled = true;
    }

    init() {
        // console.log("tile_cache_db.init");
        if (this.__disabled) return;
        let that = this;

        let versionName = CacheVersion.getVersionName();
        let versionNumber = CacheVersion.getVersionNumber();
        let store_name = tile_store_name + "-" + versionName;
        that._store_name = store_name;

        let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        if (!indexedDB) {
            console.log("Browser does not support IndexedDB");
            return;
        }
        let openRequest = indexedDB.open(tile_db_name, versionNumber);
        openRequest.onsuccess = function (e) {
            // console.log("onsuccess");
            that._db = e.target.result;
            that.__isSupported = true;
            if (!that._db.objectStoreNames.contains(store_name)) {
                // console.log("onsucess but store_name not found, delete database");
                indexedDB.deleteDatabase(tile_db_name);
            }
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
            indexedDB.deleteDatabase(tile_db_name);
            that.__isSupported = false;
        };
        return this;
    }

    put(key, arrayBuffer) {
        // console.log("tile_cache_db.put");
        if (this.__disabled) return;
        if (!this.__isSupported) return;

        if (!this._db.objectStoreNames.contains(this._store_name)) {
            // console.log("put: object store cannot been found!");
            return;
        }

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
        if (this.__disabled) {
            if (errorCallback) errorCallback();
            return;
        }
        if (!this.__isSupported) {
            if (errorCallback) errorCallback();
            return;
        }

        if (!this._db.objectStoreNames.contains(this._store_name)) {
            // console.log("get: object store cannot been found!");
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
