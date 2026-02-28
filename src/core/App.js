import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ThemeManager } from "../engine/ThemeManager.js";
import { ColorTheme } from "../themes/ColorTheme.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
    this.scroll = new ScrollController();
    this.stateManager = new StateManager();

    this.themeManager = new ThemeManager(this.renderer);
    this.themeManager.register("color", ColorTheme);

    this.themeManager.activate("color");

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

    console.log(
      "progress:", progress.toFixed(2),
      "current:", state.current,
      "next:", state.next
  );

  this.themeManager.update(state);
}
}