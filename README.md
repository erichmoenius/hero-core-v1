# Hero Core – Concept

## Project Structure

The project is intentionally split into two repositories:

hero-prototype-1 → experimental playground
hero-core-v1 → stable engine

The prototype repository is used for rapid visual experimentation:

* galaxy generators
* nebula shaders
* audio reactions
* interaction tests

Once an experiment proves stable and visually convincing, it is migrated into the core engine.

This separation keeps the engine clean and prevents experimental code from polluting the core architecture.

---

# Narrative Fibonacci

The Hero system follows a simple generative rule:

Theme → 4 States

Each **Theme** represents a conceptual universe
(e.g. Matter, Images, Movies, Seasons).

Each Theme unfolds through **four transformation states**.

Example:

Theme: Matter (prototype)

1. Gas
2. Liquid
3. Solid / Plasma
4. Fire

This structure behaves like a narrative spiral.

Simple rules generate increasingly complex visual experiences —
similar to how Fibonacci patterns produce complex structures in nature.

We call this concept:

**Narrative Fibonacci**

A minimal structural rule that generates a scalable narrative system.

---

# Theme Architecture

Every theme follows the same structure:

Theme
├─ State 1
├─ State 2
├─ State 3
└─ State 4

This keeps the engine predictable while allowing unlimited creative variation.

Example future themes:

Matter
Images
Movies
3D Worlds
Seasons
Space

Each theme becomes a small experiential journey inside the Hero.

---

# Vision

The Hero is not just an animation.

It is designed as a **generative narrative engine** that allows users to travel through different visual universes.

A simple structural rule enables infinite variations while keeping the system maintainable and modular.
