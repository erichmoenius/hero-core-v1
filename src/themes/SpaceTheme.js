import * as THREE from "three";

import { FibonacciSystem } from "../systems/FibonacciSystem.js";

import { PlasmaBlob } from "../systems/plasma/PlasmaBlob.js";

import { NarrativeSpiral } from "../systems/NarrativeSpiral.js";

export class SpaceTheme {

constructor(container, gui){

this.container = container;

this.gui = gui;

this.time = 0;

this.velocity = 0;

this.kickPulse = 0;

this.stardust = [];

this.communicationParticles = [];

// ------------------------------------------------
// 🌌 WORLD GROUP
// ------------------------------------------------

this.group = new THREE.Group();

this.container.add(this.group);

// ------------------------------------------------
// 🖱️ SPACE ZOOM
// ------------------------------------------------

this.zoom = 0;

this.zoomVelocity = 0;

// ------------------------------------------------
// 🌀 FIBONACCI
// ------------------------------------------------

this.fibonacci = new FibonacciSystem(
  this.group
);

this.fibonacci.group.position.z = -12;

this.narrativeSpiral =   new NarrativeSpiral(
  this.group
);

// ------------------------------------------------
// 🫧 PLASMA BLOB
// ------------------------------------------------

this.plasmaBlob =
  new PlasmaBlob(this.container);

this.plasmaBlob.setPosition(
  -1.8,
  0.4,
  -6.5
);

this.plasmaBlob.applyPreset(
  "nebula"
);

// ------------------------------------------------
// 🎛️ PLASMA GUI
// ------------------------------------------------

if(this.gui){

  this.plasmaFolder =

    this.gui.addFolder(
      "🫧 Plasma"
    );

  this.plasmaBlob.addGUI(
    this.plasmaFolder
  );

}

// ------------------------------------------------
// ⭐ STAR LAYERS
// ------------------------------------------------

this.far = this.createLayer(
  800,
  60,
  0.02,
  0x334488
);

this.mid = this.createLayer(
  500,
  30,
  0.03,
  0xaaccff
);

this.near = this.createLayer(
  250,
  15,
  0.05,
  0xaa8866
);

// ------------------------------------------------
// 🌠 GLOBAL MOTION
// ------------------------------------------------

this.worldRotation = 0;

this.cameraDrift =
  new THREE.Vector2();

this.delayedEnergy = 0;

this.mouseField = new THREE.Vector2();

this.mouseVelocity = new THREE.Vector2();

// ------------------------------------------------
// 🌀 COMMUNICATION SYSTEM
// ------------------------------------------------

this.communication = {

  connection: 0,

  signal: 0,

  resonance: 0,

  coherence: 0

};

this.createCommunicationField();

console.log(
  "COMM FIELD CREATED"
);

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

const px =
  state.parallax?.x || 0;

const py =
  state.parallax?.y || 0;

// ------------------------------------------------
// 🖱️ DRIFT
// ------------------------------------------------

this.cameraDrift.x +=

  (
    (px * 0.6) -
    this.cameraDrift.x
  ) * follow;

this.cameraDrift.y +=

  (
    (py * 0.4) -
    this.cameraDrift.y
  ) * follow;

// ------------------------------------------------
// 🚀 SPACE NAVIGATION
// ------------------------------------------------

camera.position.x +=

  (
    this.cameraDrift.x -
    camera.position.x
  ) * 0.08;

camera.position.y +=

  (
    -this.cameraDrift.y -
    camera.position.y
  ) * 0.08;

// ------------------------------------------------
// 🌌 ZOOM
// ------------------------------------------------

camera.position.z = 5;

}

// ------------------------------------------------
// ⭐ CREATE STAR LAYER
// ------------------------------------------------

createLayer(count, depth, size, color){

const geometry =
  new THREE.BufferGeometry();

const positions =
  new Float32Array(
    count * 3
  );

for(let i = 0; i < count; i++){

  const i3 = i * 3;

  positions[i3] =

    (Math.random() - 0.5) *
    60;

  positions[i3 + 1] =

    (Math.random() - 0.5) *
    60;

  positions[i3 + 2] =

    (Math.random() - 0.5) *
    depth;

}

geometry.setAttribute(

  "position",

  new THREE.BufferAttribute(
    positions,
    3
  )

);

const material =
  new THREE.PointsMaterial({

    size,

    color,

    transparent: true,

    opacity: 0.25,

    depthWrite: false,

    blending:
      THREE.AdditiveBlending

  });

const points =
  new THREE.Points(
    geometry,
    material
  );

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

// ------------------------------------------------
// 🌌 COSMIC BREATH
// ------------------------------------------------

const breath =

  1.0 +

  Math.sin(

    this.time * 0.25

  ) * 0.18;

const p =
  state.progress ?? 0;

const intensity =
  state.intensity ?? 0;

const audio =
  state.audio || {};

  this.narrativeSpiral.update(
  0.016,
  audio
);

const response =

  1.0 +

  Math.sin(

    this.time * 0.25 - 1.0

  ) * 0.35;

this.narrativeSpiral.group.scale.setScalar(
  response
);

if(audio.kick){

  this.kickPulse = 1;

}

// ------------------------------------------------
// 🖱️ SPACE ZOOM INPUT
// ------------------------------------------------

const wheel =
  state.wheel?.delta || 0;

console.log(
  "WHEEL",
  state.wheel
);

this.zoomVelocity +=
  wheel * 1.0; 

// ------------------------------------------------
// 🌊 ZOOM DAMPING
// ------------------------------------------------

this.zoomVelocity *= 0.9;

// ------------------------------------------------
// 🌌 APPLY ZOOM
// ------------------------------------------------

this.zoom +=
  this.zoomVelocity;


// ------------------------------------------------
// 🌫️ BREATHING
// ------------------------------------------------

this.zoom +=

  Math.sin(
    this.time * 0.3
  ) * 0.003;

// ------------------------------------------------
// 🛑 LIMITS
// ------------------------------------------------

this.zoom =
  THREE.MathUtils.clamp(

    this.zoom,

    -30,

    6

  );

// ------------------------------------------------
// 🌌 DEPTH FACTOR
// ------------------------------------------------

const depthFactor =

  THREE.MathUtils.clamp(

    Math.abs(this.zoom) / 30,

    0,

    1

  );

// ------------------------------------------------
// 🎧 AUDIO
// ------------------------------------------------

const energy =

  Math.pow(
    audio.energy || 0,
    0.65
  );

this.delayedEnergy =

  THREE.MathUtils.lerp(

    this.delayedEnergy,

    energy,

    0.12

  );

const bass =
  audio.bass || 0;

const mid =
  audio.mid || 0;

const high =
  audio.high || 0;

// ------------------------------------------------
// 🌀 FIBONACCI INTERACTION
// ------------------------------------------------

const targetMouseX =
  state.parallax?.x || 0;

const targetMouseY =
  state.parallax?.y || 0;

// ------------------------------------------------
// 🌌 INTERACTION INERTIA
// ------------------------------------------------

this.mouseVelocity.x +=

  (

    targetMouseX -

    this.mouseField.x

  ) * 0.015;

this.mouseVelocity.y +=

  (

    targetMouseY -

    this.mouseField.y

  ) * 0.015;


// ------------------------------------------------
// 🌀 DAMPING
// ------------------------------------------------

this.mouseVelocity.multiplyScalar(0.965);


// ------------------------------------------------
// 🌠 APPLY
// ------------------------------------------------

this.mouseField.add(
  this.mouseVelocity
);


// ------------------------------------------------
// 🖱️ FIBONACCI FIELD INPUT
// ------------------------------------------------

this.fibonacci.setMouse(

  this.mouseField.x,

  this.mouseField.y

);

// ------------------------------------------------
// ⚡ AUDIO-DRIVEN MORPH
// ------------------------------------------------

const delta =

  0.008 +

  this.delayedEnergy * 0.08 +

  bass * 0.04;

  this.fibonacci.update(
  delta,
  audio
);

// ------------------------------------------------
// 🔥 SCALE PULSE
// ------------------------------------------------


const fibBaseScale = 3.0;

const fibAudioScale =
  this.delayedEnergy * 0.48 +
  bass * 0.7 +
  this.kickPulse * 0.8;

this.fibonacci.group.scale.setScalar(

  fibBaseScale +

  fibAudioScale

);

// ------------------------------------------------
// 🌀 ROTATION FEEL
// ------------------------------------------------

this.fibonacci.group.rotation.y +=

  0.00012 +

  this.delayedEnergy * 0.01;


// ------------------------------------------------
// 🌌 WORLD ROTATION
// ------------------------------------------------

// this.group.rotation.z =
//   Math.sin(
//     this.time * 0.15
//   ) * 0.03;

// this.group.rotation.y =
  this.worldRotation;

// ------------------------------------------------
// 🫧 PLASMA UPDATE
// ------------------------------------------------

this.plasmaBlob.update(
  audio,
  this.time
);

if(this.plasmaBlob?._mesh){

  this.plasmaBlob._mesh.scale.setScalar(

    this.plasmaBlob.cfg.scale *

    breath

  );

}

// ------------------------------------------------
// 🌌 CINEMATIC PLASMA FLOAT
// ------------------------------------------------

const driftY =

  Math.sin(

    this.time * 0.22

  ) *

  (

    0.18 +

    this.delayedEnergy * 0.25

  ) +

  this.mouseField.y * 0.08;

// ------------------------------------------------
// 🌌 STABLE POSITION
// ------------------------------------------------

this.plasmaBlob.setPosition(

  -1.6,

  driftY + 0.3,

  -6.5

);

// ------------------------------------------------
// 🚀 VELOCITY SYSTEM
// ------------------------------------------------

const targetSpeed =
  (p - 0.5) * 3;

this.velocity +=

  (
    targetSpeed -
    this.velocity
  ) * 0.05;

this.velocity *= 0.985;

this.velocity +=
  intensity * 0.35;

const forward =
  this.velocity;

// ------------------------------------------------
// 🌌 DEPTH SPEED
// ------------------------------------------------

const depthSpeed =
  1 + depthFactor * 4;

// ------------------------------------------------
// ⭐ STAR MOVEMENT
// ------------------------------------------------

this.updateLayer(
  this.far,
  forward * 0.2 * depthSpeed
);

this.updateLayer(
  this.mid,
  forward * 0.6 * depthSpeed
);

this.updateLayer(
  this.near,
  forward * 1.5 * depthSpeed
);

// ------------------------------------------------
// 🌫️ DEPTH ATMOSPHERE
// ------------------------------------------------

const fog =

  0.9 +

  Math.sin(
    this.time * 0.2
  ) * 0.05 +

  depthFactor * 0.15;

this.far.points.material.opacity =
  0.04 * fog;

this.mid.points.material.opacity =

  (
    0.14 +
    energy * 0.05
  ) * fog;

this.near.points.material.opacity =

  (
    0.18 +
    energy * 0.12
  ) * fog;

// ------------------------------------------------
// ✨ STAR PULSE
// ------------------------------------------------

const starPulse =

  1 +

  Math.sin(
    this.time * 2.0
  ) * 0.03 +

  high * 0.25;

this.near.points.material.size =

  this.near.baseSize *

  starPulse;

this.mid.points.material.size =

  this.mid.baseSize *

  (
    1 +
    high * 0.08
  );

this.far.points.material.size =

  this.far.baseSize *

  (
    1 +
    depthFactor * 0.4
  );

this.near.points.material.size *=

  1 +
  depthFactor * 0.6;

// ------------------------------------------------
// 💥 ENERGY FLASH
// ------------------------------------------------

if(energy > 0.35){

  this.near.points.material.opacity +=
    energy * 0.15;

}

// ------------------------------------------------
// 🌠 CINEMATIC DEPTH BREATHING
// ------------------------------------------------

const blobPos =
  this.plasmaBlob._mesh.position;

  const fibPos =
  this.fibonacci.group.position;

const distance =
  fibPos.distanceTo(blobPos);

const connection =

  THREE.MathUtils.clamp(

    1.0 - distance / 6.0,

    0,

    1

  );

this.communication.connection =
  connection;

// ------------------------------------------------
// 📡 FIBONACCI SIGNAL
// ------------------------------------------------

const signal =

  (
    bass * 0.5 +
    mid * 0.3 +
    high * 0.2
  ) *

  connection;

this.communication.signal +=

  (
    signal -
    this.communication.signal
  ) * 0.05;  

console.log(

  "COMM",

  this.communication

);

//if(this.plasmaBlob._mesh){
//
  //const pulse =
    //1.0 +
    //connection * 0.12;

  //this.plasmaBlob._mesh.scale.setScalar(
    //pulse
  //);

//}

// ------------------------------------------------
// 🌀 ORBITAL RELATIONSHIP
// ------------------------------------------------

const orbitRadius =

  2.8 +

  this.delayedEnergy * 0.8;

const orbitSpeed =

  0.04 +

  this.delayedEnergy * 0.08;

const orbitX =

  Math.cos(
    this.time * orbitSpeed
  ) * orbitRadius;

const orbitY =

  Math.sin(
    this.time * orbitSpeed * 0.7
  ) * 0.8;


// ------------------------------------------------
// 🌌 CINEMATIC FOLLOW
// ------------------------------------------------

this.fibonacci.group.position.x +=

  (

    blobPos.x +

    orbitX -

    this.fibonacci.group.position.x

  ) * 0.012;

this.fibonacci.group.position.y +=

  (

    blobPos.y +

    orbitY -

    this.fibonacci.group.position.y

  ) * 0.01;

console.log(
  "fibY:",
  this.fibonacci.group.position.y
);  

console.log(
  "group",
  this.group.position.x,
  this.group.position.y,
  this.group.position.z
);

// ------------------------------------------------
// 🌠 DEPTH
// ------------------------------------------------

this.fibonacci.group.position.z =

  -11.5 +

  Math.sin(
    this.time * 0.12
  ) * 0.12 +

  this.delayedEnergy * 0.25;

// ------------------------------------------------
// 🌌 SPACE DRIFT
// ------------------------------------------------

// ------------------------------------------------
// ✨ COMMUNICATION FIELD
// ------------------------------------------------

for(const p of this.communicationParticles){

  const t =
    this.time +
    p.userData.seed;

  p.position.y +=
    Math.sin(t) * 0.0008;

  p.position.x +=
    Math.cos(t * 0.7) * 0.0005;

}

// ------------------------------------------------
// ✨ COMMUNICATION PARTICLES
// ------------------------------------------------

// ------------------------------------------------
// ✨ MAGNETIC COMMUNICATION
// ------------------------------------------------

const storyPos =
  this.narrativeSpiral.group.position;

for(const particle of this.communicationParticles){

/*  
  const target =

    particle.userData.direction > 0

      ? storyPos

      : blobPos;

  const dir =

  target.clone()
    .sub(particle.position)
    .normalize();

const force =
  dir.clone()
     .multiplyScalar(0.02);

const orbit =

  new THREE.Vector3(

    -dir.y,
     dir.x,
     0

  ).multiplyScalar(0.001);

const targetDistance =

  particle.position.distanceTo(
    target
  );

orbit.multiplyScalar(

  Math.min(
    targetDistance * 0.15,
    1.0
  )

);

force.add(orbit);

  particle.userData.velocity.add(force);
*/  

particle.userData.velocity.x +=

  Math.sin(

    this.time * 0.8 +

    particle.userData.seed

  ) * 0.0004;

particle.userData.velocity.y +=

  Math.cos(

    this.time * 0.6 +

    particle.userData.seed

  ) * 0.0004;

  particle.userData.velocity.multiplyScalar(
  0.995
);

particle.position.add(
  particle.userData.velocity
);

  particle.userData.velocity.multiplyScalar(
    0.97
  );

  particle.position.add(
    particle.userData.velocity
  );

  particle.position.x +=

  Math.sin(

    this.time * 2.5 +

    particle.userData.seed

  ) * 0.008;

particle.position.y +=

  Math.cos(

    this.time * 1.8 +

    particle.userData.seed

  ) * 0.012;

  particle.position.y +=

  Math.sin(

    this.time * 2 +

    particle.userData.seed

  ) * 0.01;

particle.position.x +=

  Math.cos(

    this.time * 1.7 +

    particle.userData.seed

  ) * 0.005;

  // const distance =
  // particle.position.distanceTo(
  //   target
  // );

// if(distance < 0.3){

//   if(particle.userData.direction > 0){

//     particle.position.copy(
//       blobPos
//     );

//   }else{

//     particle.position.copy(
//       storyPos
//     );

//   }

//   particle.userData.velocity.set(
//     0,
//     0,
//     0
//   );

// }

}

this.group.position.z =
  this.zoom * 0.4;

}

// ------------------------------------------------
// 🔁 STAR LAYER UPDATE
// ------------------------------------------------

createCommunicationField(){

  const geo =
    new THREE.SphereGeometry(
      0.02,
      3,
      3
    );

  for(let i = 0; i < 150; i++){

    const mat =
  new THREE.MeshBasicMaterial({

    color:

      i % 2 === 0

        ? 0x66ddff   // Blob blue

        : 0xffcc66,  // Storyteller gold

    transparent: true,

    opacity: 1.0

  });

    const particle =
      new THREE.Mesh(
        geo,
        mat
      );

    particle.position.set(

      THREE.MathUtils.randFloat(
        -1.5,
        3.5
      ),

      THREE.MathUtils.randFloat(
        -1.5,
        1.5
      ),

      THREE.MathUtils.randFloat(
        -8,
        -6
      )

    );

    particle.userData = {

  seed:
    Math.random() * 100,

  velocity:
    new THREE.Vector3(),

  direction:
    i % 2 === 0 ? 1 : -1

};

    this.group.add(
      particle
    );

    this.communicationParticles.push(
      particle
    );

  }


}

updateLayer(layer, speed){

const pos =

  layer.points.geometry
  .attributes.position;

const depth =
  layer.depth;

for(let i = 0; i < pos.count; i++){

  let z =
    pos.getZ(i);

  const variance =

    0.7 +

    Math.sin(
      i * 12.9898
    ) * 0.3;

  z +=

    speed *

    0.02 *

    variance;

  if(z > depth * 0.5){

    z -= depth;

  }

  if(z < -depth * 0.5){

    z += depth;

  }

  pos.setZ(i, z);

}

pos.needsUpdate = true;

}

// ------------------------------------------------
// 🧹 CLEANUP
// ------------------------------------------------

destroy(){

this.plasmaFolder?.destroy();

this.fibonacci?.destroy();

this.plasmaBlob?.destroy();

[this.far, this.mid, this.near]
.forEach(layer => {

  this.group.remove(
    layer.points
  );

  layer.points.geometry.dispose();

  layer.points.material.dispose();

});

this.container.remove(
  this.group
);

}

}