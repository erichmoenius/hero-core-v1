import * as THREE from "three";

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

// ------------------------------------------------
// RENDERER
// ------------------------------------------------

this.renderer = new Renderer();
this.scene = this.renderer.scene;
this.camera = this.renderer.camera;


// ------------------------------------------------
// BACKGROUND
// ------------------------------------------------

this.world = new ShaderWorld(this.scene);
this.stars = new Starfield(this.scene);


// ------------------------------------------------
// PORTAL + THEME STAGE
// ------------------------------------------------

this.stage = new ThemeStage(this.scene);

this.portal = new GlassPortal(
  this.scene,
  this.renderer.renderTarget.texture
);

this.renderer.portal = this.portal;
this.renderer.stage = this.stage;


// ------------------------------------------------
// CORE SYSTEMS
// ------------------------------------------------

this.scroll = new ScrollController();
this.stateManager = new StateManager();

this.themeManager = new ThemeManager(
  this.stage.getContent()
);


// ------------------------------------------------
// THEMES
// ------------------------------------------------

this.themeManager.register("seasons", SeasonsTheme);
this.themeManager.register("images", ImageTheme);
this.themeManager.register("movies", MoviesTheme);

this.themeManager.activate("seasons");


// ------------------------------------------------
// PARTICLES
// ------------------------------------------------

this.setupParticles();


// ------------------------------------------------
// INPUT
// ------------------------------------------------

this.isBoosting = false;
this.intensity = 0;

this.setupInput();
this.setupThemeSwitching();


// ------------------------------------------------
// LOOP
// ------------------------------------------------

this.loop = new Loop(
  this.update.bind(this),
  this.renderer.render.bind(this.renderer)
);

this.loop.start();

}



// ------------------------------------------------
// PARTICLE SYSTEM
// ------------------------------------------------

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



// ------------------------------------------------
// INPUT HANDLING
// ------------------------------------------------

setupInput(){

window.addEventListener("mousedown",()=>{
  this.isBoosting = true;
});

window.addEventListener("mouseup",()=>{
  this.isBoosting = false;
});

}



// ------------------------------------------------
// THEME SWITCHING (anti-spam)
// ------------------------------------------------

setupThemeSwitching(){

let lastSwitch = 0;

window.addEventListener("keydown",(e)=>{

  if(e.repeat) return;

  const now = performance.now();
  if(now - lastSwitch < 150) return;
  lastSwitch = now;

  if(e.code === "Digit1"){
    this.themeManager.activate("seasons");
  }

  else if(e.code === "Digit2"){
    this.themeManager.activate("images");
  }

  else if(e.code === "Digit3"){
    this.themeManager.activate("movies");
    console.log("Movies theme activated");
  }

});

}



// ------------------------------------------------
// MAIN UPDATE LOOP
// ------------------------------------------------

update(delta){

// ------------------------------------------------
// SCROLL + STATE
// ------------------------------------------------

this.scroll.updateScroll();

const progress = this.scroll.getProgress();

this.stateManager.update(progress);

const state = this.stateManager.get();

state.progress = progress;


// ------------------------------------------------
// INTENSITY
// ------------------------------------------------

if(this.isBoosting){
  this.intensity += 0.04;
}else{
  this.intensity -= 0.04;
}

this.intensity = Math.max(0,Math.min(1,this.intensity));

state.intensity = this.intensity;


// ------------------------------------------------
// CAMERA (adaptive per theme)
// ------------------------------------------------

if(this.camera){

  const t = performance.now() * 0.001;
  const p = state.progress ?? 0;

  let camStrength = 0.15;
  let depthStrength = 1.2;

  if(this.themeManager.activeTheme instanceof MoviesTheme){
    camStrength = 1.0;
    depthStrength = 3.5;
  }

  const targetX = Math.sin(t * 0.4) * 0.8 * camStrength;
  const targetY = Math.cos(t * 0.3) * 0.5 * camStrength;
  const targetZ = 5 - p * depthStrength;

  const scrollOffset = (p - 0.5) * 1.5 * camStrength;

  this.camera.position.x += (targetX + scrollOffset - this.camera.position.x) * 0.08;
  this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
  this.camera.position.z += (targetZ - this.camera.position.z) * 0.12;

  this.camera.lookAt(0,0,0);
}


// ------------------------------------------------
// SYSTEM UPDATES
// ------------------------------------------------

this.themeManager.update(state);

this.stars.update();
this.world.update();

this.portal.update(delta);


// ------------------------------------------------
// PARTICLES
// ------------------------------------------------

this.points.rotation.y += 0.0003 + this.intensity * 0.001;

if(this.material?.uniforms?.uTime){
  this.material.uniforms.uTime.value += 0.01;
}

}

}