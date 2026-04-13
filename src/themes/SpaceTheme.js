import * as THREE from "three";

export class SpaceTheme {

constructor(container){

this.container = container;
this.time = 0;

// ---------------- LAYERS ----------------
// depth is now POSITIVE (important!)

this.far  = this.createLayer(1500, 30);
this.mid  = this.createLayer(1000, 15);
this.near = this.createLayer(600,  6);

}


// ---------------- CREATE LAYER ----------------

createLayer(count, depth){

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);

for(let i = 0; i < count; i++){

  const i3 = i * 3;

  positions[i3 + 0] = (Math.random() - 0.5) * 40;
  positions[i3 + 1] = (Math.random() - 0.5) * 40;

  // 🔥 IMPORTANT: distribute BETWEEN -depth → +depth
  positions[i3 + 2] = -Math.random() * depth;
}

geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const material = new THREE.PointsMaterial({
  size: 0.04 + Math.random() * 0.04,
  transparent: true,
  opacity: 0.9,
  depthWrite: false
});

const points = new THREE.Points(geometry, material);

this.container.add(points);

return { points, depth };

}


// ---------------- UPDATE ----------------

update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;


// ------------------------------------------------
// 🚀 MOTION (NO COLLAPSE)
// ------------------------------------------------

// smooth cinematic motion
const scrollMotion = Math.sin(p * Math.PI);

// forward movement
const forward = scrollMotion * 8 + i * 6;


// ------------------------------------------------
// 🌌 PARALLAX DEPTH
// ------------------------------------------------

this.updateLayer(this.far,  forward * 0.2);
this.updateLayer(this.mid,  forward * 0.6);
this.updateLayer(this.near, forward * 1.4);


// ------------------------------------------------
// 🌌 ATMOSPHERE
// ------------------------------------------------

let opacity = 0.9;

if(state.water > 0.5) opacity = 0.6;
if(state.fire > 0.5)  opacity = 0.8;

this.far.points.material.opacity  = opacity * 0.6;
this.mid.points.material.opacity  = opacity * 0.8;
this.near.points.material.opacity = opacity;

}


// ---------------- LAYER UPDATE ----------------

updateLayer(layer, speed){

const positions = layer.points.geometry.attributes.position;
const depth = layer.depth;

for(let i = 0; i < positions.count; i++){

  let z = positions.getZ(i);

  // 🚀 move forward
  z += speed * 0.02;

  // 🔥 TRUE INFINITE SPACE (WRAP, NOT RESET)
  if(z > 2){
    z -= depth;
  }

  if(z < -depth){
    z += depth;
  }

  positions.setZ(i, z);
}

positions.needsUpdate = true;

}


// ---------------- CLEANUP ----------------

destroy(){

[this.far, this.mid, this.near].forEach(layer => {

  this.container.remove(layer.points);

  layer.points.geometry.dispose();
  layer.points.material.dispose();

});

}

}