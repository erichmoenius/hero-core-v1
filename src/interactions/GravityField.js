export class GravityField {

constructor(container, options = {}){

this.container = container;

this.type = "gravity";

this.enabled = false;


// ------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------

this.settings = {

  count: 320,

  gravity: 0.55,

  gravityRadius: 350,

  repulseRadius: 28,

  repulseForce: 2.2,

  drag: 0.968,

  returnForce: 0.0012,

  turbulence: 0.006,

  maxSpeed: 3.8,

  inertia: 0.10,

  elasticDamping: 0.72,

  opacity: 0.75

};


// ------------------------------------------------
// ⚙️ OVERRIDE
// ------------------------------------------------

Object.assign(
  this.settings,
  options
);


// ------------------------------------------------
// 🖼️ CANVAS
// ------------------------------------------------

this.canvas =
  document.createElement("canvas");

this.canvas.style.position = "fixed";

this.canvas.style.top = "0";

this.canvas.style.left = "0";

this.canvas.style.width = "100%";

this.canvas.style.height = "100%";

this.canvas.style.pointerEvents = "none";

this.canvas.style.zIndex = "2";


// ------------------------------------------------
// 🌌 CONTAINER SAFETY
// ------------------------------------------------

const computed =
  getComputedStyle(this.container);

if(computed.position === "static"){

  this.container.style.position =
    "relative";

}

this.container.appendChild(
  this.canvas
);

this.ctx =
  this.canvas.getContext("2d");


// ------------------------------------------------
// 📦 STATE
// ------------------------------------------------

this.width = 0;

this.height = 0;

this.audioBoost = 1;

this.fieldStrength = 0;


// ------------------------------------------------
// 👻 GHOST
// ------------------------------------------------

this.ghost = {

  x: 0,

  y: 0

};

this.ghostVelocity = {

  x: 0,

  y: 0

};


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------

this.particles = [];


// ------------------------------------------------
// 📐 RESIZE
// ------------------------------------------------

this.resize =
  this.resize.bind(this);

window.addEventListener(
  "resize",
  this.resize
);

this.resize();

this.createParticles();

}


// ------------------------------------------------
// 🎛️ ENABLE
// ------------------------------------------------

enable(){

this.enabled = true;

this.canvas.style.display = "block";

}


// ------------------------------------------------
// ⛔ DISABLE
// ------------------------------------------------

disable(){

this.enabled = false;

this.canvas.style.display = "none";

}


// ------------------------------------------------
// 🎨 STYLE
// ------------------------------------------------

setStyle(style = "default"){

this.style = style;

}


// ------------------------------------------------
// 📐 RESIZE
// ------------------------------------------------
resize(){

  const rect =
    this.container.getBoundingClientRect();

  const dpr =
    window.devicePixelRatio || 1;

  this.width  = rect.width;
  this.height = rect.height;

  this.canvas.width  =
    this.width * dpr;

  this.canvas.height =
    this.height * dpr;

  this.canvas.style.width =
    `${this.width}px`;

  this.canvas.style.height =
    `${this.height}px`;

  this.ctx.setTransform(
    1,0,0,1,0,0
  );

  this.ctx.scale(dpr, dpr);

  this.ghost.x =
    this.width * 0.5;

  this.ghost.y =
    this.height * 0.5;

}


// ------------------------------------------------
// ✨ CREATE PARTICLES
// ------------------------------------------------

createParticles(){

this.particles = [];

for(
  let i = 0;
  i < this.settings.count;
  i++
){

  const x =
    Math.random() * this.width;

  const y =
    Math.random() * this.height;

  const warm =
    Math.random() < 0.15;

  this.particles.push({

    x,
    y,

    originX: x,
    originY: y,

    vx: 0,
    vy: 0,

    size:
      0.4 +
      Math.random() * 1.6,

    brightness:
      0.3 +
      Math.random() * 0.7,

    r:
      warm
        ? 180 + Math.random() * 60
        : 80 + Math.random() * 60,

    g:
      warm
        ? 160 + Math.random() * 40
        : 130 + Math.random() * 80,

    b:
      warm
        ? 100 + Math.random() * 40
        : 255,

    driftX:
      Math.random() * Math.PI * 2,

    driftY:
      Math.random() * Math.PI * 2,

    driftSpeed:
      0.003 +
      Math.random() * 0.007,

    twinkle:
      Math.random() * Math.PI * 2,

    twinkleSpeed:
      0.01 +
      Math.random() * 0.025

  });

}

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------

update(mouse, audio = {}, time = 0){

if(!this.enabled) return;


// ------------------------------------------------
// 🧹 CLEAR
// ------------------------------------------------

this.ctx.clearRect(
  0,
  0,
  this.width,
  this.height
);


// ------------------------------------------------
// 🎧 AUDIO
// ------------------------------------------------

const raw =
  audio.bass ??
  audio.energy ??
  0;

const targetAudio =
  0.7 + Math.min(1, raw) * 1.3;

this.audioBoost +=
  (targetAudio - this.audioBoost) * 0.06;


// ------------------------------------------------
// 🖱️ PIXEL POSITION
// ------------------------------------------------

const px =
  (mouse.x * 0.5 + 0.5) * this.width;

console.log(
  "mouse",
  mouse.x.toFixed(2),
  "px",
  Math.round(px),
  "width",
  this.width
);  

const py =
  (mouse.y * 0.5 + 0.5) * this.height;


// ------------------------------------------------
// 👻 GHOST INERTIA
// ------------------------------------------------

const dx =
  px - this.ghost.x;

const dy =
  py - this.ghost.y;

this.ghostVelocity.x +=
  dx * this.settings.inertia;

this.ghostVelocity.y +=
  dy * this.settings.inertia;

this.ghostVelocity.x *=
  this.settings.elasticDamping;

this.ghostVelocity.y *=
  this.settings.elasticDamping;

this.ghost.x +=
  this.ghostVelocity.x;

this.ghost.y +=
  this.ghostVelocity.y;

const ghostSpeed = Math.sqrt(

  this.ghostVelocity.x ** 2 +
  this.ghostVelocity.y ** 2

);


// ------------------------------------------------
// 🌌 FIELD STRENGTH
// ------------------------------------------------

const targetStrength =
  Math.min(
    1,
    0.4 + ghostSpeed * 0.06
  );

this.fieldStrength +=
  (targetStrength - this.fieldStrength) * 0.05;


// ------------------------------------------------
// ✨ UPDATE PARTICLES
// ------------------------------------------------

for(const p of this.particles){

  p.twinkle +=
    p.twinkleSpeed;

  p.driftX +=
    p.driftSpeed;

  p.driftY +=
    p.driftSpeed * 0.81;


// ------------------------------------------------
// 🌪️ TURBULENCE
// ------------------------------------------------

  p.vx +=

    Math.sin(p.driftX) *

    this.settings.turbulence;

  p.vy +=

    Math.cos(p.driftY) *

    this.settings.turbulence;


// ------------------------------------------------
// 🌑 GRAVITY
// ------------------------------------------------

  const gx =
    this.ghost.x - p.x;

  const gy =
    this.ghost.y - p.y;

  const dist =
    Math.sqrt(gx * gx + gy * gy);

  console.log(
  "ghostX",
  Math.round(this.ghost.x),
  "radius",
  this.settings.gravityRadius
);
  
    if(
    dist <
    this.settings.gravityRadius
  ){

    const norm =

      dist /
      this.settings.gravityRadius;

    const strength =

      (1 - norm) ** 2;

    const force =

      this.settings.gravity *

      strength /

      Math.max(dist, 2);

    p.vx += gx * force;

    p.vy += gy * force;

  }


// ------------------------------------------------
// 💥 REPULSION
// ------------------------------------------------

  if(
    dist <
    this.settings.repulseRadius
  ){

    const rf =

      (
        1 -
        dist /
        this.settings.repulseRadius
      ) *

      this.settings.repulseForce;

    p.vx -=
      (gx / dist) * rf;

    p.vy -=
      (gy / dist) * rf;

  }


// ------------------------------------------------
// 🏠 RETURN
// ------------------------------------------------

  p.vx +=

    (
      p.originX - p.x
    ) *

    this.settings.returnForce;

  p.vy +=

    (
      p.originY - p.y
    ) *

    this.settings.returnForce;


// ------------------------------------------------
// 🌊 DRAG
// ------------------------------------------------

  p.vx *=
    this.settings.drag;

  p.vy *=
    this.settings.drag;


// ------------------------------------------------
// 🚀 SPEED LIMIT
// ------------------------------------------------

  const speed = Math.sqrt(
    p.vx ** 2 +
    p.vy ** 2
  );

  if(
    speed >
    this.settings.maxSpeed
  ){

    p.vx =

      (
        p.vx / speed
      ) *

      this.settings.maxSpeed;

    p.vy =

      (
        p.vy / speed
      ) *

      this.settings.maxSpeed;

  }


// ------------------------------------------------
// 📍 POSITION
// ------------------------------------------------

  p.x += p.vx;

  p.y += p.vy;


// ------------------------------------------------
// 🌌 WRAP
// ------------------------------------------------

  if(p.x < -10){
    p.x = this.width + 10;
  }

  if(p.x > this.width + 10){
    p.x = -10;
  }

  if(p.y < -10){
    p.y = this.height + 10;
  }

  if(p.y > this.height + 10){
    p.y = -10;
  }


// ------------------------------------------------
// ✨ DRAW
// ------------------------------------------------

  this.drawParticle(
    p,
    dist
  );

}


// ------------------------------------------------
// 🌑 DRAW CORE
// ------------------------------------------------

this.drawCore();

}


// ------------------------------------------------
// ✨ DRAW PARTICLE
// ------------------------------------------------

drawParticle(p, dist){

const ctx = this.ctx;

ctx.globalCompositeOperation =
  "lighter";

const twinkle =

  0.5 +

  Math.sin(p.twinkle) * 0.5;

const fieldBoost =

  dist <
  this.settings.gravityRadius

    ? 1 +

      (
        1 -
        dist /
        this.settings.gravityRadius
      ) *

      1.8 *

      this.audioBoost

    : 1;

const alpha =

  p.brightness *

  twinkle *

  fieldBoost *

  this.settings.opacity;


// ------------------------------------------------
// 🌌 GLOW
// ------------------------------------------------

const glow =
  ctx.createRadialGradient(
    p.x,
    p.y,
    0,
    p.x,
    p.y,
    p.size * 5
  );

glow.addColorStop(
  0,
  `rgba(${p.r},${p.g},${p.b},${alpha * 0.45})`
);

glow.addColorStop(
  0.5,
  `rgba(${p.r},${p.g},${p.b},${alpha * 0.12})`
);

glow.addColorStop(
  1,
  `rgba(0,0,0,0)`
);

ctx.beginPath();

ctx.arc(
  p.x,
  p.y,
  p.size * 5,
  0,
  Math.PI * 2
);

ctx.fillStyle = glow;

ctx.fill();


// ------------------------------------------------
// 🌟 CORE
// ------------------------------------------------

ctx.beginPath();

ctx.arc(
  p.x,
  p.y,
  p.size,
  0,
  Math.PI * 2
);

ctx.fillStyle =
  `rgba(${p.r},${p.g},${p.b},${alpha})`;

ctx.fill();

ctx.globalCompositeOperation =
  "source-over";

}


// ------------------------------------------------
// 🌑 DRAW FIELD CORE
// ------------------------------------------------

drawCore(){

const ctx = this.ctx;

ctx.globalCompositeOperation =
  "lighter";

const radius =
  this.settings.repulseRadius;

const glow =
  ctx.createRadialGradient(
    this.ghost.x,
    this.ghost.y,
    0,
    this.ghost.x,
    this.ghost.y,
    radius
  );

glow.addColorStop(
  0,
  `rgba(180,220,255,${0.18 * this.audioBoost})`
);

glow.addColorStop(
  0.35,
  `rgba(90,140,255,${0.08 * this.audioBoost})`
);

glow.addColorStop(
  1,
  `rgba(0,0,0,0)`
);

ctx.beginPath();

ctx.arc(
  this.ghost.x,
  this.ghost.y,
  radius,
  0,
  Math.PI * 2
);

ctx.fillStyle = glow;

ctx.fill();

ctx.globalCompositeOperation =
  "source-over";

}


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------

addGUI(folder){

folder.add(
  this.settings,
  "gravity",
  0.1,
  2,
  0.01
);

folder.add(
  this.settings,
  "gravityRadius",
  50,
  400,
  1
);

folder.add(
  this.settings,
  "repulseForce",
  0.5,
  5,
  0.1
);

folder.add(
  this.settings,
  "drag",
  0.9,
  0.999,
  0.001
);

folder.add(
  this.settings,
  "turbulence",
  0,
  0.03,
  0.001
);

folder.add(
  this.settings,
  "opacity",
  0,
  1,
  0.01
);

folder.add(
  this,
  "enabled"
).listen();

}


// ------------------------------------------------
// 🧹 DESTROY
// ------------------------------------------------

destroy(){

window.removeEventListener(
  "resize",
  this.resize
);

if(this.canvas?.parentNode){

  this.canvas.parentNode.removeChild(
    this.canvas
  );

}

this.particles = [];

}

}