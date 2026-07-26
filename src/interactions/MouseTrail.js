import * as THREE from "three";

export class MouseTrail {
  constructor(container) {
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
      maxParticles: 120,

      spawnThreshold: 0.35,

      drag: 0.965,

      inertia: 0.075,

      elasticDamping: 0.78,

      turbulence: 0.008,

      opacity: 0.5,

      lift: 0.004,

      ghostSize: 18,

      breatheSpeed: 1.8,

      breatheAmount: 0.15,

      velocityStretch: 1.8,

      idlePulse: 0.025,
    };

    // ------------------------------------------------
    // 🖼️ CANVAS
    // ------------------------------------------------

    this.canvas = document.createElement("canvas");

    this.canvas.style.position = "fixed";

    this.canvas.style.top = "0";

    this.canvas.style.left = "0";

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

    if (computed.position === "static") {
      this.container.style.position = "relative";
    }

    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    // ------------------------------------------------
    // 📦 DATA
    // ------------------------------------------------

    this.particles = [];

    this.ghost = {
      x: 0,

      y: 0,
    };

    this.ghostVelocity = {
      x: 0,

      y: 0,
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

  enable() {
    this.enabled = true;

    this.canvas.style.display = "block";
  }

  // ------------------------------------------------
  // ⛔ DISABLE
  // ------------------------------------------------

  disable() {
    this.enabled = false;

    this.canvas.style.display = "none";
  }

  // ------------------------------------------------
  // 🎨 STYLE
  // ------------------------------------------------

  setStyle(style = "space") {
    this.style = style;
  }

  // ------------------------------------------------
  // 📐 RESIZE
  // ------------------------------------------------

  resize() {
    const rect = this.container.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    this.width = window.innerWidth;

    this.height = window.innerHeight;

    this.canvas.width = rect.width * dpr;

    this.canvas.height = rect.height * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ghost.x = this.width * 0.5;

    this.ghost.y = this.height * 0.5;
  }

  // ------------------------------------------------
  // 🔄 UPDATE
  // ------------------------------------------------

  update(state) {
    const mouse = state.mouse;
    const audio = state.audio;
    const time = state.time;

    if (!this.enabled) return;

    if (!this.enabled) return;

    // ------------------------------------------------
    // 🖱️ NORMALIZED → PIXELS
    // ------------------------------------------------

    const px = (mouse.x * 0.5 + 0.5) * this.width;

    const py = (mouse.y * 0.5 + 0.5) * this.height;

    console.log("trail", px, py, "scroll", window.scrollY);

    // ------------------------------------------------
    // 🌌 GHOST INERTIA
    // ------------------------------------------------

    const dx = px - this.ghost.x;

    const dy = py - this.ghost.y;

    this.ghostVelocity.x += dx * this.settings.inertia;

    this.ghostVelocity.y += dy * this.settings.inertia;

    this.ghostVelocity.x *= this.settings.elasticDamping;

    this.ghostVelocity.y *= this.settings.elasticDamping;

    this.ghost.x += this.ghostVelocity.x;

    this.ghost.y += this.ghostVelocity.y;

    // ------------------------------------------------
    // ⚡ SPEED
    // ------------------------------------------------

    const speed = Math.sqrt(
      this.ghostVelocity.x ** 2 + this.ghostVelocity.y ** 2,
    );

    // ------------------------------------------------
    // 🎧 AUDIO
    // ------------------------------------------------

    const energy = audio.energy || 0;

    // ------------------------------------------------
    // 🌫️ CINEMATIC FADE
    // ------------------------------------------------

    this.ctx.clearRect(0, 0, this.width, this.height);

    // ------------------------------------------------
    // ✨ SPAWN
    // ------------------------------------------------

    if (speed > this.settings.spawnThreshold) {
      this.spawn(
        this.ghost.x,

        this.ghost.y,

        this.ghostVelocity.x,

        this.ghostVelocity.y,

        energy,
      );
    }

    // ------------------------------------------------
    // ✨ PARTICLES
    // ------------------------------------------------

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // turbulence

      p.vx += Math.sin(time + p.seed) * this.settings.turbulence;

      p.vy += Math.cos(time + p.seed) * this.settings.turbulence;

      // lift

      p.vy -= this.settings.lift;

      // drag

      p.vx *= this.settings.drag;

      p.vy *= this.settings.drag;

      // movement

      p.x += p.vx;

      p.y += p.vy;

      // life

      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);

        continue;
      }

      this.drawParticle(p, time);
    }

    // ------------------------------------------------
    // 🌟 GHOST
    // ------------------------------------------------

    this.drawGhost(energy, time, speed);
  }

  // ------------------------------------------------
  // ✨ SPAWN
  // ------------------------------------------------

  spawn(x, y, vx, vy, energy) {
    if (this.particles.length >= this.settings.maxParticles) {
      this.particles.shift();
    }

    const angle = Math.random() * Math.PI * 2;

    const speed = 0.12 + Math.random() * 0.25;

    this.particles.push({
      x,

      y,

      vx: vx * 0.04 + Math.cos(angle) * speed,

      vy: vy * 0.04 + Math.sin(angle) * speed,

      radius: 2 + Math.random() * 6,

      life: 1,

      decay: 0.008 + Math.random() * 0.008,

      energy,

      seed: Math.random() * 1000,
    });
  }

  // ------------------------------------------------
  // ✨ DRAW PARTICLE
  // ------------------------------------------------

  drawParticle(p, time) {
    const ctx = this.ctx;

    // ------------------------------------------------
    // 🌬️ VELOCITY STRETCH
    // ------------------------------------------------

    const velocity = Math.sqrt(p.vx ** 2 + p.vy ** 2);

    const stretch = 1 + velocity * this.settings.velocityStretch;

    // ------------------------------------------------
    // 💓 BREATHING
    // ------------------------------------------------

    const breathe =
      1 +
      Math.sin(time * this.settings.breatheSpeed + p.seed) *
        this.settings.breatheAmount;

    // ------------------------------------------------
    // ✨ FINAL VALUES
    // ------------------------------------------------

    const alpha = p.life * this.settings.opacity * breathe;

    const size = p.radius * stretch * breathe;

    // ------------------------------------------------
    // 🌌 DRAW
    // ------------------------------------------------

    ctx.globalCompositeOperation = "lighter";

    const g = ctx.createRadialGradient(
      p.x,
      p.y,
      0,

      p.x,
      p.y,

      size * 2,
    );

    g.addColorStop(
      0,

      `rgba(180,220,255,${alpha})`,
    );

    g.addColorStop(
      0.4,

      `rgba(100,150,255,${alpha * 0.18})`,
    );

    g.addColorStop(
      1,

      `rgba(0,0,0,0)`,
    );

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,

      size * 2,

      0,
      Math.PI * 2,
    );

    ctx.fillStyle = g;

    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  }

  // ------------------------------------------------
  // 🌟 DRAW GHOST
  // ------------------------------------------------

  drawGhost(energy = 0, time = 0, speed = 0) {
    const ctx = this.ctx;

    // ------------------------------------------------
    // 💓 IDLE BREATH
    // ------------------------------------------------

    const idlePulse = 1 + Math.sin(time * 1.5) * this.settings.idlePulse;

    // ------------------------------------------------
    // 🌌 GLOW SIZE
    // ------------------------------------------------

    const size = this.settings.ghostSize * idlePulse * (1 + speed * 0.02);

    // ------------------------------------------------
    // ✨ DRAW
    // ------------------------------------------------

    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createRadialGradient(
      this.ghost.x,
      this.ghost.y,
      0,

      this.ghost.x,
      this.ghost.y,

      size,
    );

    glow.addColorStop(
      0,

      `rgba(160,210,255,${0.04 + energy * 0.04})`,
    );

    glow.addColorStop(
      0.5,

      `rgba(90,140,255,0.015)`,
    );

    glow.addColorStop(
      1,

      `rgba(0,0,0,0)`,
    );

    ctx.beginPath();

    ctx.arc(
      this.ghost.x,
      this.ghost.y,

      size,

      0,
      Math.PI * 2,
    );

    ctx.fillStyle = glow;

    ctx.fill();

    ctx.globalCompositeOperation = "source-over";
  }

  // ------------------------------------------------
  // 🧹 CLEANUP
  // ------------------------------------------------

  destroy() {
    window.removeEventListener(
      "resize",

      this.resize,
    );

    if (this.canvas?.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.particles = [];
  }
}
