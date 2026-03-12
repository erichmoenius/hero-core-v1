export class Loop {

  constructor(update, render) {

    this.update = update;
    this.render = render;

    this.isRunning = false;
    this.lastTime = 0;

  }

  start() {

    if (this.isRunning) return;

    this.isRunning = true;

    requestAnimationFrame((t) => this.tick(t));

  }

  tick(time) {

    if (!this.isRunning) return;

    const delta = (time - this.lastTime) * 0.001;

    this.lastTime = time;

    this.update(delta);
    this.render();

    requestAnimationFrame((t) => this.tick(t));

  }

  stop() {

    this.isRunning = false;

  }

}