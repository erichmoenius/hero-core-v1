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

import { AudioManager } from "../audio/AudioManager.js";

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

// ---------- CINEMATIC ----------
this.cinematic = {
  parallaxStrength: 0.25,
  masterBoost: 1.0,
  flightSpeed: 0.05,
  flightDamping: 0.92
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

// ---------- AUDIO ----------
this.audio = new AudioManager();
window.audio = this.audio; // debug access

// ---------- THEMES ----------
this.themeManager = new ThemeManager(
  this.stage.getContent(),
  this.gui
);

this.themeManager.register("movies", MoviesTheme);
this.themeManager.register("images", ImageTheme);
this.themeManager.register("space", SpaceTheme);
this.themeManager.register("seasons", SeasonsTheme);

this.themeManager.activate("movies");

// ---------- PARTICLES ----------
this.setupParticles();

// ---------- INPUT ----------
this.isBoosting = false;
this.intensity = 0;

// ---------- PARALLAX ----------
this.mouse = { x: 0, y: 0 };
this.parallax = { x: 0, y: 0 };

// ---------- FLIGHT ----------
this.mouseVel = { x: 0, y: 0 };
this.flight = { x: 0, y: 0, z: 0 };

// ---------- SETUP ----------
this.setupInput();
this.setupMouse();
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
f.add(this.cinematic, "flightSpeed", 0, 0.2, 0.001);
f.add(this.cinematic, "flightDamping", 0.7, 0.99, 0.001);

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

const canvas = this.renderer.renderer.domElement;

canvas.addEventListener("pointerdown", () => this.isBoosting = true);
window.addEventListener("pointerup", () => this.isBoosting = false);
window.addEventListener("pointercancel", () => this.isBoosting = false);

}


// ---------- MOUSE ----------
setupMouse(){

window.addEventListener("pointermove",(e)=>{

  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  const nx = (x - 0.5) * 2;
  const ny = (y - 0.5) * 2;

  this.mouseVel.x = nx - this.mouse.x;
  this.mouseVel.y = ny - this.mouse.y;

  this.mouse.x = nx;
  this.mouse.y = ny;

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

// 🎬 FLIGHT MODE
if(this.isBoosting){
  this.flight.x += this.mouseVel.x * 0.5;
  this.flight.y += this.mouseVel.y * 0.5;
  this.flight.z -= this.cinematic.flightSpeed;
}

// damping (now visible)
this.flight.x *= this.cinematic.flightDamping;
this.flight.y *= this.cinematic.flightDamping;
this.flight.z *= 0.96;

const px = this.parallax.x * this.cinematic.parallaxStrength;
const py = this.parallax.y * this.cinematic.parallaxStrength;

// camera motion
this.camera.position.x = Math.sin(t * 0.3) * 0.2 + px + this.flight.x;
this.camera.position.y = Math.cos(t * 0.2) * 0.2 + py + this.flight.y;
this.camera.position.z = 5 + this.flight.z;

this.camera.lookAt(0,0,-4);

}


// ---------- STATE ----------
buildState(time){

const p = this.scroll.getProgress();

// stronger cinematic intensity
const boostedIntensity =
  this.intensity * (1 + this.cinematic.masterBoost * 2);

return {
  progress: p,
  intensity: boostedIntensity,
  time,
  parallax: this.parallax,
  audio: this.audio.getState()
};

}


// ---------- UPDATE ----------
update(){

this.stats.begin();

const time = performance.now() * 0.001;

// scroll
this.scroll.updateScroll();

// audio
this.audio.update();

// intensity
const target = this.isBoosting ? 1 : 0;
this.intensity += (target - this.intensity) * 0.08;
this.intensity = THREE.MathUtils.clamp(this.intensity, 0, 1);

// state
const state = this.buildState(time);

// camera
this.updateCamera();

// theme (safe)
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