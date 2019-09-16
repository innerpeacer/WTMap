const SimulationDataType = {
    Motion: 1,
    Ble: 2,
    Gps: 3,
};

class simulation_data {
    constructor(options) {
        this.timestamp = options.timestamp;
        this.dataType = options.dataType;
        this.value = options.value;
    }
}

class simulation_interval {
    constructor(dataArray) {
        this.start = null;
        this.end = null;
        this._calculateInterval(dataArray);
    }

    _calculateInterval(dataArray) {
        this.start = 1e20;
        this.end = -1;
        for (let i = 0; i < dataArray.length; ++i) {
            let data = dataArray[i];
            if (this.start > data.timestamp) this.start = data.timestamp;
            if (this.end < data.timestamp) this.end = data.timestamp;
        }
    }

    toString() {
        return `Interval: [${this.start}, ${this.end}]`;
    }
}

export {SimulationDataType, simulation_data, simulation_interval}
