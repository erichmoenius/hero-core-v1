import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

constructor(container, gui){

this.container = container;
this.gui = gui;

this.time = 0;

// ---------- SETTINGS ----------
this.settings = {
  baseOpacity: 0.5,
  midOpacity: 0.7,
  energyOpacity: 0.2,
  motionStrength: 1.0,
  zoomStrength: 1.5,
  boostStrength: 1.0,
  focusTracking: 0.3,
  focusBoost: 0.5,
  audioStrength: 0.8
};

// ---------- AUDIO INPUT ----------
this.audioInput = document.createElement("input");
this.audioInput.type = "file";
this.audioInput.accept = "audio/*";
this.audioInput.style.display = "none";
document.body.appendChild(this.audioInput);

this.audioInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !window.audio) return;

  await window.audio.load(file);
  await window.audio.play();
});

// ---------- PARALLAX ----------
this.parallaxGlobal = 2.0;

this.parallaxStrengths = {
  base: 0.1,
  mid: 0.3,
  energy: 0.6
};

this.parallaxTarget = { ...this.parallaxStrengths };
this.blendSpeed = 0.08;

this.parallaxPresets = {
  calm:      { base: 0.01, mid: 0.05, energy: 0.1 },
  cinematic: { base: 0.08, mid: 0.3,  energy: 0.7 },
  intense:   { base: 0.25, mid: 0.8,  energy: 1.5 }
};

// ---------- FOCUS ----------
this.focusOffset = { x: 0, y: 0 };

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

// visual controls
this.folder.add(this.settings, "baseOpacity", 0, 1, 0.01);
this.folder.add(this.settings, "midOpacity", 0, 1, 0.01);
this.folder.add(this.settings, "energyOpacity", 0, 1, 0.01);

this.folder.add(this.settings, "motionStrength", 0, 2, 0.01);
this.folder.add(this.settings, "zoomStrength", 0, 3, 0.01);
this.folder.add(this.settings, "boostStrength", 0, 2, 0.01);

this.folder.add(this.settings, "focusTracking", 0, 1, 0.01);
this.folder.add(this.settings, "focusBoost", 0, 1, 0.01);

this.folder.add(this.settings, "audioStrength", 0, 2, 0.01).name("Audio Impact");

this.folder.add(this, "parallaxGlobal", 0, 5, 0.1);

// ---------- AUDIO GUI ----------
const audioFolder = this.folder.addFolder("🎧 Audio");

audioFolder.add({
  load: () => this.audioInput.click()
}, "load");

audioFolder.add({
  play: async () => window.audio?.play()
}, "play");

audioFolder.add({
  pause: () => window.audio?.pause()
}, "pause");

audioFolder.add({
  resume: () => window.audio?.resume()
}, "resume");

audioFolder.add(window.audio.settings, "masterGain", 0, 3, 0.01).name("Volume");

audioFolder.open();

// ---------- PARALLAX ----------
const pFolder = this.folder.addFolder("🖱️ Parallax Presets");

pFolder.add({ calm: ()=>this.applyParallaxPreset("calm") }, "calm");
pFolder.add({ cinematic: ()=>this.applyParallaxPreset("cinematic") }, "cinematic");
pFolder.add({ intense: ()=>this.applyParallaxPreset("intense") }, "intense");

pFolder.open();
this.folder.open();

}


// ------------------------------------------------
// 🎬 PRESETS
// ------------------------------------------------
applyParallaxPreset(name){

const preset = this.parallaxPresets[name];
if(!preset) return;

this.parallaxTarget.base = preset.base;
this.parallaxTarget.mid = preset.mid;
this.parallaxTarget.energy = preset.energy;

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
const px = state.parallax?.x ?? 0;
const py = state.parallax?.y ?? 0;

const a = state.audio || {};
const s = this.settings;
const P = this.parallaxGlobal;

// 🎧 AUDIO
const energy = Math.pow(a.energy || 0, 0.6) * s.audioStrength;
const bass = (a.bass || 0) * s.audioStrength;
const mid  = (a.mid  || 0) * s.audioStrength;
const high = (a.high || 0) * s.audioStrength;


// ---------- PARALLAX ----------
this.parallaxStrengths.base += (this.parallaxTarget.base - this.parallaxStrengths.base) * this.blendSpeed;
this.parallaxStrengths.mid += (this.parallaxTarget.mid - this.parallaxStrengths.mid) * this.blendSpeed;
this.parallaxStrengths.energy += (this.parallaxTarget.energy - this.parallaxStrengths.energy) * this.blendSpeed;


// ---------- BOOST ----------
const boost = (i + energy * 1.5) * s.boostStrength;


// ---------- MOTION ----------
const m = s.motionStrength;
const motionBoost = 1 + boost + mid * 0.6;


// ---------- BASE ----------
this.base.mesh.position.x =
  this.baseOffset.x +
  Math.sin(this.time * 0.05) * 0.08 * m +
  px * this.parallaxStrengths.base * P;

this.base.mesh.position.y =
  this.baseOffset.y +
  py * this.parallaxStrengths.base * P;


// ---------- MID ----------
this.mid.mesh.position.x =
  this.midOffset.x +
  Math.sin(this.time * 0.2) * 0.25 * m * motionBoost +
  px * this.parallaxStrengths.mid * P;

this.mid.mesh.position.y =
  this.midOffset.y +
  Math.cos(this.time * 0.15) * 0.15 * m +
  py * this.parallaxStrengths.mid * P;


// ---------- ENERGY ----------
this.energy.mesh.position.x =
  this.energyOffset.x +
  Math.sin(this.time * 0.5) * 0.6 * m * motionBoost +
  px * this.parallaxStrengths.energy * P;

this.energy.mesh.position.y =
  this.energyOffset.y +
  Math.cos(this.time * 0.4) * 0.4 * m * motionBoost +
  py * this.parallaxStrengths.energy * P;


// ---------- DEPTH ----------
const zoom = 1 + p * s.zoomStrength;

this.base.mesh.scale.setScalar(zoom);
this.mid.mesh.scale.setScalar(1.1 * zoom * (1 + bass * 0.4));
this.energy.mesh.scale.setScalar(1.3 * zoom * (1 + bass * 0.6));

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