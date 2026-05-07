import * as THREE from "three";
import { FibonacciSystem } from "../systems/FibonacciSystem.js";

export class SpaceTheme {

constructor(container){

this.container = container;

this.time = 0;
this.velocity = 0;

// ------------------------------------------------
// 🌌 WORLD GROUP
// ------------------------------------------------
this.group = new THREE.Group();
this.container.add(this.group);


// ------------------------------------------------
// 🌀 FIBONACCI
// ------------------------------------------------
this.fibonacci = new FibonacciSystem(this.group);

this.fibonacci.group.position.z = -2;


// ------------------------------------------------
// ⭐ STAR LAYERS
// ------------------------------------------------
this.far  = this.createLayer(1500, 60, 0.02, 0x6688ff);
this.mid  = this.createLayer(1000, 30, 0.04, 0xffffff);
this.near = this.createLayer(600,  15, 0.07, 0xffaa55);


// ------------------------------------------------
// 🌠 GLOBAL MOTION
// ------------------------------------------------
this.worldRotation = 0;
this.cameraDrift = new THREE.Vector2();

}


// ------------------------------------------------
// 🌍 ENVIRONMENT
// ------------------------------------------------
getEnvironment(){

return {
  world: true,
  stars: false,
  portal: false,
  stage: true
};

}


// ------------------------------------------------
// 🎥 CAMERA FEEL
// ------------------------------------------------
updateCamera(camera, state = {}){

const follow = 0.06;

const px = state.parallax?.x || 0;
const py = state.parallax?.y || 0;

this.cameraDrift.x += ((px * 0.6) - this.cameraDrift.x) * follow;
this.cameraDrift.y += ((py * 0.4) - this.cameraDrift.y) * follow;

camera.position.x += (this.cameraDrift.x - camera.position.x) * 0.08;
camera.position.y += (-this.cameraDrift.y - camera.position.y) * 0.08;

}


// ------------------------------------------------
// ⭐ CREATE STAR LAYER
// ------------------------------------------------
createLayer(count, depth, size, color){

const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(count * 3);

for(let i = 0; i < count; i++){

  const i3 = i * 3;

  positions[i3]     = (Math.random() - 0.5) * 60;
  positions[i3 + 1] = (Math.random() - 0.5) * 60;
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

this.group.add(points);

return {
  points,
  depth,
  baseSize: size
};

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------
update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const intensity = state.intensity ?? 0;

const audio = state.audio || {};


// ------------------------------------------------
// 🎧 AUDIO
// ------------------------------------------------
const energy = Math.pow(audio.energy || 0, 0.65);
const bass   = audio.bass || 0;
const mid    = audio.mid || 0;
const high   = audio.high || 0;


// ------------------------------------------------
// 🌀 FIBONACCI INTERACTION
// ------------------------------------------------
this.fibonacci.setMouse(
  state.parallax?.x || 0,
  state.parallax?.y || 0
);


// ------------------------------------------------
// ⚡ AUDIO-DRIVEN MORPH
// ------------------------------------------------
const delta =
  0.008 +
  energy * 0.08 +
  bass * 0.04;

this.fibonacci.update(delta, audio);


// ------------------------------------------------
// 🔥 SCALE PULSE
// ------------------------------------------------
const pulse =
  1 +
  energy * 0.45 +
  bass * 0.6;

this.fibonacci.group.scale.setScalar(pulse);


// ------------------------------------------------
// 🌀 ROTATION FEEL
// ------------------------------------------------
this.fibonacci.group.rotation.y += 0.0015 + bass * 0.03;
this.fibonacci.group.rotation.x += mid * 0.01;

this.worldRotation += 0.0005 + energy * 0.002;

this.group.rotation.z =
  Math.sin(this.time * 0.15) * 0.03;

this.group.rotation.y = this.worldRotation;


// ------------------------------------------------
// 🚀 VELOCITY SYSTEM
// ------------------------------------------------
const targetSpeed = (p - 0.5) * 3;

this.velocity += (targetSpeed - this.velocity) * 0.05;

this.velocity *= 0.985;

this.velocity += intensity * 0.35;

const forward = this.velocity;


// ------------------------------------------------
// 🌌 STAR MOVEMENT
// ------------------------------------------------
this.updateLayer(this.far,  forward * 0.2);
this.updateLayer(this.mid,  forward * 0.6);
this.updateLayer(this.near, forward * 1.5);


// ------------------------------------------------
// 🌫️ DEPTH ATMOSPHERE
// ------------------------------------------------
const fog =
  0.9 +
  Math.sin(this.time * 0.2) * 0.05;

this.far.points.material.opacity =
  0.04 * fog;

this.mid.points.material.opacity =
  (0.14 + energy * 0.05) * fog;

this.near.points.material.opacity =
  (0.35 + energy * 0.25) * fog;


// ------------------------------------------------
// ✨ STAR PULSE
// ------------------------------------------------
const starPulse =
  1 +
  Math.sin(this.time * 2.0) * 0.03 +
  high * 0.25;

this.near.points.material.size =
  this.near.baseSize * starPulse;

this.mid.points.material.size =
  this.mid.baseSize *
  (1 + high * 0.08);


// ------------------------------------------------
// 💥 ENERGY FLASH
// ------------------------------------------------
if(energy > 0.65){

  this.near.points.material.opacity +=
    energy * 0.15;

}


// ------------------------------------------------
// 🌠 CINEMATIC DEPTH BREATHING
// ------------------------------------------------
this.fibonacci.group.position.z =
  -2 +
  Math.sin(this.time * 0.4) * 0.15 +
  energy * 0.25;

}


// ------------------------------------------------
// 🔁 STAR LAYER UPDATE
// ------------------------------------------------
updateLayer(layer, speed){

const pos = layer.points.geometry.attributes.position;

const depth = layer.depth;

for(let i = 0; i < pos.count; i++){

  let z = pos.getZ(i);

  const variance =
    0.7 +
    Math.sin(i * 12.9898) * 0.3;

  z += speed * 0.02 * variance;

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

this.fibonacci?.destroy();

[this.far, this.mid, this.near].forEach(layer => {

  this.group.remove(layer.points);

  layer.points.geometry.dispose();
  layer.points.material.dispose();

});

this.container.remove(this.group);

}

}