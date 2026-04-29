import * as THREE from "three";
import { FibonacciSystem } from "../systems/FibonacciSystem.js";

export class SpaceTheme {

constructor(container){

// ✅ FIX: set container FIRST
this.container = container;

// core
this.time = 0;
this.velocity = 0;

// ---------------- FIBONACCI ----------------
this.fibonacci = new FibonacciSystem(this.container);

// slight depth offset (feels more cinematic)
this.fibonacci.group.position.z = -2;


// ---------------- STAR LAYERS ----------------
// echte Tiefe, KEINE Flächen

this.far  = this.createLayer(1500, 60, 0.02, 0x6688ff);
this.mid  = this.createLayer(1000, 30, 0.04, 0xffffff);
this.near = this.createLayer(600,  15, 0.07, 0xffaa55);

}


// ------------------------------------------------
// ⭐ CREATE LAYER
// ------------------------------------------------

createLayer(count, depth, size, color){

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);

for(let i = 0; i < count; i++){

  const i3 = i * 3;

  positions[i3]     = (Math.random() - 0.5) * 60;
  positions[i3 + 1] = (Math.random() - 0.5) * 60;

  // symmetrische Tiefe
  positions[i3 + 2] = (Math.random() - 0.5) * depth;
}

geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const material = new THREE.PointsMaterial({
  size,
  color,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);

this.container.add(points);

return {
  points,
  depth,
  baseSize: size
};

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------
getEnvironment(){
  return {
    world: true,
    stars: false,   // use your own star system instead
    portal: false,  // 🔥 CRITICAL: prevents WebGL feedback loop
    stage: true
  };
}

update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;


// ---------------- FIBONACCI ----------------

this.fibonacci.setMouse(
  state.parallax?.x || 0,
  state.parallax?.y || 0
);

this.fibonacci.update(0.016, state.audio);


// ------------------------------------------------
// 🚀 VELOCITY SYSTEM
// ------------------------------------------------

const targetSpeed = (p - 0.5) * 3;

this.velocity += (targetSpeed - this.velocity) * 0.05;
this.velocity *= 0.98;
this.velocity += i * 0.5;

const forward = this.velocity;


// ------------------------------------------------
// 🌌 PARALLAX
// ------------------------------------------------

this.updateLayer(this.far,  forward * 0.2);
this.updateLayer(this.mid,  forward * 0.6);
this.updateLayer(this.near, forward * 1.4);


// ------------------------------------------------
// 🌫️ DEPTH FOG (balanced for Fibonacci visibility)
// ------------------------------------------------

const fog = 0.85 + Math.sin(this.time * 0.3) * 0.05;

this.far.points.material.opacity  = 0.15 * fog;
this.mid.points.material.opacity  = 0.4  * fog;
this.near.points.material.opacity = 0.8  * fog;


// ------------------------------------------------
// ✨ LIGHT PULSE
// ------------------------------------------------

const pulse = 1 + Math.sin(this.time * 2.0) * 0.03;
this.near.points.material.size = this.near.baseSize * pulse;

}


// ------------------------------------------------
// 🔁 LAYER UPDATE
// ------------------------------------------------

updateLayer(layer, speed){

const pos = layer.points.geometry.attributes.position;
const depth = layer.depth;

for(let i = 0; i < pos.count; i++){

  let z = pos.getZ(i);

  const variance = 0.7 + Math.sin(i * 12.9898) * 0.3;

  z += speed * 0.02 * variance;

  // infinite loop
  if(z > depth * 0.5) z -= depth;
  if(z < -depth * 0.5) z += depth;

  pos.setZ(i, z);
}

pos.needsUpdate = true;

}


// ------------------------------------------------
// 🧹 CLEANUP
// ------------------------------------------------

destroy(){

// ✅ important
this.fibonacci?.destroy();

[this.far, this.mid, this.near].forEach(layer => {

  this.container.remove(layer.points);

  layer.points.geometry.dispose();
  layer.points.material.dispose();

});

}

}