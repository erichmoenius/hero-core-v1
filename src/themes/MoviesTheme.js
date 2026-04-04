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
  active: {
    base: "/mov/base.mp4",
    mid: "/mov/mid.mp4",
    energy: "/mov/energy.mp4"
  }
};


// ------------------------------------------------
// 🎬 LAYERS
// ------------------------------------------------

this.base   = this.createLayer(this.files.active.base,   14, -8, 0.35);
this.mid    = this.createLayer(this.files.active.mid,    10, -6, 0.65);
this.energy = this.createLayer(this.files.active.energy,  6, -4, 0.1, true);


// ------------------------------------------------
// 🎬 OFFSETS
// ------------------------------------------------

this.baseOffset   = new THREE.Vector2(-0.2,  0.0);
this.midOffset    = new THREE.Vector2( 0.3,  0.1);
this.energyOffset = new THREE.Vector2(-0.4, -0.2);


// ------------------------------------------------
// 🧠 DEBUG
// ------------------------------------------------

this.lastStateKey = null;

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
// 🎬 SET VIDEO (GUI BRIDGE SAFE)
// ------------------------------------------------

setVideo(layerName, path){

  const layer = this[layerName];

  if(!layer){
    console.warn("❌ Layer not found:", layerName);
    return;
  }

  // ⚠️ KEIN dispose → verhindert Black Screen bei VideoTexture

  const texture = loadMovieTexture(this.getFreshPath(path));

  layer.material.map = texture;
  layer.material.needsUpdate = true;

  console.log("🎬 Video switched:", layerName, path);
}


// ------------------------------------------------
// 🎬 UPDATE
// ------------------------------------------------

update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const focus = state.intensity ?? 0;
const s = state.settings ?? {};


// ------------------------------------------------
// 🎬 CINEMATIC BALANCE SYSTEM
// ------------------------------------------------

let baseOpacity   = 0.35 + p * 0.15;
let midOpacity    = 0.65 + focus * 0.25;
let energyOpacity = 0.08 + focus * 0.25;


// subtle dramaturgy

if(state.fire > 0.5){
  midOpacity += 0.1;
}
else if(state.water > 0.5){
  baseOpacity += 0.1;
}
else if(state.solid > 0.5){
  energyOpacity *= 0.5;
}


// clamp

baseOpacity   = THREE.MathUtils.clamp(baseOpacity,   0, 0.6);
midOpacity    = THREE.MathUtils.clamp(midOpacity,    0, 1.0);
energyOpacity = THREE.MathUtils.clamp(energyOpacity, 0, 0.5);


// smooth

const smooth = 0.06;

this.base.material.opacity += (baseOpacity - this.base.material.opacity) * smooth;
this.mid.material.opacity += (midOpacity - this.mid.material.opacity) * smooth;
this.energy.material.opacity += (energyOpacity - this.energy.material.opacity) * smooth;


// subtle pulse

this.energy.material.opacity += Math.sin(this.time * 1.2) * 0.015;


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


// scroll influence

this.mid.mesh.position.x += (p - 0.5) * 0.5;
this.energy.mesh.position.x += (p - 0.5) * 1.2;


// ------------------------------------------------
// 🚀 ZOOM (CINEMATIC)
// ------------------------------------------------

const zoom = 1 + p * (s.zoomStrength ?? 1.5);

this.base.mesh.position.z = -8 + p * 3;
this.base.mesh.scale.setScalar(zoom);

this.mid.mesh.position.z = -6 + p * 4;
this.mid.mesh.scale.setScalar(1.1 * zoom);

this.energy.mesh.position.z = -4 + p * 5;
this.energy.mesh.scale.setScalar(1.3 * zoom);


// 👁️ FOCUS BOOST (very important)

const focusScale = 1 + focus * 0.15;
this.mid.mesh.scale.multiplyScalar(1.0 + (focusScale - 1.0) * 0.1);


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