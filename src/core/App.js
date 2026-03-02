import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ThemeManager } from "../engine/ThemeManager.js";
import { ColorTheme } from "../themes/ColorTheme.js";
import { SeasonsTheme } from "../themes/SeasonsTheme.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
    this.scroll = new ScrollController();
    this.stateManager = new StateManager();

    this.themeManager = new ThemeManager(this.renderer);
    this.themeManager.register("color", ColorTheme);
    this.themeManager.register("seasons", SeasonsTheme);

    this.themeManager.activate("color");

    // 👇 HIER rein
    window.addEventListener("keydown", (e) => {
      if (e.code === "Digit1") {
        this.themeManager.activate("color");
      }

      if (e.code === "Digit2") {
        this.themeManager.activate("seasons");
      }
    });

    this.loop = new Loop(
      () => this.update(),
      () => this.renderer.render()
    );

    this.loop.start();
  }

  update() {
    const progress = this.scroll.getProgress();
    this.stateManager.update(progress);
    const state = this.stateManager.get();
    this.themeManager.update(state);
  }
}