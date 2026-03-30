import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

constructor(container){

this.container = container;
this.time = 0;

// ------------------------------------------------
// 🎬 FILE CONFIG
// ------------------------------------------------

this.files = {
  base: {
    fire: ["/mov/fire_1.mp4","/mov/fire_2.mp4"],
    water: ["/mov/water_1.mp4","/mov/water_2.mp4"],
    gas: ["/mov/gas_1.mp4","/mov/gas_2.mp4"],
    solid: ["/mov/solid_1.mp4","/mov/solid_2.mp4"]
  },
  mid: ["/mov/mid_1.mp4","/mov/mid_2.mp4"],
  energy: ["/mov/energy_1.mp4","/mov/energy_2.mp4"]
};

// ------------------------------------------------
// 🎬 BASE (A/B)
// ------------------------------------------------

this.baseA = this.createLayer(this.files.base, 14, -8, 0.5);
this.baseB = this.createLayer(this.files.base, 14, -8, 0.0);

this.baseActive = "A";
this.baseFade = 0;
this.baseTimer = 0;

this.baseSwitchTime = 12;
this.baseFadeSpeed = 0.01;


// ------------------------------------------------
// 🎬 MID + ENERGY
// ------------------------------------------------

this.mid = this.createLayer(this.files.mid, 10, -6, 0.4);
this.energy = this.createLayer(this.files.energy, 6, -4, 0.25, true);


// ------------------------------------------------
// 🎬 OFFSETS
// ------------------------------------------------

this.baseOffset = new THREE.Vector2(-0.2, 0.0);
this.midOffset = new THREE.Vector2(0.3, 0.1);
this.energyOffset = new THREE.Vector2(-0.4, -0.2);

this.lastStateKey = null;
}


// ------------------------------------------------
// STATE
// ------------------------------------------------

getStateKey(state){
if(state.fire > 0.5) return "fire";
if(state.water > 0.5) return "water";
if(state.gas > 0.5) return "gas";
if(state.solid > 0.5) return "solid";
return "gas";
}


// ------------------------------------------------
// HELPERS
// ------------------------------------------------

getFreshPath(path){
return path + "?v=" + Date.now();
}

getRandom(arr){
return arr[Math.floor(Math.random() * arr.length)];
}


// ------------------------------------------------
// CREATE LAYER
// ------------------------------------------------

createLayer(paths, width, z, opacity, additive=false){

let path;

if(typeof paths === "object" && !Array.isArray(paths)){
  path = this.getRandom(paths.gas);
}else{
  path = this.getRandom(paths) || "/mov/fallback.mp4";
}

const texture = loadMovieTexture(this.getFreshPath(path));

const material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  opacity,
  toneMapped: false,
  depthWrite: false
});

if(additive){
  material.blending = THREE.AdditiveBlending;
}

const geometry = new THREE.PlaneGeometry(width, width * 9/16);

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0,0,z);

this.container.add(mesh);

return { mesh, material };
}


// ------------------------------------------------
// RELOAD BASE
// ------------------------------------------------

reloadBase(layer, state){

const key = this.getStateKey(state);
const pool = this.files.base[key];

const path = this.getRandom(pool);
const texture = loadMovieTexture(this.getFreshPath(path));

layer.material.map = texture;
layer.material.needsUpdate = true;
layer.material.opacity = 0;
}


// ------------------------------------------------
// UPDATE
// ------------------------------------------------

update(state){

this.time += 0.016;
this.baseTimer += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;
const s = state.settings ?? {};

// ------------------------------------------------
// DEBUG
// ------------------------------------------------

const key = this.getStateKey(state);

if(this.lastStateKey !== key){
  console.log("STATE →", key, "| progress:", p.toFixed(2));
  this.lastStateKey = key;
}


// ------------------------------------------------
// BASE SWITCH
// ------------------------------------------------

if(this.baseTimer > this.baseSwitchTime){

  this.baseTimer = 0;

  if(this.baseActive === "A"){
    this.reloadBase(this.baseB, state);
  } else {
    this.reloadBase(this.baseA, state);
  }

  this.baseFade = 0;
}


// ------------------------------------------------
// 🎬 OPACITY (GUI + STATE)
// ------------------------------------------------

let baseOpacity = s.baseOpacity ?? 0.4;
let midOpacity = s.midOpacity ?? 0.5;
let energyOpacity = s.energyOpacity ?? 0.2;

if(state.fire > 0.5){
  midOpacity += 0.2;
}
else if(state.water > 0.5){
  baseOpacity += 0.2;
}
else if(state.solid > 0.5){
  energyOpacity *= 0.5;
}

// LMB Boost
energyOpacity += i * 0.3;


// SMOOTH APPLY
this.baseA.material.opacity += (baseOpacity - this.baseA.material.opacity) * 0.05;
this.baseB.material.opacity += (baseOpacity - this.baseB.material.opacity) * 0.05;

this.mid.material.opacity += (midOpacity - this.mid.material.opacity) * 0.05;
this.energy.material.opacity += (energyOpacity - this.energy.material.opacity) * 0.05;


// ------------------------------------------------
// 🎬 CROSSFADE
// ------------------------------------------------

const ease = (t) => t * t * (3 - 2 * t);

this.baseFade += this.baseFadeSpeed;

const f = Math.min(this.baseFade, 1);
const e = ease(f);

if(this.baseActive === "A"){
  this.baseA.material.opacity *= (1 - e);
  this.baseB.material.opacity += e * 0.5;
}else{
  this.baseA.material.opacity += e * 0.5;
  this.baseB.material.opacity *= (1 - e);
}

if(f >= 1){
  this.baseActive = this.baseActive === "A" ? "B" : "A";
}


// ------------------------------------------------
// 🎥 MOTION (GUI CONTROLLED)
// ------------------------------------------------

const m = s.motionStrength ?? 1.0;

const baseX = this.baseOffset.x + Math.sin(this.time * 0.05) * 0.08 * m;

this.baseA.mesh.position.x = baseX;
this.baseB.mesh.position.x = baseX;

this.mid.mesh.position.x = this.midOffset.x + Math.sin(this.time * 0.2) * 0.25 * m;
this.mid.mesh.position.y = this.midOffset.y + Math.cos(this.time * 0.15) * 0.15 * m;

this.energy.mesh.position.x = this.energyOffset.x + Math.sin(this.time * 0.5) * 0.6 * m;
this.energy.mesh.position.y = this.energyOffset.y + Math.cos(this.time * 0.4) * 0.4 * m;

this.mid.mesh.position.x += (p - 0.5) * 0.5;
this.energy.mesh.position.x += (p - 0.5) * 1.2;


// ------------------------------------------------
// 🚀 ZOOM
// ------------------------------------------------

const zoom = 1 + p * (s.zoomStrength ?? 1.5);

this.baseA.mesh.position.z = -8 + p * 3;
this.baseB.mesh.position.z = -8 + p * 3;

this.baseA.mesh.scale.setScalar(zoom);
this.baseB.mesh.scale.setScalar(zoom);

this.mid.mesh.position.z = -6 + p * 4;
this.mid.mesh.scale.setScalar(1.1 * zoom);

this.energy.mesh.position.z = -4 + p * 5;
this.energy.mesh.scale.setScalar(1.3 * zoom);


// ------------------------------------------------
// GLOBAL DRIFT
// ------------------------------------------------

this.container.position.z = Math.sin(this.time * 0.2) * 0.2;

}


// ------------------------------------------------
// CLEANUP
// ------------------------------------------------

destroy(){

this.container.remove(this.baseA.mesh);
this.container.remove(this.baseB.mesh);
this.container.remove(this.mid.mesh);
this.container.remove(this.energy.mesh);

this.baseA.mesh.geometry.dispose();
this.baseB.mesh.geometry.dispose();
this.mid.mesh.geometry.dispose();
this.energy.mesh.geometry.dispose();

this.baseA.material.dispose();
this.baseB.material.dispose();
this.mid.material.dispose();
this.energy.material.dispose();

}

}