import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

constructor(container, gui){

this.container = container;
this.gui = gui;

this.time = 0;
this.focusStrength = 0;
this.currentMidName = "default";

// ---------- SETTINGS ----------
this.settings = {
  baseOpacity: 0.5,
  midOpacity: 0.7,
  energyOpacity: 0.2,
  motionStrength: 1.0,
  zoomStrength: 1.5,
  boostStrength: 1.0
};

// ---------- GUI ----------
this.initGUI();

// ---------- FILES ----------
this.files = {
  active: {
    base: "/mov/base.mp4",
    mid: "/mov/mid.mp4",
    energy: "/mov/energy.mp4"
  }
};

// ---------- LAYERS ----------
this.base   = this.createLayer(this.files.active.base,   14, -8, this.settings.baseOpacity);
this.mid    = this.createLayer(this.files.active.mid,    10, -6, this.settings.midOpacity);
this.energy = this.createLayer(this.files.active.energy,  6, -4, this.settings.energyOpacity, true);

// ---------- OFFSETS ----------
this.baseOffset   = new THREE.Vector2(-0.2,  0.0);
this.midOffset    = new THREE.Vector2( 0.3,  0.1);
this.energyOffset = new THREE.Vector2(-0.4, -0.2);

}


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------
initGUI(){

if(!this.gui) return;

this.folder = this.gui.addFolder("🎬 Movies");

this.folder.add(this.settings, "baseOpacity", 0, 1, 0.01);
this.folder.add(this.settings, "midOpacity", 0, 1, 0.01);
this.folder.add(this.settings, "energyOpacity", 0, 1, 0.01);

this.folder.add(this.settings, "motionStrength", 0, 2, 0.01);
this.folder.add(this.settings, "zoomStrength", 0, 3, 0.01);
this.folder.add(this.settings, "boostStrength", 0, 2, 0.01);

this.folder.open();

}


// ------------------------------------------------
// 🌍 ENV
// ------------------------------------------------
getEnvironment(){
return {
  world: true,
  stars: false,
  portal: true,
  stage: true
};
}


// ------------------------------------------------
// 🎬 HELPERS
// ------------------------------------------------
getFreshPath(path){
  return path + "?v=" + Date.now();
}


// ------------------------------------------------
// 🎬 CREATE LAYER
// ------------------------------------------------
createLayer(path, width, z, opacity, additive=false){

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
// 🎬 UPDATE
// ------------------------------------------------
update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;
const s = this.settings;


// ---------- BASE VALUES ----------
let baseOpacity   = s.baseOpacity;
let midOpacity    = s.midOpacity;
let energyOpacity = s.energyOpacity;


// ---------- FOCUS ----------
const targetFocus = this.currentMidName?.includes("eye") ? 1 : 0;
this.focusStrength += (targetFocus - this.focusStrength) * 0.05;

baseOpacity   *= (1 - this.focusStrength * 0.3);
energyOpacity *= (1 - this.focusStrength * 0.4);
midOpacity    *= (1 + this.focusStrength * 0.3);

midOpacity = Math.max(midOpacity, 0.4 + this.focusStrength * 0.2);


// ---------- 🎯 INTENSITY BOOST (KEY PART)
const boost = i * s.boostStrength;

energyOpacity += boost * 1.5;
baseOpacity   *= (1 - boost * 0.6);
midOpacity    *= (1 - boost * 0.4);


// ---------- SMOOTH APPLY ----------
this.base.material.opacity += (baseOpacity - this.base.material.opacity) * 0.06;
this.mid.material.opacity += (midOpacity - this.mid.material.opacity) * 0.06;
this.energy.material.opacity += (energyOpacity - this.energy.material.opacity) * 0.08;


// ---------- ⚡ ENERGY SHIMMER ----------
this.energy.material.opacity += Math.sin(this.time * 8) * boost * 0.04;


// ---------- 🎥 MOTION ----------
const m = s.motionStrength;
const motionBoost = 1 + boost * 0.8;

this.base.mesh.position.x =
  this.baseOffset.x + Math.sin(this.time * 0.05) * 0.08 * m;

this.mid.mesh.position.x =
  this.midOffset.x + Math.sin(this.time * 0.2) * 0.25 * m * motionBoost;

this.mid.mesh.position.y =
  this.midOffset.y + Math.cos(this.time * 0.15) * 0.15 * m;

this.energy.mesh.position.x =
  this.energyOffset.x + Math.sin(this.time * 0.5) * 0.6 * m * motionBoost;

this.energy.mesh.position.y =
  this.energyOffset.y + Math.cos(this.time * 0.4) * 0.4 * m * motionBoost;


// ---------- SCROLL ----------
this.mid.mesh.position.x += (p - 0.5) * 0.5;
this.energy.mesh.position.x += (p - 0.5) * 1.2;


// ---------- DEPTH ----------
const zoom = 1 + p * s.zoomStrength;

this.base.mesh.position.z = -8 + p * 3;
this.base.mesh.scale.setScalar(zoom);

this.mid.mesh.position.z = -5 + p * 4;
this.mid.mesh.scale.setScalar(1.1 * zoom * (1 + boost * 0.2));

this.energy.mesh.position.z = -4 + p * 5;
this.energy.mesh.scale.setScalar(1.3 * zoom * (1 + boost * 0.5));


// ---------- DRIFT ----------
this.container.position.z = Math.sin(this.time * 0.2) * 0.2;

}


// ------------------------------------------------
// 🧹 CLEANUP
// ------------------------------------------------
destroy(){

this.container.remove(this.base.mesh);
this.container.remove(this.mid.mesh);
this.container.remove(this.energy.mesh);

this.base.mesh.geometry.dispose();
this.mid.mesh.geometry.dispose();
this.energy.mesh.geometry.dispose();

this.base.material.dispose();
this.mid.material.dispose();
this.energy.material.dispose();

if(this.folder){
  this.folder.destroy();
}

}

}