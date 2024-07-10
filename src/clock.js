export class Clock {

    #delta = 0;
    #newTime = 0;

	constructor(autoStart = true) {
		this.autoStart = autoStart;
		this.startTime = 0;
        this.endTime = 0;
		this.lastTime = 0;
		this.totalTime = 0;
		this.running = false;
	}

	start() {
		this.startTime = performance.now();
		this.lastTime = this.startTime;
		this.totalTime = 0;
		this.running = true;
	}

	stop() {
        this.endTime = performance.now();
		this.running = false;
		this.autoStart = false;
	}

	totalTime() {
        if (this.running)
            return performance.now() - this.startTime;
		return this.endTime - this.startTime;
	}

	getDelta() {
        if (this.autoStart && !this.running) {
            this.start();
			return 0;
		}

        this.#delta = 0
		if (this.running) {
            this.#newTime = performance.now();
			this.#delta = (this.#newTime - this.lastTime) / 1000;
            this.lastTime = this.#newTime;
		}
		return this.#delta;
	}

}