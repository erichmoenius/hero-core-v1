import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ThemeManager } from "../engine/ThemeManager.js";

import { ColorTheme } from "../themes/ColorTheme.js";
import { SeasonsTheme } from "../themes/SeasonsTheme.js";
import { ImageTheme } from "../themes/ImageTheme.js";

export class App {

  constructor() {

    // Core Systems
    this.renderer = new Renderer();
    this.scroll = new ScrollController();
    this.stateManager = new StateManager();
    this.themeManager = new ThemeManager(this.renderer);

    // Register Themes
    this.themeManager.register("color", ColorTheme);
    this.themeManager.register("seasons", SeasonsTheme);
    this.themeManager.register("image", ImageTheme);

    this.themeManager.activate("color");

    // Intensity
    this.isBoosting = false;
    this.intensity = 0;

    this.setupInput();
    this.setupThemeSwitching();

    // Main Loop
    this.loop = new Loop(
      this.update.bind(this),
      this.renderer.render.bind(this.renderer)
    );

    this.loop.start();
  }

  setupInput() {
    window.addEventListener("mousedown", () => {
      this.isBoosting = true;
    });

    window.addEventListener("mouseup", () => {
      this.isBoosting = false;
    });
  }

  setupThemeSwitching() {
    window.addEventListener("keydown", (e) => {

      if (e.code === "Digit1") {
        this.themeManager.activate("color");
      }

      if (e.code === "Digit2") {
        this.themeManager.activate("seasons");
      }

      if (e.code === "Digit3") {
        this.themeManager.activate("image");
      }

    });
  }

  update() {

    const progress = this.scroll.getProgress();

    this.stateManager.update(progress);

    const state = this.stateManager.get();

    // Smooth intensity
    if (this.isBoosting) {
      this.intensity += 0.04;
    } else {
      this.intensity -= 0.04;
    }

    if (this.intensity < 0) this.intensity = 0;
    if (this.intensity > 1) this.intensity = 1;

    // Direktes Objekt ohne Spread
    state.intensity = this.intensity;

    this.themeManager.update(state);
  }

}