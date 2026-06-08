export class FibonacciPresence {

constructor(container, options = {}){

this.container = container;

this.type = "fibonacci";

this.enabled = false;

// ------------------------------------------------
// ⚙️ CONFIG
// ------------------------------------------------

this.settings = {

  points: 72,

  scale: 2.6,

  scaleBoost: 0.9,

  inertia: 0.07,

  elasticDamping: 0.76,

  breathSpeed: 0.8,

  breathAmplitude: 0.08,

  rotationSpeed: 0.001,

  dissolveDelay: 1.5,

  dissolveSpeed: 0.35,

  opacity: 0.72

};

// ------------------------------------------------
// ⚙️ OVERRIDE
// ------------------------------------------------

Object.assign(
  this.settings,
  options
);

// ------------------------------------------------
// 🌀 CONSTANTS
// ------------------------------------------------

this.PHI =
  (1 + Math.sqrt(5)) / 2;

this.TAU =
  Math.PI * 2;

this.GOLDEN_ANGLE =
  this.TAU / (this.PHI * this.PHI);

// ------------------------------------------------
// 🖼️ CANVAS
// ------------------------------------------------

this.canvas =
  document.createElement("canvas");

this.canvas.style.position =
  "fixed";

this.canvas.style.top = "0";

this.canvas.style.left = "0";

this.canvas.style.width = "100%";

this.canvas.style.height = "100%";

this.canvas.style.pointerEvents =
  "none";

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

this.presence = 0;

this.breathPhase = 0;

this.rotationOffset = 0;

this.stillTimer = 0;

this.audioBoost = 1;

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
// 🌀 POINT DATA
// ------------------------------------------------

this.points = [];

for(let i = 0; i < this.settings.points; i++){

  this.points.push({

    driftPhase:
      Math.random() * this.TAU,

    driftSpeed:
      0.008 + Math.random() * 0.012,

    driftAmplitude:
      0.4 + Math.random() * 0.8

  });

}

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

}

// ------------------------------------------------
// 🎛️ ENABLE
// ------------------------------------------------

enable(){

this.enabled = true;

this.canvas.style.display =
  "block";

}

// ------------------------------------------------
// ⛔ DISABLE
// ------------------------------------------------

disable(){

this.enabled = false;

this.canvas.style.display =
  "none";

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

this.width =
  rect.width;

this.height =
  rect.height;

this.canvas.width =
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
  (mouse.x * 0.5 + 0.5) *
  this.width;

const py =
  (mouse.y * 0.5 + 0.5) *
  this.height;

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

const speed = Math.sqrt(

  this.ghostVelocity.x ** 2 +
  this.ghostVelocity.y ** 2

);

// ------------------------------------------------
// 🌌 PRESENCE
// ------------------------------------------------

const targetPresence =
  speed > 0.5
    ? Math.min(1, speed * 0.12)
    : 0;

this.presence +=
  (targetPresence - this.presence) * 0.035;

// ------------------------------------------------
// ⏳ STILLNESS
// ------------------------------------------------

if(speed < 0.3){

  this.stillTimer += 0.016;

}else{

  this.stillTimer = 0;

}

// ------------------------------------------------
// 🫁 BREATH
// ------------------------------------------------

this.breathPhase +=

  (
    this.settings.breathSpeed +
    this.presence * 2
  ) * 0.016;

const breathing =

  1 +

  Math.sin(this.breathPhase) *

  (
    this.settings.breathAmplitude +
    this.presence * 0.1
  ) *

  this.audioBoost;

// ------------------------------------------------
// 🌀 ROTATION
// ------------------------------------------------

this.rotationOffset +=

  (
    this.settings.rotationSpeed +
    this.presence * 0.012
  ) *

  this.audioBoost;

// ------------------------------------------------
// 🌫️ DISSOLVE
// ------------------------------------------------

const dissolve =

  this.stillTimer >
  this.settings.dissolveDelay

    ? Math.max(

        0,

        1 -

        (
          this.stillTimer -
          this.settings.dissolveDelay
        ) *

        this.settings.dissolveSpeed

      )

    : 1;

// ------------------------------------------------
// 📏 SCALE
// ------------------------------------------------

const scale =

  (
    this.settings.scale +
    this.presence *
    this.settings.scaleBoost
  ) *

  breathing;

// ------------------------------------------------
// ✨ DRAW
// ------------------------------------------------

const ctx = this.ctx;

ctx.globalCompositeOperation =
  "screen";

// ------------------------------------------------
// 🌀 POINTS
// ------------------------------------------------

for(let i = 0; i < this.settings.points; i++){

  const p =
    this.getPoint(
      i,
      scale,
      time
    );

  const x =
    this.ghost.x + p.x;

  const y =
    this.ghost.y + p.y;

  const t =
    i / this.settings.points;

  const alpha =

    (
      1 - t * 0.55
    ) *

    dissolve *

    this.settings.opacity *

    this.audioBoost;

  const radius =

    (
      0.4 +
      t * 1.4
    ) *

    (
      0.6 +
      this.presence * 0.5
    );

// ------------------------------------------------
// ❄️ ICE BLUE GLOW
// ------------------------------------------------

  ctx.globalCompositeOperation =
  "screen";

const glow =
  ctx.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    radius * 2
  );

glow.addColorStop(
  0,
  `rgba(200,245,255,${alpha * 1.6})`
);

glow.addColorStop(
  0.25,
  `rgba(140,220,255,${alpha * 0.8})`
);

glow.addColorStop(
  0.6,
  `rgba(80,160,255,${alpha * 0.12})`
);

glow.addColorStop(
  1,
  `rgba(0,0,0,0)`
);

ctx.beginPath();

ctx.arc(
  x,
  y,
  radius * 2.5,
  0,
  this.TAU
);

ctx.fillStyle = glow;

ctx.fill();

// ------------------------------------------------
// 🌟 CORE
// ------------------------------------------------

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    this.TAU
  );

  ctx.fillStyle =
    `rgba(180,235,255,${alpha})`;

  ctx.fill();

}

// ------------------------------------------------
// 🌌 CENTER CORE
// ------------------------------------------------

const core =
  ctx.createRadialGradient(
    this.ghost.x,
    this.ghost.y,
    0,
    this.ghost.x,
    this.ghost.y,
    18
  );

core.addColorStop(
  0,
  `rgba(220,245,255,${0.18 * dissolve})`
);

core.addColorStop(
  0.4,
  `rgba(120,190,255,${0.08 * dissolve})`
);

core.addColorStop(
  1,
  `rgba(0,0,0,0)`
);

ctx.beginPath();

ctx.arc(
  this.ghost.x,
  this.ghost.y,
  18,
  0,
  this.TAU
);

ctx.fillStyle = core;

ctx.fill();

ctx.globalCompositeOperation =
  "source-over";

}

// ------------------------------------------------
// 🌀 POINT
// ------------------------------------------------

getPoint(i, scale, time){

const point =
  this.points[i];

const radius =
  scale * Math.sqrt(i + 1);

const theta =

  i *
  this.GOLDEN_ANGLE +

  this.rotationOffset;

const drift =

  Math.sin(

    point.driftPhase +

    time *
    point.driftSpeed

  ) *

  point.driftAmplitude;

return {

  x:

    Math.cos(theta) *

    (radius + drift),

  y:

    Math.sin(theta) *

    (radius + drift)

};

}

// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------

addGUI(folder){

folder.add(
  this.settings,
  "scale",
  1,
  10,
  0.1
);

folder.add(
  this.settings,
  "breathAmplitude",
  0,
  0.2,
  0.005
);

folder.add(
  this.settings,
  "rotationSpeed",
  0,
  0.01,
  0.0001
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

}

}