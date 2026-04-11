import * as THREE from "three";
import GUI from "lil-gui";
import Stats from "stats.js";

import { getNames, getVideo } from "../media/videoLibrary.js";

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
import { SpaceTheme } from "../themes/SpaceTheme.js";

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";

export class App {

constructor(){

// ---------------- RENDERER ----------------
this.renderer = new Renderer();
this.scene = this.renderer.scene;
this.camera = this.renderer.camera;


// ---------------- BACKGROUND ----------------
this.world = new ShaderWorld(this.scene);
this.stars = new Starfield(this.scene);


// ---------------- STAGE ----------------
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
this.themeManager.register("space", SpaceTheme);

this.themeManager.activate("seasons");


// ---------------- PARTICLES ----------------
this.setupParticles();


// ---------------- INPUT ----------------
this.isBoosting = false;
this.intensity = 0;

this.mouse = new THREE.Vector2();
this.mouseTarget = new THREE.Vector2();

this.setupInput();
this.setupMouse();
this.setupThemeSwitching();
this.setupGuiToggle();


// ---------------- SETTINGS ----------------
this.settings = {
  baseOpacity: 1.0,
  midOpacity: 1.0,
  energyOpacity: 0.6,
  zoomStrength: 1.5,
  motionStrength: 1.0
};

this.targetSettings = { ...this.settings };


// ---------------- PRESETS ----------------
this.presets = {
  calm: {
    baseOpacity: 1.2,
    midOpacity: 0.8,
    energyOpacity: 0.3,
    zoomStrength: 1.0,
    motionStrength: 0.5
  },
  cinematic: {
    baseOpacity: 0.9,
    midOpacity: 1.2,
    energyOpacity: 0.5,
    zoomStrength: 1.5,
    motionStrength: 1.0
  },
  intense: {
    baseOpacity: 0.7,
    midOpacity: 1.0,
    energyOpacity: 1.0,
    zoomStrength: 2.0,
    motionStrength: 1.5
  }
};


// ---------------- GUI STATE ----------------
this.guiControls = {
  preset: "cinematic"
};


// ---------------- VIDEO PICKER ----------------
const baseList = getNames("base");
const midList = getNames("mid");
const energyList = getNames("energy");

this.videoControls = {
  base: baseList[0] ?? "",
  mid: midList[0] ?? "",
  energy: energyList[0] ?? ""
};


// ---------------- GUI ----------------
this.gui = new GUI();

// PRESET
this.presetController = this.gui
  .add(this.guiControls, "preset", ["calm","cinematic","intense"])
  .name("Preset")
  .onChange((v)=> this.applyPreset(v));

// OPACITY
this.gui.add(this.settings, "baseOpacity", 0, 2, 0.01);
this.gui.add(this.settings, "midOpacity", 0, 2, 0.01);
this.gui.add(this.settings, "energyOpacity", 0, 2, 0.01);

// MOTION
this.gui.add(this.settings, "zoomStrength", 0, 3, 0.1);
this.gui.add(this.settings, "motionStrength", 0, 2, 0.1);

// VIDEO PICKER
this.gui.add(this.videoControls, "base", baseList)
  .name("Base Video")
  .onChange((name)=> this.setVideoSafe("base", name));

this.gui.add(this.videoControls, "mid", midList)
  .name("Mid Video")
  .onChange((name)=> this.setVideoSafe("mid", name));

this.gui.add(this.videoControls, "energy", energyList)
  .name("Energy Video")
  .onChange((name)=> this.setVideoSafe("energy", name));

// GUI FIX
this.gui.domElement.style.zIndex = "10";
this.gui.domElement.style.pointerEvents = "auto";
this.gui.hide();


// ---------------- STATS ----------------
this.stats = new Stats();
this.stats.showPanel(0);
document.body.appendChild(this.stats.dom);


// ---------------- LOOP ----------------
this.loop = new Loop(
  this.update.bind(this),
  this.renderer.render.bind(this.renderer)
);

this.loop.start();

}


// ---------------- PRESET ----------------
applyPreset(name){

const preset = this.presets[name];
if(!preset) return;

this.guiControls.preset = name;

Object.assign(this.targetSettings, preset);

this.presetController.updateDisplay();

}


// ---------------- VIDEO ----------------
setVideoSafe(layer, name){

const theme = this.themeManager.activeTheme;
if(!theme?.setVideo) return;

const v = getVideo(layer, name);
if(!v) return;

theme.setVideo(layer, v.path);

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

canvas.style.pointerEvents = "auto";

canvas.addEventListener("mousedown", ()=> this.isBoosting = true);
window.addEventListener("mouseup", ()=> this.isBoosting = false);

}


// ---------------- MOUSE ----------------
setupMouse(){

window.addEventListener("mousemove",(e)=>{

  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;

  this.mouseTarget.set(x, -y);

});

}


// ---------------- GUI TOGGLE ----------------
setupGuiToggle(){

window.addEventListener("keydown",(e)=>{
  if(e.code === "KeyG"){
    this.gui._hidden ? this.gui.show() : this.gui.hide();
  }
});

}


// ---------------- THEME SWITCH ----------------
setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

  if(e.repeat) return;

  if(e.code === "Digit1") this.themeManager.activate("seasons");
  if(e.code === "Digit2") this.themeManager.activate("images");

  if(e.code === "Digit3"){
    this.themeManager.activate("movies");
    this.setVideoSafe("base", this.videoControls.base);
    this.setVideoSafe("mid", this.videoControls.mid);
    this.setVideoSafe("energy", this.videoControls.energy);
  }

  if(e.code === "Digit4"){
    this.themeManager.activate("space");
  }

});

}


// ---------------- CAMERA ----------------
updateCamera(state){

const t = performance.now() * 0.001;
const p = state.progress ?? 0;
const i = state.intensity ?? 0;

// smooth mouse
this.mouse.lerp(this.mouseTarget, 0.05);

let camStrength = 0.15;
let targetZ = 5;
let mouseInfluence = 0.4;

if(this.themeManager.activeTheme instanceof MoviesTheme){
  camStrength = 1.0;
  targetZ = 5 - p * 3.5;
  mouseInfluence = 0.8;
}
else if(this.themeManager.activeTheme instanceof SpaceTheme){
  camStrength = 0.4;
  targetZ = 2 - p * 20;
  mouseInfluence = 0.2;
}

const mouseX = this.mouse.x * mouseInfluence;
const mouseY = this.mouse.y * mouseInfluence;

const targetX =
  Math.sin(t * 0.4) * 0.8 * camStrength + mouseX;

const targetY =
  Math.cos(t * 0.3) * 0.5 * camStrength + mouseY;

targetZ -= i * 1.5;

this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
this.camera.position.z += (targetZ - this.camera.position.z) * 0.12;

this.camera.lookAt(0,0,-4);

}


// ---------------- UPDATE ----------------
update(delta){

this.stats.begin();

// STATE
this.scroll.updateScroll();
const progress = this.scroll.getProgress();

this.stateManager.update(progress);
const state = this.stateManager.get();

state.progress = progress;


// INTENSITY
this.intensity += this.isBoosting ? 0.04 : -0.04;
this.intensity = THREE.MathUtils.clamp(this.intensity, 0, 1);

state.intensity = this.intensity;
state.settings = this.settings;


// 🔥 SMOOTH PRESET
const speeds = {
  baseOpacity: 0.03,
  midOpacity: 0.05,
  energyOpacity: 0.08,
  zoomStrength: 0.02,
  motionStrength: 0.04
};

for(const key in this.settings){
  const s = speeds[key] ?? 0.05;
  this.settings[key] +=
    (this.targetSettings[key] - this.settings[key]) * s;
}


// CAMERA
this.updateCamera(state);


// SYSTEMS
this.themeManager.update(state);
this.stars.update();
this.world.update();
this.portal.update(delta);


// PARTICLES
this.points.rotation.y += 0.0003 + this.intensity * 0.001;

if(this.material?.uniforms?.uTime){
  this.material.uniforms.uTime.value += 0.01;
}

this.stats.end();

}

}