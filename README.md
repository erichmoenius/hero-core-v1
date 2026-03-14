# Hero Core v1 – Cinematic WebGL Hero Engine

A cinematic WebGL hero section built with **Three.js**.
The system renders a **procedural space environment** with nebula shaders, layered starfields, a glass portal, and scroll-driven themes.

This project explores how interactive graphics, audio, and visual storytelling can transform a website hero section into a **digital dream journey**.

---

# ✨ Features

### 🌌 Procedural Space Background

* Dual-layer **nebula shader**
* **Curl noise gas flow**
* **Depth parallax**
* **Chromatic scattering**
* **Volumetric light rays**

### ⭐ Cinematic Starfield

* 3 parallax star layers
* **Milky Way band**
* **Micro-star deep space dust**
* Variable star sizes
* Twinkling animation
* Blue / white / orange star colors

### 🪟 Glass Portal

* Transparent **refraction portal**
* Cinematic light sweep
* Scroll-controlled visual states
* Theme container for dynamic content

### 🎨 Theme System

Current themes:

1. **Seasons Theme**
   Color transitions representing seasonal moods.

2. **Image Theme**
   Cross-fading image transitions inside the portal.

Planned:

3. **Video Theme**
   Looping WebM / MOV visual experiences.

### ✨ Particle System

Interactive particle field reacting to user input.

### 🖱 Interaction

* Scroll-driven state transitions
* Mouse parallax
* Click intensity boost

---

# 🧠 Architecture

```text
Renderer
│
├── ShaderWorld
│   └── Procedural Nebula
│
├── Starfield
│   ├── Micro stars
│   ├── Far layer
│   ├── Mid layer
│   └── Near layer
│
├── GlassPortal
│
├── ThemeStage
│   └── ThemeManager
│       ├── SeasonsTheme
│       └── ImageTheme
│
├── ParticleField
│
└── Engine
    ├── ScrollController
    ├── StateManager
    └── Loop
```

---

# 🛠 Tech Stack

* **Three.js**
* **WebGL / GLSL**
* **Vite**
* **JavaScript ES Modules**

---

# 🚀 Development

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Build production version:

```
npm run build
```

---

# 🌐 Deployment

The project is automatically deployed via **Vercel**.

Every push to the `main` branch triggers a new deployment.

---

# 🔮 Roadmap

Planned improvements:

* Video portal theme (WebM / VideoTexture)
* Mobile optimization
* Audio-reactive visual states
* Cinematic UI overlay
* Shader performance tuning
* Reusable hero template engine

---

# 🎭 Concept

This hero section is part of a larger idea:

> A **digital dream journey** through multiple visual states.

Instead of static visuals, the hero becomes an **interactive environment**.

---

# 👤 Author

Erich Moenius

Project related to:

**thefridolin.com – Interactive Web Experiments**
