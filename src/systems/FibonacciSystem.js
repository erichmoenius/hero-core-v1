import * as THREE from "three";

export class FibonacciSystem {

constructor(scene){

this.scene = scene;

this.group = new THREE.Group();
this.group.name = "FibonacciSystem";
this.scene.add(this.group);

this.time = 0;

// ---------------- CONFIG ----------------

// balanced for performance
this.N = 400;
this.R = 2.8;

this.GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

this.shapeIndex = 0;
this.morphProgress = 1;
this.holdTimer = 0;
this.HOLD_TIME = 4;

// ---------------- INTERACTION ----------------

this.mouse = new THREE.Vector2();
this.mouseSmooth = new THREE.Vector2();

// ---------------- DATA ----------------

this.meshes = [];
this.targets = [];

// ---------------- INIT ----------------

this.init();

}


// ------------------------------------------------
// 🧱 INIT
// ------------------------------------------------

init(){

this.createTargets();
this.createParticles();

}


// ------------------------------------------------
// 🌀 SHAPES
// ------------------------------------------------

makeSphere(i){

const t = i / (this.N - 1);
const phi = Math.acos(1 - 2 * t);
const theta = this.GOLDEN_ANGLE * i;

return new THREE.Vector3(
  this.R * Math.sin(phi) * Math.cos(theta),
  this.R * Math.sin(phi) * Math.sin(theta),
  this.R * Math.cos(phi)
);

}

makeTorus(i){

const t = i / this.N;
const u = t * Math.PI * 2 * 18;
const v = this.GOLDEN_ANGLE * i * 6;

const r1 = 2.2;
const r2 = 0.9;

return new THREE.Vector3(
  (r1 + r2 * Math.cos(v)) * Math.cos(u),
  (r1 + r2 * Math.cos(v)) * Math.sin(u),
  r2 * Math.sin(v)
);

}

makeCube(i){

const t = i / (this.N - 1);
const phi = Math.acos(1 - 2 * t);
const theta = this.GOLDEN_ANGLE * i;

const v = new THREE.Vector3(
  Math.sin(phi) * Math.cos(theta),
  Math.sin(phi) * Math.sin(theta),
  Math.cos(phi)
);

const m = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));

return v.multiplyScalar(this.R / m);

}

makeHelix(i){

const t = i / this.N;
const angle = t * Math.PI * 20;

return new THREE.Vector3(
  1.8 * Math.cos(angle),
  (t - 0.5) * 6,
  1.8 * Math.sin(angle)
);

}


// ------------------------------------------------
// 🎯 TARGETS
// ------------------------------------------------

createTargets(){

const shapes = [
  (i)=>this.makeSphere(i),
  (i)=>this.makeTorus(i),
  (i)=>this.makeCube(i),
  (i)=>this.makeHelix(i)
];

this.targets = shapes.map(fn =>
  Array.from({ length: this.N }, (_, i) => fn(i))
);

}


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------

createParticles(){

const geo = new THREE.SphereGeometry(0.04, 8, 8);

for(let i = 0; i < this.N; i++){

  const hue = (i * 0.618033) % 1;

  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(hue, 0.8, 0.6)
  });

  const mesh = new THREE.Mesh(geo, mat);

  const p = this.targets[0][i];
  mesh.position.copy(p);

  mesh.userData = {
    from: p.clone(),
    to: p.clone()
  };

  this.group.add(mesh);
  this.meshes.push(mesh);
}

}


// ------------------------------------------------
// 🔁 MORPH
// ------------------------------------------------

startMorph(){

this.shapeIndex = (this.shapeIndex + 1) % this.targets.length;
this.morphProgress = 0;

this.meshes.forEach((m, i)=>{

  m.userData.from.copy(m.position);
  m.userData.to.copy(this.targets[this.shapeIndex][i]);

});

}


// ------------------------------------------------
// 🎮 INTERACTION
// ------------------------------------------------

setMouse(x, y){
this.mouse.set(x, y);
}

triggerMorph(){
this.holdTimer = this.HOLD_TIME;
}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------

update(delta = 0.016, audio = null){

this.time += delta;

// smooth mouse
this.mouseSmooth.lerp(this.mouse, 0.08);

// 🎧 audio (optional)
const energy = audio?.energy || 0;


// ---------------- MORPH ----------------

if(this.morphProgress < 1){

  this.morphProgress += 0.01;

  const t = this.morphProgress;

  const ease = t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;

  this.meshes.forEach(m=>{
    m.position.lerpVectors(
      m.userData.from,
      m.userData.to,
      ease
    );
  });

}else{

  this.holdTimer += delta;

  if(this.holdTimer >= this.HOLD_TIME){
    this.holdTimer = 0;
    this.startMorph();
  }

}


// ---------------- ROTATION ----------------

this.group.rotation.y += 0.002 + this.mouseSmooth.x * 0.02 + energy * 0.05;
this.group.rotation.x += this.mouseSmooth.y * 0.01;


// ---------------- SCALE (breathing + audio) ----------------

const s =
  1 +
  Math.sin(this.time * 1.2) * 0.03 +
  energy * 0.2;

this.group.scale.setScalar(s);

}


// ------------------------------------------------
// 🧹 CLEANUP
// ------------------------------------------------

destroy(){

this.meshes.forEach(m=>{
  m.geometry.dispose();
  m.material.dispose();
});

this.scene.remove(this.group);

}

}