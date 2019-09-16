import {Evented} from "../lab_utils/lab_evented"

import {simulation_interval as SimulationInterval} from "./simulation_entity";

const SIMULATOR_TIMER_RATE = 1; // ms

const DEFAULT_SIMULATION_SPEED = 1.0;


function getNow() {
    return (new Date()).valueOf();
}

let statusObject = {
    isFinished: false,
    isPaused: false,

    dataIndex: 0,

    startTimeOfReal: -1,
    startTimeOfSimulation: -1,

    currentTimeOfReal: -1,
    currentTimeOfSimulation: -1,
};

class simulator extends Evented {
    constructor(data) {
        super();
        console.log("simulator.constructor");

        this.simulatingSpeed = DEFAULT_SIMULATION_SPEED;
        this._replayTimer = null;

        if (data) {
            this.loadSimulationData(data);
        }
    }

    loadSimulationData(dataArray) {
        // console.log("_loadSimulationData");
        dataArray.sort(function (a, b) {
            return a.timestamp - b.timestamp;
        });
        // console.log(dataArray);
        this.data = dataArray;
        this.simulationInterval = new SimulationInterval(dataArray);
        // console.log(this.simulationInterval.toString());
    }

    _calculateCurrentSimulationTime() {
        let now = getNow();
        return statusObject.startTimeOfSimulation + (now - statusObject.startTimeOfReal) * 0.001 * this.simulatingSpeed;
    }

    _replay() {
        // console.log("replay");
        if (statusObject.isPaused) return;

        let eventsToFire = [];
        statusObject.currentTimeOfSimulation = this._calculateCurrentSimulationTime();

        while (!statusObject.isFinished) {
            let currentData = this.data[statusObject.dataIndex];
            if (currentData.timestamp < statusObject.currentTimeOfSimulation) {
                eventsToFire.push(currentData);
                statusObject.dataIndex++;
                statusObject.isFinished = !(statusObject.dataIndex < this.data.length);
            } else {
                break;
            }
        }

        if (eventsToFire.length > 0) {
            for (let i = 0; i < eventsToFire.length; ++i) {
                let data = eventsToFire[i];
                // this.fire("replay", {data: data, index: statusObject.dataIndex - eventsToFire.length + i});
                this.fire({
                    type: "replay",
                    data: {data: data, index: statusObject.dataIndex - eventsToFire.length + i}
                });
            }
        }

        if (statusObject.isFinished) {
            if (this._replayTimer) {
                clearInterval(this._replayTimer);
                this._replayTimer = null;
            }
            this.fire("did-finish");
        }

    }

    start() {
        console.log("start");

        this.fire("will-start");

        if (this._replayTimer) {
            clearInterval(this._replayTimer);
            this._replayTimer = null;
        }

        statusObject.isPaused = false;
        statusObject.dataIndex = 0;
        statusObject.isFinished = !(statusObject.dataIndex < this.data.length);

        let now = getNow();
        statusObject.startTimeOfReal = now;
        statusObject.startTimeOfSimulation = this.simulationInterval.start - 0.2;
        statusObject.currentTimeOfReal = now;

        this._replayTimer = setInterval(() => {
            this._replay();
        }, SIMULATOR_TIMER_RATE);

        this.fire("did-start");
    }

    pause() {
        console.log("pause");
        if (statusObject.isPaused) return;

        statusObject.isPaused = true;
        this.fire("did-pause");
    }

    resume() {
        if (!statusObject.isPaused) return;
        console.log("resume");

        this.fire("will-resume");
        statusObject.isPaused = false;

        let now = getNow();
        statusObject.startTimeOfReal = now;
        statusObject.startTimeOfSimulation = statusObject.currentTimeOfSimulation;

        this.fire("did-resume");
    }

    cancel() {
        console.log("cancel");
        if (this._replayTimer) {
            clearInterval(this._replayTimer);
            this._replayTimer = null;
        }
        this.fire("did-cancel");
    }

}

export {simulator}
