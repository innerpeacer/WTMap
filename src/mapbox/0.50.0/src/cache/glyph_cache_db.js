const glyph_db_name = "g_innerpeacer";
const glyph_store_name = "glyph";

import CacheVersion from "./cache_version";

class glyph_cache_db {
    constructor() {

    }

    init() {
        // console.log("glyph_cache_db.init");
        let that = this;

        let versionName = CacheVersion.getVersionName();
        let versionNumber = CacheVersion.getVersionNumber();
        let store_name = glyph_store_name + "-" + versionName;
        that._store_name = store_name;

        let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        if (!indexedDB) {
            console.log("Browser does not support IndexedDB");
            return;
        }

        let openRequest = indexedDB.open(glyph_db_name, versionNumber);
        openRequest.onsuccess = function (e) {
            // console.log("onsuccess");
            that._db = e.target.result;
            that.__isSupported = true;
            if (!that._db.objectStoreNames.contains(store_name)) {
                // console.log("onsucess but store_name not found, delete database");
                indexedDB.deleteDatabase(glyph_db_name);
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
            indexedDB.deleteDatabase(glyph_db_name);
            that.__isSupported = false;
        };
        return this;
    }

    put(key, arrayBuffer) {
        // console.log("glyph_cache_db.put");
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
        // console.log("glyph_cache_db.get");
        // console.log(key)
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
        // console.log(glyph_cache_db.__instance == null);
        if (glyph_cache_db.__instance == null) {
            glyph_cache_db.__instance = new glyph_cache_db();
        }
        return glyph_cache_db.__instance;
    }
}
export default glyph_cache_db.getInstance();
