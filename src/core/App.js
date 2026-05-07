import * as THREE from "three";
import Stats from "stats.js";
import GUI from "lil-gui";

import { Renderer } from "../graphics/Renderer.js";
import { ShaderWorld } from "../graphics/ShaderWorld.js";
import { Starfield } from "../graphics/Starfield.js";
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

// ------------------------------------------------
// 🎬 CORE
// ------------------------------------------------
this.renderer = new Renderer();

this.scene = this.renderer.scene;
this.camera = this.renderer.camera;

// 🔥 portal disabled
this.renderer.portal = null;


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------
this.gui = new GUI();

this.gui.title("Hero Core");

this.guiHidden = false;


// ------------------------------------------------
// 🎥 CINEMATIC SETTINGS
// ------------------------------------------------
this.cinematic = {

  parallaxStrength: 0.25,

  masterBoost: 1.0,

  flightSpeed: 0.05,

  flightDamping: 0.92,

  idleCameraMotion: 0.2

};

this.setupCinematicGUI();


// ------------------------------------------------
// 🎧 AUDIO
// ------------------------------------------------
this.audio = new AudioManager();

window.audio = this.audio;

this.setupAudioGUI();


// browser audio unlock
window.addEventListener(
  "pointerdown",
  () => {
    this.audio.context?.resume?.();
  },
  { once: true }
);


// ------------------------------------------------
// 🌍 ENVIRONMENT
// ------------------------------------------------
this.world = new ShaderWorld(this.scene);

this.stars = new Starfield(this.scene);

this.stage = new ThemeStage(this.scene);


// ------------------------------------------------
// 🧠 ENGINE
// ------------------------------------------------
this.scroll = new ScrollController();


// ------------------------------------------------
// 🎨 THEMES
// ------------------------------------------------
this.themeManager = new ThemeManager(
  this.stage.getContent(),
  this.gui
);

this.themeManager.register("movies", MoviesTheme);
this.themeManager.register("space", SpaceTheme);
this.themeManager.register("images", ImageTheme);
this.themeManager.register("seasons", SeasonsTheme);

// 🔥 startup theme
this.themeManager.activate("space");


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------
this.setupParticles();


// ------------------------------------------------
// 🖱️ INPUT
// ------------------------------------------------
this.isBoosting = false;

this.intensity = 0;


// ------------------------------------------------
// 🖱️ PARALLAX
// ------------------------------------------------
this.mouse = { x: 0, y: 0 };

this.parallax = { x: 0, y: 0 };


// ------------------------------------------------
// 🚀 FLIGHT
// ------------------------------------------------
this.mouseVel = { x: 0, y: 0 };

this.flight = {
  x: 0,
  y: 0,
  z: 0
};


// ------------------------------------------------
// ⏱️ TIME
// ------------------------------------------------
this.time = 0;


// ------------------------------------------------
// ⚙️ SETUP
// ------------------------------------------------
this.setupInput();

this.setupMouse();

this.setupThemeSwitching();

this.setupGuiToggle();


// ------------------------------------------------
// 📊 STATS
// ------------------------------------------------
this.stats = new Stats();

document.body.appendChild(this.stats.dom);


// ------------------------------------------------
// 🔁 LOOP
// ------------------------------------------------
this.loop = new Loop(
  this.update.bind(this),
  this.renderer.render.bind(this.renderer)
);

this.loop.start();

}


// ------------------------------------------------
// 🎛️ CINEMATIC GUI
// ------------------------------------------------
setupCinematicGUI(){

const f = this.gui.addFolder("🎬 Cinematic");

f.add(
  this.cinematic,
  "parallaxStrength",
  0,
  1,
  0.01
);

f.add(
  this.cinematic,
  "masterBoost",
  0,
  2,
  0.01
);

f.add(
  this.cinematic,
  "flightSpeed",
  0,
  0.2,
  0.001
);

f.add(
  this.cinematic,
  "flightDamping",
  0.7,
  0.99,
  0.001
);

f.add(
  this.cinematic,
  "idleCameraMotion",
  0,
  1,
  0.01
);

f.open();

}


// ------------------------------------------------
// 🎧 AUDIO GUI
// ------------------------------------------------
setupAudioGUI(){

const f = this.gui.addFolder("🎧 Audio");


// ------------------------------------------------
// 🎚️ MODE SWITCH
// ------------------------------------------------
f.add({

  file: () => {

    this.audio.switchToFile();

    console.log("🎧 Mode: FILE");

  }

}, "file");


// ------------------------------------------------
// 📂 FILE CONTROLS
// ------------------------------------------------
f.add({

  load: () => this.openAudioFile()

}, "load");

f.add({

  play: () => this.audio.play()

}, "play");

f.add({

  pause: () => this.audio.pause()

}, "pause");


// ------------------------------------------------
// 🎚️ ANALYSER
// ------------------------------------------------
f.add(
  this.audio.settings,
  "smoothing",
  0.01,
  0.95,
  0.01
);

f.open();

}


// ------------------------------------------------
// 📂 AUDIO FILE
// ------------------------------------------------
openAudioFile(){

if(!this.fileInput){

  this.fileInput = document.createElement("input");

  this.fileInput.type = "file";

  this.fileInput.accept = "audio/*";

  this.fileInput.style.display = "none";

  this.fileInput.onchange = async (e)=>{

    const file = e.target.files?.[0];

    if(!file) return;

    try{

      await this.audio.load(file);

      this.audio.play();

      console.log("🎵 Loaded:", file.name);

    }catch(err){

      console.error("Audio load failed:", err);

    }

    this.fileInput.value = "";

  };

  document.body.appendChild(this.fileInput);

}

this.fileInput.click();

}


// ------------------------------------------------
// 🧰 GUI TOGGLE
// ------------------------------------------------
setupGuiToggle(){

window.addEventListener("keydown",(e)=>{

  if(e.code !== "KeyG") return;

  this.guiHidden = !this.guiHidden;

  this.gui.domElement.style.display =
    this.guiHidden
      ? "none"
      : "block";

});

}


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------
setupParticles(){

const geo = createParticleField(6000);

const mat = createParticleMaterial();

this.points = new THREE.Points(
  geo.geometry,
  mat
);

this.material = mat;

this.scene.add(this.points);

}


// ------------------------------------------------
// 🖱️ INPUT
// ------------------------------------------------
setupInput(){

const canvas = this.renderer.renderer.domElement;

canvas.addEventListener(
  "pointerdown",
  () => {

    this.isBoosting = true;

  }
);

window.addEventListener(
  "pointerup",
  () => {

    this.isBoosting = false;

  }
);

window.addEventListener(
  "pointercancel",
  () => {

    this.isBoosting = false;

  }
);

}


// ------------------------------------------------
// 🖱️ MOUSE
// ------------------------------------------------
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


// ------------------------------------------------
// 🎬 THEME SWITCH
// ------------------------------------------------
setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

  if(e.repeat) return;

  if(e.code === "Digit1"){
    this.themeManager.activate("movies");
  }

  if(e.code === "Digit2"){
    this.themeManager.activate("space");
  }

  if(e.code === "Digit3"){
    this.themeManager.activate("images");
  }

  if(e.code === "Digit4"){
    this.themeManager.activate("seasons");
  }

});

}


// ------------------------------------------------
// 🌍 ENVIRONMENT
// ------------------------------------------------
updateEnvironment(){

const theme = this.themeManager.activeTheme;

const env =
  theme?.getEnvironment
    ? theme.getEnvironment()
    : {};


// shader world
this.world.setActive(
  env.world ?? true
);


// stars
if(this.stars?.points){

  this.stars.points.visible =
    env.stars ?? true;

}


// portal OFF
this.renderer.portal = null;


// stage
if(this.stage?.mesh){

  this.stage.mesh.visible =
    env.stage ?? true;

}

}


// ------------------------------------------------
// 🎥 CAMERA
// ------------------------------------------------
updateCamera(){

const t = this.time;


// ------------------------------------------------
// 🖱️ SMOOTH PARALLAX
// ------------------------------------------------
this.parallax.x +=
  (this.mouse.x - this.parallax.x) * 0.08;

this.parallax.y +=
  (this.mouse.y - this.parallax.y) * 0.08;


// ------------------------------------------------
// 🚀 BOOST FLIGHT
// ------------------------------------------------
if(this.isBoosting){

  this.flight.x +=
    this.mouseVel.x * 0.5;

  this.flight.y +=
    this.mouseVel.y * 0.5;

  this.flight.z -=
    this.cinematic.flightSpeed;

}


// ------------------------------------------------
// 🌊 DAMPING
// ------------------------------------------------
this.flight.x *=
  this.cinematic.flightDamping;

this.flight.y *=
  this.cinematic.flightDamping;

this.flight.z *= 0.96;


// ------------------------------------------------
// 🎬 BASE CAMERA MOTION
// ------------------------------------------------
const px =
  this.parallax.x *
  this.cinematic.parallaxStrength;

const py =
  this.parallax.y *
  this.cinematic.parallaxStrength;

const idle =
  this.cinematic.idleCameraMotion;

this.camera.position.x =
  Math.sin(t * 0.3) * idle +
  px +
  this.flight.x;

this.camera.position.y =
  Math.cos(t * 0.2) * idle +
  py +
  this.flight.y;

this.camera.position.z =
  5 +
  this.flight.z;

this.camera.lookAt(0,0,-4);

}


// ------------------------------------------------
// 🧠 STATE
// ------------------------------------------------
buildState(){

const p =
  this.scroll.getProgress();

const boostedIntensity =
  this.intensity *
  (1 + this.cinematic.masterBoost * 2);

return {

  progress: p,

  intensity: boostedIntensity,

  time: this.time,

  parallax: this.parallax,

  flight: this.flight,

  audio: this.audio.getState()

};

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------
update(){

this.stats.begin();


// ------------------------------------------------
// ⏱️ TIME
// ------------------------------------------------
this.time =
  performance.now() * 0.001;


// ------------------------------------------------
// 🧠 SYSTEMS
// ------------------------------------------------
this.scroll.updateScroll();

this.audio.update();


// ------------------------------------------------
// ⚡ INTENSITY
// ------------------------------------------------
const target =
  this.isBoosting ? 1 : 0;

this.intensity +=
  (target - this.intensity) * 0.08;

this.intensity =
  THREE.MathUtils.clamp(
    this.intensity,
    0,
    1
  );


// ------------------------------------------------
// 📦 STATE
// ------------------------------------------------
const state =
  this.buildState();


// ------------------------------------------------
// 🎥 CAMERA
// ------------------------------------------------
this.updateCamera();


// ------------------------------------------------
// 🎬 THEME CAMERA OVERRIDE
// ------------------------------------------------
const theme =
  this.themeManager.activeTheme;

if(theme?.updateCamera){

  theme.updateCamera(
    this.camera,
    state
  );

}


// ------------------------------------------------
// 🎨 THEME UPDATE
// ------------------------------------------------
try{

  this.themeManager.update(state);

}catch(err){

  console.error(
    "Theme crash:",
    err
  );

}


// ------------------------------------------------
// 🌍 ENVIRONMENT
// ------------------------------------------------
this.updateEnvironment();


// ------------------------------------------------
// 🌌 WORLD SYSTEMS
// ------------------------------------------------
this.world.update();

this.stars.update();


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------
this.points.rotation.y +=
  0.0003 +
  this.intensity * 0.001;

this.points.rotation.x =
  Math.sin(this.time * 0.1) * 0.03;

if(this.material?.uniforms?.uTime){

  this.material.uniforms.uTime.value +=
    0.01;

}


// ------------------------------------------------
// 📊 END STATS
// ------------------------------------------------
this.stats.end();

}

}