import * as THREE from "three";

export class SpaceTheme {

constructor(container){

this.container = container;
this.time = 0;

// ---------------- LAYERS ----------------
// konstante Tiefe (nicht mehr abhängig von scroll!)

this.far  = this.createLayer(1500, -30);
this.mid  = this.createLayer(1000, -15);
this.near = this.createLayer(600,  -5);

}


// ---------------- CREATE LAYER ----------------

createLayer(count, depth){

const geometry = new THREE.BufferGeometry();
const positions = [];

for(let i = 0; i < count; i++){

  positions.push(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    Math.random() * depth
  );

}

geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);

const material = new THREE.PointsMaterial({
  size: 0.05,
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
// 🚀 INFINITE MOTION (KEY FIX)
// ------------------------------------------------

// 👉 smooth loop (kein Ende mehr!)
const scrollMotion = Math.sin(p * Math.PI);

// 👉 konstante Bewegung + Boost
const forward = scrollMotion * 12 + i * 6;


// ------------------------------------------------
// 🌌 DEPTH MOVEMENT
// ------------------------------------------------

this.updateLayer(this.far,  forward * 0.2);
this.updateLayer(this.mid,  forward * 0.5);
this.updateLayer(this.near, forward * 1.0);


// ------------------------------------------------
// 🌌 ATMOSPHERE (subtle)
// ------------------------------------------------

let opacity = 0.9;

if(state.water > 0.5){
  opacity = 0.6;
}
else if(state.fire > 0.5){
  opacity = 0.8;
}

[this.far, this.mid, this.near].forEach(layer => {
  layer.points.material.opacity = opacity;
});

}


// ---------------- LAYER UPDATE ----------------

updateLayer(layer, speed){

const positions = layer.points.geometry.attributes.position;

for(let i = 0; i < positions.count; i++){

  let z = positions.getZ(i);

  z += speed * 0.02;

  // 🔥 recycle (infinite space)
  if(z > 2){
    z = -layer.depth;
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