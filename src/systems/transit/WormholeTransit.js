export default class WormholeTransit {
  constructor() {
    this.time = 0;
  }

  start() {
    console.log("🌀 Wormhole opened");
  }

  stop() {
    console.log("🌀 Wormhole closed");
  }

  update(delta) {
    this.time += delta;
  }
}
