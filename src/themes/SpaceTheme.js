import * as THREE from "three";

export class SpaceTheme {

constructor(container){

this.container = container;
this.time = 0;

// ---------------- LAYERS ----------------
// depth = positiv (wichtig!)

this.far  = this.createLayer(1500, 40);
this.mid  = this.createLayer(1000, 20);
this.near = this.createLayer(600,  10);

}


// ---------------- CREATE LAYER ----------------

createLayer(count, depth){

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);

for(let i = 0; i < count; i++){

  const i3 = i * 3;

  // XY verteilt
  positions[i3 + 0] = (Math.random() - 0.5) * 40;
  positions[i3 + 1] = (Math.random() - 0.5) * 40;

  // 🔥 KEY FIX: symmetrische Tiefe (kein collapsing!)
  positions[i3 + 2] = (Math.random() - 0.5) * depth;
}

geometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const material = new THREE.PointsMaterial({
  size: 0.03 + Math.random() * 0.05,
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
// 🚀 MOTION (DECOUPLED FROM SPACE SIZE)
// ------------------------------------------------

// smooth cinematic curve
const scrollMotion = Math.sin(p * Math.PI);

// forward motion
const forward = scrollMotion * 6 + i * 6;


// ------------------------------------------------
// 🌌 PARALLAX (REAL DEPTH)
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

  // 🔥 movement mit variation → natürlicher flow
  const movement = speed * 0.02;
  const variance = 0.6 + Math.sin(i * 12.9898) * 0.4;

  z += movement * variance;

  // 🔥 TRUE INFINITE SPACE (WRAP)
  if(z > depth * 0.5) z -= depth;
  if(z < -depth * 0.5) z += depth;

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