import * as THREE from "three";

import { Renderer } from "../graphics/Renderer.js";
import { ShaderWorld } from "../graphics/ShaderWorld.js";

import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ThemeManager } from "../engine/ThemeManager.js";

import { ColorTheme } from "../themes/ColorTheme.js";
import { SeasonsTheme } from "../themes/SeasonsTheme.js";
import { ImageTheme } from "../themes/ImageTheme.js";

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";
import { ThemeStage } from "../graphics/ThemeStage.js";

export class App {

  constructor() {

  // Renderer
  this.renderer = new Renderer();

  // ShaderWorld (Background)
  this.world = new ShaderWorld(this.renderer.scene);

  // Theme Stage (Center Square)
  this.stage = new ThemeStage(this.renderer.scene);

  // Core Systems
  this.scroll = new ScrollController();
  this.stateManager = new StateManager();
  this.themeManager = new ThemeManager(this.renderer);

  // Themes
  this.themeManager.register("color", ColorTheme);
  this.themeManager.register("seasons", SeasonsTheme);
  this.themeManager.register("image", ImageTheme);

  this.themeManager.activate("color");

  // Particles
  this.setupParticles();

  // Interaction
  this.isBoosting = false;
  this.intensity = 0;

  this.setupInput();
  this.setupThemeSwitching();

  // Loop
  this.loop = new Loop(
    this.update.bind(this),
    this.renderer.render.bind(this.renderer)
  );

  this.loop.start();

}

  setupParticles(){

    const scene = this.renderer.scene;
    const N = 6000;

    this.field = createParticleField(N);
    this.material = createParticleMaterial();

    this.points = new THREE.Points(
      this.field.geometry,
      this.material
    );

    scene.add(this.points);

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

  update(delta) {

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

  state.intensity = this.intensity;

  this.themeManager.update(state);

  // ShaderWorld bewegen
  this.world.update();

  // Partikel leicht drehen
  this.points.rotation.y += 0.0004;

  // Particle Shader Zeit
  this.material.uniforms.uTime.value += 0.01;

  }

}