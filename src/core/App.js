import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats.js";

import { Renderer } from "../graphics/Renderer.js";
import { ShaderWorld } from "../graphics/ShaderWorld.js";
import { Starfield } from "../graphics/Starfield.js";
import { GlassPortal } from "../graphics/GlassPortal.js";
import { ThemeStage } from "../graphics/ThemeStage.js";

import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";
import { ThemeManager } from "../engine/ThemeManager.js";

import { SeasonsTheme } from "../themes/SeasonsTheme.js";
import { ImageTheme } from "../themes/ImageTheme.js";
import { MoviesTheme } from "../themes/MoviesTheme.js";

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";

export class App {

constructor(){

// ---------------- RENDERER ----------------

this.renderer = new Renderer();
this.scene = this.renderer.scene;
this.camera = this.renderer.camera;
this.canvas = this.renderer.renderer.domElement;


// ---------------- BACKGROUND ----------------

this.world = new ShaderWorld(this.scene);
this.stars = new Starfield(this.scene);


// ---------------- STAGE + PORTAL ----------------

this.stage = new ThemeStage(this.scene);

this.portal = new GlassPortal(
  this.scene,
  this.renderer.renderTarget.texture
);

this.renderer.portal = this.portal;


// ---------------- CORE ----------------

this.scroll = new ScrollController();
this.stateManager = new StateManager();

this.themeManager = new ThemeManager(
  this.stage.getContent()
);


// ---------------- THEMES ----------------

this.themeManager.register("seasons", SeasonsTheme);
this.themeManager.register("images", ImageTheme);
this.themeManager.register("movies", MoviesTheme);

this.themeManager.activate("seasons");


// ---------------- PARTICLES ----------------

this.setupParticles();


// ---------------- INPUT ----------------

this.isBoosting = false;
this.intensity = 0;

this.setupInput();
this.setupThemeSwitching();
this.setupGuiToggle();


// ---------------- GUI ----------------

this.settings = {
  baseOpacity: 0.4,
  midOpacity: 0.5,
  energyOpacity: 0.2,
  zoomStrength: 1.5,
  motionStrength: 1.0
};

this.gui = new GUI();

this.gui.add(this.settings, "baseOpacity", 0, 1, 0.01);
this.gui.add(this.settings, "midOpacity", 0, 1, 0.01);
this.gui.add(this.settings, "energyOpacity", 0, 1, 0.01);
this.gui.add(this.settings, "zoomStrength", 0, 3, 0.1);
this.gui.add(this.settings, "motionStrength", 0, 2, 0.1);

this.gui.hide();

// ------------------------------------------------
// 📊 STATS (FPS MONITOR)
// ------------------------------------------------

this.stats = new Stats();
this.stats.showPanel(0); // 0 = FPS, 1 = MS, 2 = MB

document.body.appendChild(this.stats.dom);


// ---------------- LOOP ----------------

this.loop = new Loop(
  this.update.bind(this),
  this.renderer.render.bind(this.renderer)
);

this.loop.start();

}


// ---------------- PARTICLES ----------------

setupParticles(){

const N = 6000;

this.field = createParticleField(N);
this.material = createParticleMaterial();

this.points = new THREE.Points(
  this.field.geometry,
  this.material
);

this.scene.add(this.points);

}


// ---------------- INPUT ----------------

setupInput(){

const canvas = this.renderer.renderer.domElement;

if(!canvas){
  console.warn("Canvas not found");
  return;
}

canvas.addEventListener("mousedown",()=>{
  this.isBoosting = true;
});

window.addEventListener("mouseup",()=>{
  this.isBoosting = false;
});

}


// ---------------- GUI TOGGLE ----------------

setupGuiToggle(){

window.addEventListener("keydown",(e)=>{

  if(e.code === "KeyG"){

    if(this.gui._hidden){
      this.gui.show();
    }else{
      this.gui.hide();
    }

  }

});

}


// ---------------- THEME SWITCH ----------------

setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

  if(e.repeat) return;

  if(e.code === "Digit1"){
    this.themeManager.activate("seasons");
  }

  if(e.code === "Digit2"){
    this.themeManager.activate("images");
  }

  if(e.code === "Digit3"){
    this.themeManager.activate("movies");
    console.log("Movies theme activated");
  }

});

}


// ---------------- UPDATE ----------------

update(delta){

// 📊 START MEASURE
this.stats.begin();  

// SCROLL

this.scroll.updateScroll();
const progress = this.scroll.getProgress();

this.stateManager.update(progress);
const state = this.stateManager.get();

state.progress = progress;


// INTENSITY

if(this.isBoosting){
  this.intensity += 0.04;
}else{
  this.intensity -= 0.04;
}

this.intensity = THREE.MathUtils.clamp(this.intensity, 0, 1);

state.intensity = this.intensity;
state.settings = this.settings;


// CAMERA

if(this.camera){

  const t = performance.now() * 0.001;
  const p = state.progress ?? 0;
  const i = state.intensity ?? 0;

  let camStrength = 0.15;
  let depthStrength = 1.2;

  if(this.themeManager.activeTheme instanceof MoviesTheme){
    camStrength = 1.0;
    depthStrength = 3.5;
  }

  const targetX = Math.sin(t * 0.4) * 0.8 * camStrength;
  const targetY = Math.cos(t * 0.3) * 0.5 * camStrength;

  let targetZ = 5 - p * depthStrength;
  targetZ -= i * 1.5;

  const scrollOffset = (p - 0.5) * 1.5 * camStrength;

  this.camera.position.x += (targetX + scrollOffset - this.camera.position.x) * 0.08;
  this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
  this.camera.position.z += (targetZ - this.camera.position.z) * 0.12;

  this.camera.lookAt(0,0,-4);
}


// SYSTEM

this.themeManager.update(state);

this.stars.update();
this.world.update();

this.portal.update(delta);


// PARTICLES

this.points.rotation.y += 0.0003 + this.intensity * 0.001;

if(this.material?.uniforms?.uTime){
  this.material.uniforms.uTime.value += 0.01;
}

// 📊 END MEASURE
this.stats.end();

}

}