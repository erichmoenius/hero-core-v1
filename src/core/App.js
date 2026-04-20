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

// ---------- GLOBAL CINEMATIC ----------
this.cinematic = {
  parallaxStrength: 0.2, // 🔥 reduced so layer parallax dominates
  masterBoost: 1.0
};

this.setupCinematicGUI();

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

// 🎬 DEFAULT THEME
this.themeManager.activate("movies");

// ---------- PARTICLES ----------
this.setupParticles();

// ---------- INPUT ----------
this.isBoosting = false;
this.intensity = 0;
this._inputInitialized = false;

// ---------- PARALLAX ----------
this.mouse = { x: 0, y: 0 };
this.parallax = { x: 0, y: 0 };

this.setupInput();
this.setupMouseParallax();
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


// ---------- GUI ----------
setupCinematicGUI(){

const f = this.gui.addFolder("🎬 Cinematic");

f.add(this.cinematic, "parallaxStrength", 0, 1, 0.01);
f.add(this.cinematic, "masterBoost", 0, 2, 0.01);

f.open();

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


// ---------- PARALLAX ----------
setupMouseParallax(){

window.addEventListener("pointermove",(e)=>{

  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  this.mouse.x = (x - 0.5) * 2;
  this.mouse.y = (y - 0.5) * 2;

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

const t = performance.now() * 0.001;

// smooth parallax
this.parallax.x += (this.mouse.x - this.parallax.x) * 0.08;
this.parallax.y += (this.mouse.y - this.parallax.y) * 0.08;

const px = this.parallax.x * this.cinematic.parallaxStrength;
const py = this.parallax.y * this.cinematic.parallaxStrength;

if(this.themeManager.activeTheme instanceof SpaceTheme){
  this.camera.position.set(px, py, 5);
  this.camera.lookAt(0,0,-4);
  return;
}

this.camera.position.x = Math.sin(t * 0.3) * 0.2 + px;
this.camera.position.y = Math.cos(t * 0.2) * 0.2 + py;

this.camera.lookAt(0,0,-4);

}


// ---------- STATE ----------
buildState(time){

const p = this.scroll.getProgress();

const states = ["state1","state2","state3","state4"];
const scaled = p * (states.length - 1);

const index = Math.floor(scaled);
const nextIndex = Math.min(index + 1, states.length - 1);

return {
  progress: p,
  intensity: this.intensity * this.cinematic.masterBoost,
  time,
  parallax: this.parallax,

  current: states[index],
  next: states[nextIndex],
  blend: scaled - index
};

}


// ---------- UPDATE ----------
update(){

this.stats.begin();

const time = performance.now() * 0.001;

// scroll
this.scroll.updateScroll();

// intensity
const target = this.isBoosting ? 1 : 0;
this.intensity += (target - this.intensity) * 0.08;
this.intensity = THREE.MathUtils.clamp(this.intensity, 0, 1);

// state
const state = this.buildState(time);

// camera
this.updateCamera();

// theme
try{
  this.themeManager.update(state);
}catch(e){
  console.error("Theme crash:", e);
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