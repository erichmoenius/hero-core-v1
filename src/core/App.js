import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ColorTheme } from "../themes/ColorTheme.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
    this.scroll = new ScrollController();
    this.stateManager = new StateManager();

    this.theme = new ColorTheme(this.renderer);
    this.theme.init();

    this.loop = new Loop(
      () => this.update(),
      () => this.renderer.render()
    );

    this.loop.start();
  }

  update() {
    const progress = this.scroll.getProgress();
    this.stateManager.update(progress);

    const state = this.stateManager.getStateData();

    this.theme.update(state);
  }
}