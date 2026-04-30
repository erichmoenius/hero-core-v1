import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";


// ------------------------------------------------
// 🎬 CINEMATIC HELPER
// ------------------------------------------------
function smoothstep(a, b, x){
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}


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
  motionStrength: 1,
  boostStrength: 1,
  audioStrength: 0.8
};


// ---------- GUI ----------
this.initGUI();


// ---------- LAYERS ----------
this.base   = this.create("/mov/base.mp4",   14, -8, this.settings.baseOpacity);
this.mid    = this.create("/mov/mid.mp4",    10, -6, this.settings.midOpacity);
this.energy = this.create("/mov/energy.mp4",  6, -4, this.settings.energyOpacity, true);

}


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------
initGUI(){

this.folder = this.gui.addFolder("🎬 Movies");

this.folder.add(this.settings,"baseOpacity",0,1,0.01);
this.folder.add(this.settings,"midOpacity",0,1,0.01);
this.folder.add(this.settings,"energyOpacity",0,1,0.01);

this.folder.add(this.settings,"motionStrength",0,2,0.01);
this.folder.add(this.settings,"boostStrength",0,2,0.01);

// ✅ stays (visual control only)
this.folder.add(this.settings,"audioStrength",0,3,0.01);

this.folder.open();

}


// ------------------------------------------------
// 🎬 CREATE LAYER
// ------------------------------------------------
create(path,w,z,op,add=false){

const tex = loadMovieTexture(path + "?v=" + Date.now());

const mat = new THREE.MeshBasicMaterial({
  map: tex,
  transparent: true,
  opacity: op,
  depthWrite: false
});

if(add){
  mat.blending = THREE.AdditiveBlending;
}

const geo = new THREE.PlaneGeometry(w, w * 9/16);
const mesh = new THREE.Mesh(geo, mat);

mesh.position.z = z;
this.container.add(mesh);

return { mesh, mat };

}


// ------------------------------------------------
// 🎬 UPDATE (NARRATIVE CORE)
// ------------------------------------------------
update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;
const audio = state.audio || {};

const s = this.settings;


// 🎧 AUDIO (clean input)
const energy = Math.pow(audio.energy || 0, 0.6) * s.audioStrength;
const bass   = (audio.bass || 0) * s.audioStrength;


// 🎬 NARRATIVE PHASES
const a1 = smoothstep(0.0, 0.25, p);
const a2 = smoothstep(0.25, 0.5, p);
const a3 = smoothstep(0.5, 0.75, p);
const a4 = smoothstep(0.75, 1.0, p);


// 🎬 BOOST
const boost = (i + energy * 1.5) * s.boostStrength;


// ----------------------
// 🎬 OPACITY STORY
// ----------------------

const baseTarget =
  s.baseOpacity * (1 - a4 * 0.5);

const midTarget =
  s.midOpacity * (a2 + a3 * 0.5 + a4);

const energyTarget =
  s.energyOpacity * (a3 + a4 * 1.5 + energy * 2);


// smooth transitions
this.base.mat.opacity   += (baseTarget - this.base.mat.opacity) * 0.08;
this.mid.mat.opacity    += (midTarget - this.mid.mat.opacity) * 0.08;
this.energy.mat.opacity += (energyTarget - this.energy.mat.opacity) * 0.1;


// ----------------------
// 🎬 MOTION STORY
// ----------------------

const motion =
  s.motionStrength *
  (0.2 + a2 * 0.5 + a3 * 1.0 + a4 * 1.5);


// base (calm)
this.base.mesh.position.x =
  Math.sin(this.time * 0.05) * 0.05 * motion;


// mid (emerges)
this.mid.mesh.position.x =
  Math.sin(this.time * 0.2) * 0.3 * motion;


// energy (explodes)
this.energy.mesh.position.x =
  Math.sin(this.time * 0.6) * 0.8 * motion;


// ----------------------
// 🎬 DEPTH STORY (NO ZOOM)
// ----------------------

this.base.mesh.position.z   = -8 + a2 * 1;
this.mid.mesh.position.z    = -6 + a3 * 2;
this.energy.mesh.position.z = -4 + a4 * 3;


// subtle scale only
const scale = 1 + a3 * 0.2 + a4 * 0.3;

this.base.mesh.scale.setScalar(scale);
this.mid.mesh.scale.setScalar(scale * 1.1 * (1 + bass * 0.3));
this.energy.mesh.scale.setScalar(scale * 1.2 * (1 + bass * 0.6));

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

this.base.mat.dispose();
this.mid.mat.dispose();
this.energy.mat.dispose();

this.folder?.destroy();

}

}