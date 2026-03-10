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

import { ColorTheme } from "../themes/ColorTheme.js";
import { SeasonsTheme } from "../themes/SeasonsTheme.js";
import { ImageTheme } from "../themes/ImageTheme.js";

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";


export class App {

constructor(){

// ------------------------------------------------
// RENDERER
// ------------------------------------------------

this.renderer = new Renderer();

const scene = this.renderer.scene;
const camera = this.renderer.camera;
const renderer = this.renderer.renderer;


// ------------------------------------------------
// BACKGROUND
// ------------------------------------------------

this.world = new ShaderWorld(scene);
this.stars = new Starfield(scene);


// ------------------------------------------------
// PORTAL + THEME STAGE
// ------------------------------------------------

this.stage = new ThemeStage(scene);

this.portal = new GlassPortal(
scene,
renderer,
camera
);


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

this.themeManager.register("color", ColorTheme);
this.themeManager.register("seasons", SeasonsTheme);
this.themeManager.register("image", ImageTheme);

this.themeManager.activate("color");


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
// PARTICLES
// ------------------------------------------------

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



// ------------------------------------------------
// INPUT
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
// THEME SWITCHING
// ------------------------------------------------

setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

if(e.code === "Digit1"){
this.themeManager.activate("color");
}

if(e.code === "Digit2"){
this.themeManager.activate("seasons");
}

if(e.code === "Digit3"){
this.themeManager.activate("image");
}

});

}



// ------------------------------------------------
// UPDATE LOOP
// ------------------------------------------------

update(delta){

// Scroll
this.scroll.updateScroll();

const progress = this.scroll.getProgress();

this.stateManager.update(progress);

const state = this.stateManager.get();


// Smooth intensity
if(this.isBoosting){
this.intensity += 0.04;
}else{
this.intensity -= 0.04;
}

this.intensity = Math.max(0,Math.min(1,this.intensity));

state.intensity = this.intensity;


// Theme
this.themeManager.update(state);


// Background
this.stars.update();
this.world.update();


// Portal
this.portal.update();


// Particles
this.points.rotation.y += 0.0003 + this.intensity * 0.001;
this.material.uniforms.uTime.value += 0.01;

}

}