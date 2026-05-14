export class MouseTrailSystem {

constructor(container){

this.container = container;


// ------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------

this.enabled = false;

this.style = "space";


// ------------------------------------------------
// 🎨 CONFIG
// ------------------------------------------------

this.settings = {

  maxParticles: 100,

  spawnThreshold: 0.4,

  drag: 0.965,

  inertia: 0.08,

  elasticDamping: 0.76,

  turbulence: 0.012,

  fadeAlpha: 0.03,

  opacity: 0.5,

  lift: 0.006

};


// ------------------------------------------------
// 🖼️ CANVAS
// ------------------------------------------------

this.canvas = document.createElement("canvas");

this.canvas.style.position = "absolute";

this.canvas.style.top = "0";

this.canvas.style.left = "0";

this.canvas.style.width = "100%";

this.canvas.style.height = "100%";

this.canvas.style.pointerEvents = "none";

this.canvas.style.zIndex = "5";

this.container.appendChild(this.canvas);


this.ctx = this.canvas.getContext("2d");


// ------------------------------------------------
// 📦 DATA
// ------------------------------------------------

this.particles = [];


this.ghost = {

  x: window.innerWidth * 0.5,

  y: window.innerHeight * 0.5

};


this.ghostVelocity = {

  x: 0,

  y: 0

};


// ------------------------------------------------
// 📐 SIZE
// ------------------------------------------------

this.resize = this.resize.bind(this);

window.addEventListener("resize", this.resize);

this.resize();

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

setStyle(style = "space"){

this.style = style;

}


// ------------------------------------------------
// 📐 RESIZE
// ------------------------------------------------

resize(){

this.width = this.canvas.width = window.innerWidth;

this.height = this.canvas.height = window.innerHeight;

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------

update(mouse, audio = {}, time = 0){

if(!this.enabled) return;


// ------------------------------------------------
// 🖱️ NORMALIZED → PIXELS
// ------------------------------------------------

const px =
  (mouse.x * 0.5 + 0.5) * this.width;

const py =
  (mouse.y * 0.5 + 0.5) * this.height;


// ------------------------------------------------
// 🌌 GHOST INERTIA
// ------------------------------------------------

const dx = px - this.ghost.x;

const dy = py - this.ghost.y;


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


const speed = Math.sqrt(

  this.ghostVelocity.x * this.ghostVelocity.x +
  this.ghostVelocity.y * this.ghostVelocity.y

);


// ------------------------------------------------
// 🎧 AUDIO BOOST
// ------------------------------------------------

const energy =
  audio.energy || 0;


// ------------------------------------------------
// ✨ SPAWN
// ------------------------------------------------

if(speed > this.settings.spawnThreshold){

  this.spawn(

    this.ghost.x,

    this.ghost.y,

    this.ghostVelocity.x,

    this.ghostVelocity.y,

    energy

  );

}


// ------------------------------------------------
// 🌑 FADE
// ------------------------------------------------

this.ctx.globalCompositeOperation = "source-over";

this.ctx.fillStyle =
  `rgba(5,8,20,${this.settings.fadeAlpha})`;

this.ctx.fillRect(
  0,
  0,
  this.width,
  this.height
);


// ------------------------------------------------
// ✨ PARTICLES
// ------------------------------------------------

for(let i = this.particles.length - 1; i >= 0; i--){

  const p = this.particles[i];


  p.vx +=
    Math.sin(time + p.seed) * this.settings.turbulence;

  p.vy +=
    Math.cos(time + p.seed) * this.settings.turbulence;


  p.vy -= this.settings.lift;


  p.vx *= this.settings.drag;

  p.vy *= this.settings.drag;


  p.x += p.vx;

  p.y += p.vy;


  p.life -= p.decay;


  if(p.life <= 0){

    this.particles.splice(i,1);

    continue;

  }


  this.drawParticle(p);

}


// ------------------------------------------------
// 🌟 GHOST CORE
// ------------------------------------------------

this.drawGhost(energy);

}


// ------------------------------------------------
// ✨ SPAWN PARTICLE
// ------------------------------------------------

spawn(x, y, vx, vy, energy){

if(this.particles.length >= this.settings.maxParticles){

  this.particles.shift();

}


const angle = Math.random() * Math.PI * 2;

const speed = 0.2 + Math.random() * 0.5;


this.particles.push({

  x,

  y,

  vx: vx * 0.06 + Math.cos(angle) * speed,

  vy: vy * 0.06 + Math.sin(angle) * speed,

  radius: 4 + Math.random() * 8,

  life: 1,

  decay: 0.008 + Math.random() * 0.008,

  energy,

  seed: Math.random() * 1000

});

}


// ------------------------------------------------
// 🌟 DRAW PARTICLE
// ------------------------------------------------

drawParticle(p){

const alpha =
  p.life * this.settings.opacity;


const size =
  p.radius * (0.4 + p.life * 0.6);


const ctx = this.ctx;


ctx.globalCompositeOperation = "lighter";


const g = ctx.createRadialGradient(

  p.x,
  p.y,
  0,

  p.x,
  p.y,
  size * 2

);


g.addColorStop(
  0,
  `rgba(160,210,255,${alpha})`
);


g.addColorStop(
  0.5,
  `rgba(90,140,255,${alpha * 0.2})`
);


g.addColorStop(
  1,
  `rgba(0,0,0,0)`
);


ctx.beginPath();

ctx.arc(
  p.x,
  p.y,
  size * 2,
  0,
  Math.PI * 2
);

ctx.fillStyle = g;

ctx.fill();


ctx.globalCompositeOperation = "source-over";

}


// ------------------------------------------------
// 🌌 DRAW GHOST
// ------------------------------------------------

drawGhost(energy = 0){

const ctx = this.ctx;


ctx.globalCompositeOperation = "lighter";


const glow = ctx.createRadialGradient(

  this.ghost.x,
  this.ghost.y,
  0,

  this.ghost.x,
  this.ghost.y,
  24

);


glow.addColorStop(
  0,
  `rgba(140,190,255,${0.06 + energy * 0.08})`
);


glow.addColorStop(
  0.5,
  `rgba(90,140,255,0.02)`
);


glow.addColorStop(
  1,
  `rgba(0,0,0,0)`
);


ctx.beginPath();

ctx.arc(
  this.ghost.x,
  this.ghost.y,
  24,
  0,
  Math.PI * 2
);

ctx.fillStyle = glow;

ctx.fill();


ctx.beginPath();

ctx.arc(
  this.ghost.x,
  this.ghost.y,
  1.5,
  0,
  Math.PI * 2
);

ctx.fillStyle =
  "rgba(220,235,255,0.5)";

ctx.fill();


ctx.globalCompositeOperation = "source-over";

}


// ------------------------------------------------
// 🧹 CLEANUP
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