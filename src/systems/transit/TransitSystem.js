import WormholeTransit from "./WormholeTransit.js";
export default class TransitSystem {
  constructor() {
    this.active = false;

    this.type = null;

    this.currentTransit = null;
  }

  start(type) {
    this.active = true;

    this.type = type;

    if (type === "wormhole") {
      this.currentTransit = new WormholeTransit();

      this.currentTransit.start();
    }

    console.log("Transit started:", type);
  }

  stop() {
    this.active = false;

    this.type = null;

    console.log("Transit stopped");
  }

  update(delta) {
    if (!this.active) return;
  }

  isActive() {
    return this.active;
  }

  getType() {
    return this.type;
  }
}
