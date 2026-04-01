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

  // ✅ AKTIV (minimal)
  active: {
    base: "/mov/base.mp4",
    mid: "/mov/mid.mp4",
    energy: "/mov/energy.mp4"
  },

  // 🧠 POOL (für später)
  pool: {
    base: {
      fire: ["/mov/fire_1.mp4","/mov/fire_2.mp4"],
      water: ["/mov/water_1.mp4","/mov/water_2.mp4"],
      gas: ["/mov/gas_1.mp4","/mov/gas_2.mp4"],
      solid: ["/mov/solid_1.mp4","/mov/solid_2.mp4"]
    },
    mid: ["/mov/mid_1.mp4","/mov/mid_2.mp4"],
    energy: ["/mov/energy_1.mp4","/mov/energy_2.mp4"]
  }

};

// ------------------------------------------------
// 🎬 LAYERS (MINIMAL)
// ------------------------------------------------

this.base = this.createLayer(this.files.active.base, 14, -8, 0.4);
this.mid = this.createLayer(this.files.active.mid, 10, -6, 0.5);
this.energy = this.createLayer(this.files.active.energy, 6, -4, 0.25, true);


// ------------------------------------------------
// 🎬 OFFSETS (Composition)
// ------------------------------------------------

this.baseOffset = new THREE.Vector2(-0.2, 0.0);
this.midOffset = new THREE.Vector2(0.3, 0.1);
this.energyOffset = new THREE.Vector2(-0.4, -0.2);


// ------------------------------------------------
// 🧠 DEBUG
// ------------------------------------------------

this.lastStateKey = null;

}


// ------------------------------------------------
// 🎬 STATE LOGIC
// ------------------------------------------------

getStateKey(state){

if(state.fire > 0.5) return "fire";
if(state.water > 0.5) return "water";
if(state.gas > 0.5) return "gas";
if(state.solid > 0.5) return "solid";

return "gas";
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
const s = state.settings ?? {};


// ------------------------------------------------
// 🧠 DEBUG (nur bei Wechsel)
// ------------------------------------------------

const key = this.getStateKey(state);

if(this.lastStateKey !== key){
  console.log("STATE →", key, "| progress:", p.toFixed(2));
  this.lastStateKey = key;
}


// ------------------------------------------------
// 🎬 OPACITY (GUI FIRST!)
// ------------------------------------------------

let baseOpacity = s.baseOpacity ?? 0.4;
let midOpacity = s.midOpacity ?? 0.5;
let energyOpacity = s.energyOpacity ?? 0.2;


// 👉 leichte dramaturgie (subtil!)
if(state.fire > 0.5){
  midOpacity += 0.15;
}
else if(state.water > 0.5){
  baseOpacity += 0.15;
}
else if(state.solid > 0.5){
  energyOpacity *= 0.6;
}


// 👉 LMB Boost
energyOpacity += i * 0.3;


// 👉 SMOOTH APPLY
this.base.material.opacity += (baseOpacity - this.base.material.opacity) * 0.05;
this.mid.material.opacity += (midOpacity - this.mid.material.opacity) * 0.05;
this.energy.material.opacity += (energyOpacity - this.energy.material.opacity) * 0.05;


// ------------------------------------------------
// 🎥 MOTION (GUI CONTROLLED)
// ------------------------------------------------

const m = s.motionStrength ?? 1.0;

this.base.mesh.position.x =
  this.baseOffset.x + Math.sin(this.time * 0.05) * 0.08 * m;

this.mid.mesh.position.x =
  this.midOffset.x + Math.sin(this.time * 0.2) * 0.25 * m;

this.mid.mesh.position.y =
  this.midOffset.y + Math.cos(this.time * 0.15) * 0.15 * m;

this.energy.mesh.position.x =
  this.energyOffset.x + Math.sin(this.time * 0.5) * 0.6 * m;

this.energy.mesh.position.y =
  this.energyOffset.y + Math.cos(this.time * 0.4) * 0.4 * m;


// Scroll Offset
this.mid.mesh.position.x += (p - 0.5) * 0.5;
this.energy.mesh.position.x += (p - 0.5) * 1.2;


// ------------------------------------------------
// 🚀 ZOOM (GUI CONTROLLED)
// ------------------------------------------------

const zoom = 1 + p * (s.zoomStrength ?? 1.5);

this.base.mesh.position.z = -8 + p * 3;
this.base.mesh.scale.setScalar(zoom);

this.mid.mesh.position.z = -6 + p * 4;
this.mid.mesh.scale.setScalar(1.1 * zoom);

this.energy.mesh.position.z = -4 + p * 5;
this.energy.mesh.scale.setScalar(1.3 * zoom);


// ------------------------------------------------
// 🌌 GLOBAL DRIFT
// ------------------------------------------------

this.container.position.z = Math.sin(this.time * 0.2) * 0.2;

}


// ------------------------------------------------
// CLEANUP
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

}

}