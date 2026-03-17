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

import { loadMovieTexture } from "../movieLoader.js";

export class App {

constructor(){

const test = document.createElement("video");
test.src = "/assets/mov/test.webm";
test.controls = true;
document.body.appendChild(test);  

// ------------------------------------------------
// RENDERER
// ------------------------------------------------

this.renderer = new Renderer();
this.scene = this.renderer.scene;


// ------------------------------------------------
// THEME3 TEST (using loader)
// ------------------------------------------------

const texture = loadMovieTexture("/mov/test_fixed.mp4");

const geometry = new THREE.PlaneGeometry(10, 6);

const material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  opacity: 0.6,
  toneMapped: false
});

const plane = new THREE.Mesh(geometry, material);

plane.position.set(0, 0, -2);

this.scene.add(plane);

console.log("movie plane added");

// start video after click (browser safe)
window.addEventListener("click", () => {
  this.movieVideo.currentTime = 0;
  this.movieVideo.play();
  console.log("video started");
});


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

this.scroll.updateScroll();

const progress = this.scroll.getProgress();

this.stateManager.update(progress);

const state = this.stateManager.get();

if(this.isBoosting){
this.intensity += 0.04;
}else{
this.intensity -= 0.04;
}

this.intensity = Math.max(0,Math.min(1,this.intensity));

state.intensity = this.intensity;

this.themeManager.update(state);

this.stars.update();
this.world.update();

this.portal.update(delta);

this.points.rotation.y += 0.0003 + this.intensity * 0.001;

if(this.material?.uniforms?.uTime){
this.material.uniforms.uTime.value += 0.01;
}

}

}