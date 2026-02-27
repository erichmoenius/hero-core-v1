import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";

export class App {
  constructor() {
    this.renderer = new Renderer();

    this.loop = new Loop(
      () => this.update(),
      () => this.renderer.render()
    );

    this.loop.start();
  }

  update() {
    // später: state logic
  }
}