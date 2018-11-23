const _version_name_key = "v_name";
const _version_number_key = "v_number";

// function _setVersionName(name) {
//     cache_version._usedVersionName = name;
// }
//
// function _setVersionNumber(number) {
//     cache_version._usedVersionNumber = number;
// }

class cache_version {

    static useVersion(version) {
        // console.log("cache_version.useVersion: " + version);
        let versionName = version;
        if (!versionName) versionName = "default";

        let currentVersion = localStorage.getItem(_version_name_key);
        let currentNumber = parseInt(localStorage.getItem(_version_number_key));

        if (!currentVersion) {
            currentVersion = versionName;
            currentNumber = 2;
        } else {
            if (currentVersion === versionName) {

            } else {
                currentVersion = versionName;
                currentNumber = currentNumber + 1;
            }
        }
        localStorage.setItem(_version_name_key, currentVersion);
        localStorage.setItem(_version_number_key, currentNumber);

        // _setVersionName(currentVersion);
        // _setVersionNumber(currentNumber);
    }


    static getVersionName() {
        // if (!cache_version._usedVersionName) return "default";
        // return cache_version._usedVersionName;
        let currentVersion = localStorage.getItem(_version_name_key);
        if (!currentVersion) {
            currentVersion = "default";
        }
        return currentVersion;
    }

    static getVersionNumber() {
        // if (!cache_version._usedVersionNumber) return 1;
        // return cache_version._usedVersionNumber;
        let currentNumber = parseInt(localStorage.getItem(_version_number_key));
        if (!currentNumber) currentNumber = null;
        return currentNumber;
    }
}

export default cache_version;