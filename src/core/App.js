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

import AudioManager from "../audio/AudioManager.js";

import { InteractionManager } from "../interactions/InteractionManager.js";

export class App {

  constructor(){

    // ------------------------------------------------
    // 🎬 CORE
    // ------------------------------------------------

    this.renderer = new Renderer();

    this.scene = this.renderer.scene;
    this.camera = this.renderer.camera;

    this.renderer.portal = null;

    // ------------------------------------------------
    // 🎛️ GUI
    // ------------------------------------------------

    this.gui = new GUI();

    this.gui.title("Hero Core");

    // ------------------------------------------------
    // 🎧 AUDIO
    // ------------------------------------------------

    this.audio = new AudioManager();

  window.addEventListener(
  "pointerdown",
  async () => {

    console.log("🎤 Initializing audio...");

    await this.audio.init();

  },
  { once: true }
);

    window.audio = this.audio;

    // ------------------------------------------------
    // 🔓 AUDIO UNLOCK
    // ------------------------------------------------

    window.addEventListener(

      "pointerdown",

      async () => {

        try{

          if(
            this.audio.audioContext &&
            this.audio.audioContext.state === "suspended"
          ){

            await this.audio.audioContext.resume();

            console.log(
              "🔓 AudioContext resumed"
            );

          }

        }catch(err){

          console.error(err);

        }

      },

      { once: true }

    );

    // ------------------------------------------------
    // 🌍 ENVIRONMENT
    // ------------------------------------------------

    this.world =
      new ShaderWorld(this.scene);

    this.stars =
      new Starfield(this.scene);

    this.stage =
      new ThemeStage(this.scene);

    // ------------------------------------------------
    // 🧠 ENGINE
    // ------------------------------------------------

    this.scroll =
      new ScrollController();

    // ------------------------------------------------
    // 🎨 THEMES
    // ------------------------------------------------

    this.themeManager =
      new ThemeManager(

        this.stage.getContent(),

        this.gui

      );

    this.themeManager.register(
      "movies",
      MoviesTheme
    );

    this.themeManager.register(
      "space",
      SpaceTheme
    );

    this.themeManager.register(
      "images",
      ImageTheme
    );

    this.themeManager.register(
      "seasons",
      SeasonsTheme
    );

    // ------------------------------------------------
    // 🚀 START THEME
    // ------------------------------------------------

    this.themeManager.activate(
      "space"
    );

    // ------------------------------------------------
    // ✨ PARTICLES
    // ------------------------------------------------

    this.setupParticles();

    // ------------------------------------------------
    // 🖱️ INTERACTION
    // ------------------------------------------------

    this.interactionManager =
      new InteractionManager(

        document.getElementById(
          "hero-root"
        ),

        this.gui

      );

    this.interactionManager.setMode(
      "trail"
    );

    // ------------------------------------------------
    // 🖱️ INPUT
    // ------------------------------------------------

    this.isBoosting = false;

    this.intensity = 0;

    // ------------------------------------------------
    // 🖱️ MOUSE
    // ------------------------------------------------

    this.mouse = {
      x: 0,
      y: 0
    };

    this.parallax = {
      x: 0,
      y: 0
    };

    this.mouseVel = {
      x: 0,
      y: 0
    };

    this.flight = {
      x: 0,
      y: 0,
      z: 0
    };

    this.wheel = {
      delta: 0
    };

    // ------------------------------------------------
    // 🎬 CINEMATIC
    // ------------------------------------------------

    this.cinematic = {

      parallaxStrength: 0.25,

      masterBoost: 1.0,

      flightSpeed: 0.05,

      flightDamping: 0.92,

      idleCameraMotion: 0.2

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
    this.setupGui();

    // ------------------------------------------------
    // 📊 STATS
    // ------------------------------------------------

    this.stats = new Stats();

    document.body.appendChild(
      this.stats.dom
    );

    // ------------------------------------------------
    // 🔁 LOOP
    // ------------------------------------------------

    this.loop = new Loop(

      this.update.bind(this),

      this.renderer.render.bind(
        this.renderer
      )

    );

    this.loop.start();

  }

  // ------------------------------------------------
  // 🎛️ GUI
  // ------------------------------------------------

  setupGui(){

    // ------------------------------------------------
    // 🎬 CAMERA
    // ------------------------------------------------

    const cinematic =
      this.gui.addFolder(
        "🎬 Cinematic"
      );

    cinematic.add(
      this.cinematic,
      "parallaxStrength",
      0,
      1,
      0.01
    );

    cinematic.add(
      this.cinematic,
      "masterBoost",
      0,
      3,
      0.01
    );

  // ------------------------------------------------
// 🎧 AUDIO
// ------------------------------------------------

const audioFolder =
  this.gui.addFolder(
    "🎧 Audio"
  );

audioFolder.add(
  this.audio,
  "smoothing",
  0.01,
  0.95,
  0.01
).onChange(value => {

  if(this.audio.analyser){

    this.audio.analyser
      .smoothingTimeConstant = value;

  }

});

audioFolder.open();


// ------------------------------------------------
// 💾 SETTINGS
// ------------------------------------------------

const saveFolder =
  this.gui.addFolder(
    "💾 Settings"
  );

saveFolder.add({

  save: () => {

    this.saveGUISettings();

  }

}, "save");

saveFolder.add({

  load: () => {

    this.loadGUISettings();

  }

}, "load");

    audioFolder.open();

  }

  // ------------------------------------------------
  // ✨ PARTICLES
  // ------------------------------------------------

  setupParticles(){

    const geo =
      createParticleField(6000);

    const mat =
      createParticleMaterial();

    this.points =
      new THREE.Points(

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

    const canvas =
      this.renderer.renderer.domElement;

    canvas.addEventListener(

      "pointerdown",

      ()=>{

        this.isBoosting = true;

      }

    );

    window.addEventListener(

      "pointerup",

      ()=>{

        this.isBoosting = false;

      }

    );

  }

  // ------------------------------------------------
  // 🖱️ MOUSE
  // ------------------------------------------------

  setupMouse(){

    window.addEventListener(

      "pointermove",

      (e)=>{

        const x =
          e.clientX /
          window.innerWidth;

        const y =
          e.clientY /
          window.innerHeight;

        const nx =
          (x - 0.5) * 2;

        const ny =
          (y - 0.5) * 2;

        this.mouseVel.x =
          nx - this.mouse.x;

        this.mouseVel.y =
          ny - this.mouse.y;

        this.mouse.x = nx;
        this.mouse.y = ny;

      }

    );

  }

  // ------------------------------------------------
  // 🎬 THEME SWITCHING
  // ------------------------------------------------

  setupThemeSwitching(){

    window.addEventListener(

      "keydown",

      (e)=>{

        if(e.code === "Digit1"){

          this.themeManager.activate(
            "movies"
          );

        }

        if(e.code === "Digit2"){

          this.themeManager.activate(
            "space"
          );

        }

      }

    );

  }

  // ------------------------------------------------
  // 🎥 CAMERA
  // ------------------------------------------------

  updateCamera(){

    const t = this.time;

    this.parallax.x +=
      (
        this.mouse.x -
        this.parallax.x
      ) * 0.08;

    this.parallax.y +=
      (
        this.mouse.y -
        this.parallax.y
      ) * 0.08;

    const px =
      this.parallax.x *
      this.cinematic.parallaxStrength;

    const py =
      this.parallax.y *
      this.cinematic.parallaxStrength;

    this.camera.position.x =
      Math.sin(t * 0.3) * 0.2 + px;

    this.camera.position.y =
      Math.cos(t * 0.2) * 0.2 + py;

    this.camera.position.z = 5;

    this.camera.lookAt(
      0,
      0,
      -4
    );

  }

  // ------------------------------------------------
  // 🧠 STATE
  // ------------------------------------------------

  buildState(){

    const audio =
      this.audio.getState();

    // 🔥 DEBUG
    console.log(audio);

    return {

      progress:
        this.scroll.getProgress(),

      intensity:
        this.intensity,

      time:
        this.time,

      parallax:
        this.parallax,

      flight:
        this.flight,

      wheel:
        this.wheel,

      audio

    };

  }

  // ------------------------------------------------
  // 🌍 ENVIRONMENT
  // ------------------------------------------------

  updateEnvironment(){

    const theme =
      this.themeManager.activeTheme;

    const env =

      theme?.getEnvironment

        ? theme.getEnvironment()

        : {};

    this.world.setActive(
      env.world ?? true
    );

    if(this.stars?.points){

      this.stars.points.visible =
        env.stars ?? true;

    }

    if(this.stage?.mesh){

      this.stage.mesh.visible =
        env.stage ?? true;

    }

  }

  // ------------------------------------------------
// 💾 SAVE GUI
// ------------------------------------------------

saveGUISettings(){

  const data =
    this.gui.save();

  localStorage.setItem(

    "hero-core-gui",

    JSON.stringify(data)

  );

  console.log(
    "💾 GUI saved"
  );

}


// ------------------------------------------------
// 📂 LOAD GUI
// ------------------------------------------------

loadGUISettings(){

  const raw =

    localStorage.getItem(
      "hero-core-gui"
    );

  if(!raw) return;

  try{

    const data =
      JSON.parse(raw);

    this.gui.load(data);

    console.log(
      "📂 GUI loaded"
    );

  }catch(err){

    console.error(err);

  }

}

// ------------------------------------------------
// 💾 SAVE GUI
// ------------------------------------------------

saveGUISettings(){

  const data =
    this.gui.save();

  localStorage.setItem(
    "hero-core-gui",
    JSON.stringify(data)
  );

  console.log("💾 GUI saved");

}


// ------------------------------------------------
// 📂 LOAD GUI
// ------------------------------------------------

loadGUISettings(){

  const raw =
    localStorage.getItem(
      "hero-core-gui"
    );

  if(!raw) return;

  try{

    const data =
      JSON.parse(raw);

    this.gui.load(data);

    console.log("📂 GUI loaded");

  }
  catch(err){

    console.error(err);

  }

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

    // ------------------------------------------------
    // ⚡ INTENSITY
    // ------------------------------------------------

    const target =
      this.isBoosting ? 1 : 0;

    this.intensity +=
      (
        target -
        this.intensity
      ) * 0.08;

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
    // 🎨 THEMES
    // ------------------------------------------------

    try{

      this.themeManager.update(
        state
      );

    }catch(err){

      console.error(
        "Theme crash:",
        err
      );

    }

    // ------------------------------------------------
    // 🖱️ INTERACTION
    // ------------------------------------------------

    this.interactionManager.update(

      this.mouse,

      state.audio,

      this.time

    );

    // ------------------------------------------------
    // 🌍 ENVIRONMENT
    // ------------------------------------------------

    this.updateEnvironment();

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

    if(
      this.material?.uniforms?.uTime
    ){

      this.material.uniforms
        .uTime.value += 0.01;

    }

    // ------------------------------------------------
    // 🔥 AUDIO DEBUG VISUAL
    // ------------------------------------------------

    if(state.audio){

      document.body.style.background =
        `rgb(${state.audio.energy * 2550},0,0)`;

    }

    // ------------------------------------------------
    // 🖱️ RESET
    // ------------------------------------------------

    this.wheel.delta = 0;

    // ------------------------------------------------
    // 📊 END STATS
    // ------------------------------------------------

    this.stats.end();

  }

}