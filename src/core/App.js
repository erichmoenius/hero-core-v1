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

import { createParticleField } from "../particles/ParticleField.js";
import { createParticleMaterial } from "../particles/ParticleShader.js";


export class App {

constructor(){

// ------------------------------------------------
// RENDERER
// ------------------------------------------------

this.renderer = new Renderer();
this.scene = this.renderer.scene;


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

// Renderer benötigt Zugriff für Portal Rendering
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

// zukünftiges Theme
// this.themeManager.register("movies", MoviesTheme);

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
// THEME SWITCHING
// ------------------------------------------------

setupThemeSwitching(){

window.addEventListener("keydown",(e)=>{

if(e.code === "Digit1"){
this.themeManager.activate("seasons");
}

if(e.code === "Digit2"){
this.themeManager.activate("images");
}

if(e.code === "Digit3"){
console.log("Movies theme not implemented yet");
}

});

}



// ------------------------------------------------
// MAIN UPDATE LOOP
// ------------------------------------------------

update(delta){

// Scroll
this.scroll.updateScroll();

const progress = this.scroll.getProgress();

this.stateManager.update(progress);

const state = this.stateManager.get();


// Intensity smoothing
if(this.isBoosting){
this.intensity += 0.04;
}else{
this.intensity -= 0.04;
}

this.intensity = Math.max(0,Math.min(1,this.intensity));

state.intensity = this.intensity;


// Theme update
this.themeManager.update(state);


// Background systems
this.stars.update();
this.world.update();


// Portal update
this.portal.update(delta);


// Particle motion
this.points.rotation.y += 0.0003 + this.intensity * 0.001;


// Particle shader time
if(this.material?.uniforms?.uTime){
this.material.uniforms.uTime.value += 0.01;
}

}

}