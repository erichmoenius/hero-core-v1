export class Loop {
  constructor(update, render) {
    this.update = update;
    this.render = render;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  tick() {
    if (!this.isRunning) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.tick());
  }

  stop() {
    this.isRunning = false;
  }
}