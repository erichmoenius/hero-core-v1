export class MouseTrail {

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

  maxParticles: 60,

  spawnThreshold: 0.45,

  drag: 0.968,

  inertia: 0.075,

  elasticDamping: 0.78,

  turbulence: 0.008,

  fadeAlpha: 0.01,

  opacity: 0.18,

  lift: 0.004

};


// ------------------------------------------------
// 🖼️ CANVAS
// ------------------------------------------------

this.canvas = document.createElement("canvas");


// ------------------------------------------------
// 🌌 IMPORTANT
// ------------------------------------------------

this.canvas.style.position = "absolute";

this.canvas.style.top = "0";

this.canvas.style.left = "0";

this.canvas.style.width = "100%";

this.canvas.style.height = "100%";

this.canvas.style.pointerEvents = "none";

this.canvas.style.zIndex = "2";

this.canvas.style.mixBlendMode = "normal";


// ------------------------------------------------
// 🌌 CONTAINER SAFETY
// ------------------------------------------------

const computed = getComputedStyle(this.container);

if(computed.position === "static"){

  this.container.style.position = "relative";

}


this.container.appendChild(this.canvas);

this.ctx = this.canvas.getContext("2d");


// ------------------------------------------------
// 📦 DATA
// ------------------------------------------------

this.particles = [];


this.ghost = {

  x: 0,

  y: 0

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

const rect = this.container.getBoundingClientRect();

this.width = this.canvas.width = rect.width;

this.height = this.canvas.height = rect.height;


// ------------------------------------------------
// 🌌 INITIAL POSITION
// ------------------------------------------------

this.ghost.x = this.width * 0.5;

this.ghost.y = this.height * 0.5;

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------

update(mouse, audio = {}, time = 0){

if(!this.enabled) return;


// ------------------------------------------------
// 🖱️ NORMALIZED → LOCAL PIXELS
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

  this.ghostVelocity.x ** 2 +

  this.ghostVelocity.y ** 2

);


// ------------------------------------------------
// 🎧 AUDIO
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
// 🌑 SOFT FADE
// ------------------------------------------------

this.ctx.clearRect(
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

    Math.sin(time + p.seed) *

    this.settings.turbulence;

  p.vy +=

    Math.cos(time + p.seed) *

    this.settings.turbulence;


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
// 🌟 GHOST
// ------------------------------------------------

this.drawGhost(energy);

}


// ------------------------------------------------
// ✨ SPAWN
// ------------------------------------------------

spawn(x, y, vx, vy, energy){

if(this.particles.length >= this.settings.maxParticles){

  this.particles.shift();

}


const angle =

  Math.random() * Math.PI * 2;


const speed =

  0.12 + Math.random() * 0.25;


this.particles.push({

  x,

  y,

  vx: vx * 0.04 + Math.cos(angle) * speed,

  vy: vy * 0.04 + Math.sin(angle) * speed,

  radius: 2 + Math.random() * 5,

  life: 1,

  decay: 0.01 + Math.random() * 0.01,

  energy,

  seed: Math.random() * 1000

});

}


// ------------------------------------------------
// 🌟 DRAW PARTICLE
// ------------------------------------------------

drawParticle(p){

const alpha =

  p.life *

  this.settings.opacity;


const size =

  p.radius *

  (0.4 + p.life * 0.6);


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

  `rgba(90,140,255,${alpha * 0.12})`

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

  16

);


glow.addColorStop(

  0,

  `rgba(140,190,255,${0.03 + energy * 0.03})`

);


glow.addColorStop(

  0.5,

  `rgba(90,140,255,0.01)`

);


glow.addColorStop(

  1,

  `rgba(0,0,0,0)`

);


ctx.beginPath();

ctx.arc(

  this.ghost.x,

  this.ghost.y,

  16,

  0,

  Math.PI * 2

);

ctx.fillStyle = glow;

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