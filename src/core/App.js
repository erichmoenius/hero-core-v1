import * as THREE from "three";
import Stats from "stats.js";
import GUI from "lil-gui";

import { Renderer } from "../graphics/Renderer.js";
import { ShaderWorld } from "../graphics/ShaderWorld.js";
import { Starfield } from "../graphics/Starfield.js";
import { GlassPortal } from "../graphics/GlassPortal.js";
import { ThemeStage } from "../graphics/ThemeStage.js";

import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { ThemeManager } from "../engine/ThemeManager.js";

import { SeasonsTheme } from "../themes/SeasonsTheme.js";
import { MoviesTheme } from "../themes/MoviesTheme.js";
import { ImageTheme } from "../themes/ImageTheme.js";
import { SpaceTheme } from "../themes/SpaceTheme.js";

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";

export class App {

constructor(){

// ---------- CORE ----------
this.renderer = new Renderer();
this.scene = this.renderer.scene;
this.camera = this.renderer.camera;

// ---------- GUI ----------
this.gui = new GUI();
this.gui.title("Hero Core");
this.guiHidden = false;

// ---------- ENV ----------
this.world = new ShaderWorld(this.scene);
this.stars = new Starfield(this.scene);
this.stage = new ThemeStage(this.scene);

this.portal = new GlassPortal(
  this.scene,
  this.renderer.renderTarget.texture
);

// ---------- ENGINE ----------
this.scroll = new ScrollController();

this.themeManager = new ThemeManager(
  this.stage.getContent(),
  this.gui
);

// ---------- THEMES ----------
this.themeManager.register("movies", MoviesTheme);
this.themeManager.register("images", ImageTheme);
this.themeManager.register("space", SpaceTheme);
this.themeManager.register("seasons", SeasonsTheme);

// 🎬 DEFAULT
this.themeManager.activate("movies");

// ---------- PARTICLES ----------
this.setupParticles();

// ---------- INPUT ----------
this.isBoosting = false;
this.intensity = 0;
this._inputInitialized = false;

this.setupInput();
this.setupThemeSwitching();
this.setupGuiToggle();

// ---------- STATS ----------
this.stats = new Stats();
document.body.appendChild(this.stats.dom);

// ---------- LOOP ----------
this.loop = new Loop(
  this.update.bind(this),
  this.renderer.render.bind(this.renderer)
);

this.loop.start();

}


// ---------- GUI TOGGLE ----------
setupGuiToggle(){

window.addEventListener("keydown",(e)=>{

  if(e.code === "KeyG"){
    this.guiHidden = !this.guiHidden;
    this.gui.domElement.style.display = this.guiHidden ? "none" : "block";
  }

});

}


// ---------- PARTICLES ----------
setupParticles(){

const geo = createParticleField(6000);
const mat = createParticleMaterial();

this.points = new THREE.Points(geo.geometry, mat);
this.material = mat;

this.scene.add(this.points);

}


// ---------- INPUT ----------
setupInput(){

if(this._inputInitialized) return;
this._inputInitialized = true;

const canvas = this.renderer.renderer?.domElement;

if(!canvas){
  console.error("❌ Canvas not found");
  return;
}

console.log("✅ Input bound to:", canvas);

canvas.addEventListener("pointerdown", () => {
  this.isBoosting = true;
});

window.addEventListener("pointerup", () => {
  this.isBoosting = false;
});

window.addEventListener("pointercancel", () => {
  this.isBoosting = false;
});

}


// ---------- THEME SWITCH ----------
setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

  if(e.repeat) return;

  if(e.code==="Digit1") this.themeManager.activate("movies");
  if(e.code==="Digit2") this.themeManager.activate("images");
  if(e.code==="Digit3") this.themeManager.activate("space");
  if(e.code==="Digit4") this.themeManager.activate("seasons");

});

}


// ---------- ENV ----------
updateEnvironment(){

const theme = this.themeManager.activeTheme;
const env = theme?.getEnvironment ? theme.getEnvironment() : {};

this.world.setActive(env.world ?? true);

if(this.stars?.points){
  this.stars.points.visible = env.stars ?? true;
}

this.renderer.portal = env.portal ? this.portal : null;

if(this.stage?.mesh){
  this.stage.mesh.visible = env.stage ?? true;
}

}


// ---------- CAMERA ----------
updateCamera(){

if(this.themeManager.activeTheme instanceof SpaceTheme){
  this.camera.position.set(0,0,5);
  this.camera.lookAt(0,0,-4);
  return;
}

const t = performance.now()*0.001;

this.camera.position.x = Math.sin(t*0.3)*0.2;
this.camera.position.y = Math.cos(t*0.2)*0.2;

this.camera.lookAt(0,0,-4);

}


// ---------- STATE ----------
buildState(time){

const p = this.scroll.getProgress();

// legacy support (Seasons)
const states = ["state1","state2","state3","state4"];
const scaled = p * (states.length - 1);

const index = Math.floor(scaled);
const nextIndex = Math.min(index + 1, states.length - 1);

return {
  progress: p,
  intensity: this.intensity,
  time,

  current: states[index],
  next: states[nextIndex],
  blend: scaled - index
};

}


// ---------- UPDATE ----------
update(){

this.stats.begin();

// time
const time = performance.now() * 0.001;

// scroll
this.scroll.updateScroll();

// intensity (smooth cinematic)
const target = this.isBoosting ? 1 : 0;
this.intensity += (target - this.intensity) * 0.08;
this.intensity = THREE.MathUtils.clamp(this.intensity, 0, 1);

// state
const state = this.buildState(time);

// camera
this.updateCamera();

// theme update (safe)
if(this.themeManager?.update){
  try{
    this.themeManager.update(state);
  }catch(e){
    console.error("Theme crash:", e);
  }
}

// env
this.updateEnvironment();

// systems
this.world.update();
this.stars.update();

// particles
this.points.rotation.y += 0.0003 + this.intensity * 0.001;

if(this.material?.uniforms?.uTime){
  this.material.uniforms.uTime.value += 0.01;
}

this.stats.end();

}

}