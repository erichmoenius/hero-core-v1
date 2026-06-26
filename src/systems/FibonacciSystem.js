import * as THREE from "three";

export class FibonacciSystem {

constructor(scene){

this.scene = scene;

this.group = new THREE.Group();
this.group.name = "FibonacciSystem";
this.scene.add(this.group);

this.time = 0;

// ------------------------------------------------
// 💡 FIBONACCI LIGHTING
// ------------------------------------------------

this.cyanLight = new THREE.PointLight(
  0x66ccff,
  12.0,
  50
);

this.cyanLight.position.set(
  -4,
  2,
  3
);

this.scene.add(this.cyanLight);

this.violetLight = new THREE.PointLight(
  0x8866ff,
  10.0,
  50
);

this.violetLight.position.set(
  4,
  -2,
  2
);

this.scene.add(this.violetLight);

this.goldLight = new THREE.PointLight(
  0xffd38a,
  4.0,
  50
);

this.goldLight.position.set(
  0,
  4,
  -2
);

this.scene.add(this.goldLight);

// ------------------------------------------------
// 💡 RIM LIGHT
// ------------------------------------------------

this.rimLight = new THREE.PointLight(

  0xb8dfff,

  10,

  80

);

this.rimLight.position.set(

  -8,

  4,

  -6

);

this.scene.add(this.rimLight);

// ---------------- CONFIG ----------------
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
this.group.scale.setScalar(0.5);

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

const mat = new THREE.MeshStandardMaterial({

  color: new THREE.Color(
    0.58,
    0.60,
    0.66
  ),

  emissive: new THREE.Color(
  0.0015,
  0.0020,
  0.030
),

  emissiveIntensity: 0.35,

  metalness: 1.0,

  roughness: 0.15,

  transparent: true,

  opacity: 0.9
  
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

// ------------------------------------------------
// 💡 RIM LIGHT MOTION
// ------------------------------------------------

this.rimLight.position.x =

  -8 +

  Math.sin(

    this.time * 0.18

  ) * 2;

this.rimLight.position.y =

  4 +

  Math.cos(

    this.time * 0.15

  ) * 1;

// smooth mouse
this.mouseSmooth.lerp(this.mouse, 0.08);

// 🎧 audio
const energy = audio?.energy || 0;


// ---------------- MORPH ----------------

if(this.morphProgress < 1){

  // 🔥 audio-driven morph speed
  this.morphProgress += 0.01 + energy * 0.06;

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

  // 🔥 dynamic hold (audio shortens pause)
  const dynamicHold = this.HOLD_TIME * (1 - energy * 0.7);

  if(this.holdTimer >= dynamicHold){
    this.holdTimer = 0;
    this.startMorph();
  }

}


// ---------------- ROTATION ----------------

this.group.rotation.y += 0.001 + this.mouseSmooth.x * 0.01 + energy * 0.005;
this.group.rotation.x += this.mouseSmooth.y * 0.01;


// ---------------- SCALE (breathing + audio) ----------------

const s =
  1 +
  Math.sin(this.time * 1.2) * 0.03 +
  energy * 0.05;

this.group.scale.setScalar(s);


// ---------------- OPACITY + TITANIUM SHIMMER ----------------

const opacityPulse = 0.6 + energy * 0.8;

this.meshes.forEach((m, i)=>{

  m.material.opacity = opacityPulse;

  const shimmer =

    Math.sin(

      this.time * 1.5 +

      i * 0.25

    ) * 0.35;

  m.material.color.setRGB(

    0.60 + shimmer * 0.15,

    0.62 + shimmer * 0.08,

    0.68 + shimmer * 0.20

  );

  // --------------------------------
  // Spectral metal reflections
  // --------------------------------

  const spectral =

    Math.sin(

      this.time * 0.8 +

      i * 0.11

    );

  if(spectral > 0.6){

    m.material.emissive.setRGB(

      0.03,
      0.08,
      0.12

    );

  }else if(spectral < -0.6){

    m.material.emissive.setRGB(

      0.10,
      0.07,
      0.02

    );

  }else{

    m.material.emissive.setRGB(

      0.03,
      0.03,
      0.05

    );

  }

});


// ---------------- DEPTH DRIFT ----------------

this.group.position.z =
  -2 + Math.sin(this.time * 0.5) * 0.3;

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