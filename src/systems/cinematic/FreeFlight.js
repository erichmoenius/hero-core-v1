// =====================================================
//
// FREE FLIGHT
//
// =====================================================
//
// Hero Core Free Flight
//
// STATUS: 🟢 GREEN — 🧊 FROZEN
//
// Proven:
// • XY flight works
// • Forward and backward Z flight works
// • Soft radial Z transition works
// • Z persistence during XY movement works
// • LMB release stops all input and velocity
// • CameraDirector remains the sole owner of the camera
//
// Do not redesign or refactor without a specific bug
// or a new explicit requirement.
//
// =====================================================
//
// Responsibilities:
//
// • Owns free exploration movement state
//
// • Reads mouse / touch pointer input
//
// • Provides 3D movement intent
//
// • Provides smooth velocity / inertia
//
// This class NEVER knows:
//
// ❌ Three.js Camera
//
// ❌ Journey
//
// ❌ Theme
//
// ❌ Engine
//
// ❌ Transit
//
// CameraDirector remains the sole owner of the camera.
//
// =====================================================
export class FreeFlight {
  constructor(travelerMode, target = window) {
    // -------------------------------------------------
    // TARGET
    // -------------------------------------------------

    this.target = target;

    // -------------------------------------------------
    // TRAVELER MODE
    // -------------------------------------------------

    this.travelerMode = travelerMode;

    // -------------------------------------------------
    // STATE
    // -------------------------------------------------

    this.active = false;

    // -------------------------------------------------
    // EXPLORATION OFFSET
    // -------------------------------------------------

    this.offset = {
      x: 0,
      y: 0,
      z: 0,
    };

    // -------------------------------------------------
    // VELOCITY
    // -------------------------------------------------

    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    // -------------------------------------------------
    // TARGET VELOCITY
    // -------------------------------------------------

    this.targetVelocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    // -------------------------------------------------
    // MOVEMENT
    // -------------------------------------------------

    this.acceleration = 4.0;
    this.damping = 3.0;

    // -------------------------------------------------
    // SUSTAINED FLIGHT
    // -------------------------------------------------

    this.flightSpeed = 1.5;
    this.minFlightSpeed = 0.35;
    this.maxFlightSpeed = 3.0;
    this.speedRamp = 1.5;

    // -------------------------------------------------
    // FLIGHT BOUNDS
    // -------------------------------------------------

    this.flightBounds = {
      x: 20,
      y: 12,
      z: 40,
    };

    // -------------------------------------------------
    // POINTER STATE
    // -------------------------------------------------

    this.pointer = {
      active: false,
      dragging: false,

      startX: 0,
      startY: 0,

      x: 0,
      y: 0,

      lastX: 0,
      lastY: 0,
    };

    // -------------------------------------------------
    // FRAME INPUT INTENT
    // -------------------------------------------------
    //
    // Raw pointer movement is collected here.
    // Physics will consume it later in update().
    //
    // -------------------------------------------------

    this.input = {
      x: 0,
      y: 0,
      z: 0,
    };

    // -------------------------------------------------
    // INPUT
    // -------------------------------------------------

    this.dragThreshold = 8;

    this.bindInput();
  }

  // ===================================================
  // INPUT
  // ===================================================

  bindInput() {
    this.onPointerDown = (event) => {
      this.pointer.active = true;
      this.pointer.dragging = false;

      this.pointer.startX = event.clientX;
      this.pointer.startY = event.clientY;

      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;

      this.pointer.lastX = event.clientX;
      this.pointer.lastY = event.clientY;
    };

    this.onPointerMove = (event) => {
      if (!this.pointer.active) return;

      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;

      const dx = event.clientX - this.pointer.startX;

      const dy = event.clientY - this.pointer.startY;

      const distance = Math.hypot(dx, dy);

      if (distance >= this.dragThreshold) {
        this.pointer.dragging = true;
      }

      if (!this.pointer.dragging) return;

      // ---------------------------------------------
      // NORMALIZE DRAG
      // ---------------------------------------------

      const width = this.target.innerWidth || window.innerWidth;

      const height = this.target.innerHeight || window.innerHeight;

      // -------------------------------------------------
      // INCREMENTAL MOVEMENT
      // -------------------------------------------------

      const moveDX = event.clientX - this.pointer.lastX;

      const moveDY = event.clientY - this.pointer.lastY;

      // Normalize movement to screen size

      const moveX = moveDX / width;
      const moveY = moveDY / height;

      // -------------------------------------------------
      // TRAVELER MODE — HUMAN XY INTERPRETATION
      // -------------------------------------------------

      const travelerIntent = this.travelerMode.interpret(moveX, moveY);

      this.input.x = travelerIntent.x;
      this.input.y = travelerIntent.y;

      // -------------------------------------------------
      //
      // DEPTH INTENT
      //
      // Screen-position independent.
      //
      // IMPORTANT:
      //
      // Depth must be derived from the local gesture,
      // never from the absolute mouse position.
      //
      // -------------------------------------------------

      const depthIntent = 0;

      // Temporary: disable depth input while we rebuild
      // the Traveler Z gesture.

      this.input.z = 0;

      // -------------------------------------------------
      //
      // INPUT BUFFER DIAGNOSTIC
      //
      // -------------------------------------------------

      console.log("🛩️ INPUT BUFFER", {
        x: this.input.x,

        y: this.input.y,

        z: this.input.z,
      });

      console.log("🛩️ DEPTH", {
        depthIntent,

        velocityZ: this.velocity.z,
      });

      // -------------------------------------------------
      // UPDATE LAST POINTER POSITION
      // -------------------------------------------------

      this.pointer.lastX = event.clientX;
      this.pointer.lastY = event.clientY;
    };

    this.onPointerUp = () => {
      this.pointer.active = false;
      this.pointer.dragging = false;

      // Stop all flight intent
      this.input.x = 0;
      this.input.y = 0;
      this.input.z = 0;

      // Stop all current motion
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.velocity.z = 0;

      console.log("🛩️ FREEFLIGHT STOP — LMB RELEASE");
    };

    this.onPointerCancel = () => {
      this.pointer.active = false;
      this.pointer.dragging = false;

      // Stop all flight intent
      this.input.x = 0;
      this.input.y = 0;
      this.input.z = 0;

      // Stop all current motion
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.velocity.z = 0;

      console.log("🛩️ FREEFLIGHT CANCEL");
    };

    console.log("🛩️ FreeFlight binding pointer events to:", this.target);

    console.log(
      "🛩️ FreeFlight target:",
      this.target,
      "isWindow:",
      this.target === window,
    );

    this.target.addEventListener("pointerdown", this.onPointerDown, true);

    this.target.addEventListener("pointermove", this.onPointerMove, true);

    this.target.addEventListener("pointerup", this.onPointerUp, true);

    this.target.addEventListener("pointercancel", this.onPointerCancel, true);
  }

  // ===================================================
  // START METHOD
  // ===================================================

  start() {
    console.warn("🛩️ FREEFLIGHT START");

    this.active = true;

    console.warn("🛩️ FREEFLIGHT ACTIVE:", this.active);
  }

  // ===================================================
  // FLIGHT SPEED
  // ===================================================

  setFlightSpeed(speed) {
    this.flightSpeed = Math.max(
      this.minFlightSpeed,
      Math.min(speed, this.maxFlightSpeed),
    );
  }

  // ===================================================
  // STOP METHOD
  // ===================================================

  stop() {
    console.warn("🛑 FREEFLIGHT STOP", "active before:", this.active);

    console.trace("🛑 FREEFLIGHT STOP CALL STACK");

    if (!this.active) return;

    this.active = false;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
  }

  // ===================================================
  // RESET
  // ===================================================

  reset() {
    console.log(
      "🛩️ FREEFLIGHT RESET BEFORE",
      this.offset.x,
      this.offset.y,
      this.offset.z,
    );

    // -------------------------------------------------
    // RESET POSITION
    // -------------------------------------------------

    this.offset.x = 0;
    this.offset.y = 0;
    this.offset.z = 0;

    // -------------------------------------------------
    // RESET VELOCITY
    // -------------------------------------------------

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    // -------------------------------------------------
    // RESET POINTER STATE
    // -------------------------------------------------

    this.pointer.active = false;
    this.pointer.dragging = false;

    console.log(
      "🛩️ FREEFLIGHT RESET AFTER",
      this.offset.x,
      this.offset.y,
      this.offset.z,
    );
  }

  // ===================================================
  // FLIGHT BOUNDS
  // ===================================================

  applyFlightBounds() {
    const { x, y, z } = this.flightBounds;

    // Distance from the allowed boundary
    const edgeX = Math.abs(this.offset.x) / x;
    const edgeY = Math.abs(this.offset.y) / y;
    const edgeZ = Math.abs(this.offset.z) / z;

    // Soft resistance begins at 70% of the boundary
    const resistanceStart = 0.7;

    // X resistance
    if (edgeX > resistanceStart) {
      const factor = 1 - (edgeX - resistanceStart) / (1 - resistanceStart);

      this.velocity.x *= Math.max(0, factor);
    }

    // Y resistance
    if (edgeY > resistanceStart) {
      const factor = 1 - (edgeY - resistanceStart) / (1 - resistanceStart);

      this.velocity.y *= Math.max(0, factor);
    }

    // Z resistance
    if (edgeZ > resistanceStart) {
      const factor = 1 - (edgeZ - resistanceStart) / (1 - resistanceStart);

      this.velocity.z *= Math.max(0, factor);
    }
  }

  // ===================================================
  // UPDATE
  // ===================================================

  update(delta = 0.016) {
    console.log("🛩️ FREEFLIGHT UPDATE — CURRENT FILE");

    console.log(
      "🛩️ UPDATE STATE",
      "active:",
      this.active,
      "delta:",
      delta,
      "velocity:",
      this.velocity.x,
      this.velocity.y,
      this.velocity.z,
    );

    if (!this.active) return;

    this.applyFlightBounds();

    // -------------------------------------------------
    // INPUT PHYSICS DIAGNOSTIC
    // -------------------------------------------------

    if (
      Math.abs(this.input.x) > 0.0001 ||
      Math.abs(this.input.y) > 0.0001 ||
      Math.abs(this.input.z) > 0.0001
    ) {
      console.log("🛩️ UPDATE INPUT", {
        x: this.input.x,
        y: this.input.y,
        z: this.input.z,
      });
    }

    // -------------------------------------------------
    // SUSTAINED FLIGHT
    // -------------------------------------------------

    if (this.pointer.dragging) {
      this.flightSpeed = Math.min(
        this.maxFlightSpeed,
        this.flightSpeed + this.speedRamp * delta,
      );

      // -------------------------------------------------
      //
      // INPUT → TARGET VELOCITY XY
      //
      // -------------------------------------------------

      const inputLength = Math.hypot(this.input.x, this.input.y);

      if (inputLength > 0.000001) {
        const directionX = this.input.x / inputLength;

        const directionY = -this.input.y / inputLength;

        this.targetVelocity.x = directionX * this.flightSpeed;

        this.targetVelocity.y = directionY * this.flightSpeed;
      } else {
        this.targetVelocity.x = 0;

        this.targetVelocity.y = 0;
      }

      // -------------------------------------------------
      //
      // INPUT → TARGET VELOCITY Z
      //
      // Traveler depth is symmetrical:
      //
      // inward gesture  → forward
      // outward gesture → backward
      //
      // -------------------------------------------------

      const zDeadZone = 0.05;

      if (Math.abs(this.input.z) > zDeadZone) {
        const directionZ = Math.sign(this.input.z);

        this.targetVelocity.z = directionZ * this.flightSpeed;
      } else {
        this.targetVelocity.z = 0;
      }

      const blend = 1 - Math.exp(-this.acceleration * delta);

      this.velocity.x += (this.targetVelocity.x - this.velocity.x) * blend;

      this.velocity.y += (this.targetVelocity.y - this.velocity.y) * blend;

      this.velocity.z += (this.targetVelocity.z - this.velocity.z) * blend;
    }

    this.offset.x += this.velocity.x * delta;

    this.offset.y += this.velocity.y * delta;

    if (Math.abs(this.velocity.y) > 0.0001) {
      console.log(
        "🛩️ Y PIPELINE",
        "velocityY:",
        this.velocity.y,
        "offsetY:",
        this.offset.y,
      );
    }

    this.offset.z += this.velocity.z * delta;

    if (
      Math.abs(this.velocity.x) > 0.0001 ||
      Math.abs(this.velocity.y) > 0.0001 ||
      Math.abs(this.velocity.z) > 0.0001
    ) {
      console.log("🛩️ OFFSET", this.offset.x, this.offset.y, this.offset.z);
    }

    const damping = Math.exp(-this.damping * delta);

    this.velocity.x *= damping;
    this.velocity.y *= damping;
    this.velocity.z *= damping;
  }

  // ===================================================
  // GET OFFSET
  // ===================================================

  getOffset() {
    return this.offset;
  }

  // ===================================================
  // GET VELOCITY
  // ===================================================

  getVelocity() {
    return this.velocity;
  }

  // ===================================================
  // DRAG STATE
  // ===================================================

  isDragging() {
    return this.pointer.dragging;
  }

  // ===================================================
  // DESTROY
  // ===================================================

  destroy() {
    this.stop();

    this.reset();

    this.target.removeEventListener("pointerdown", this.onPointerDown, true);
    this.target.removeEventListener("pointermove", this.onPointerMove, true);
    this.target.removeEventListener("pointerup", this.onPointerUp, true);
    this.target.removeEventListener(
      "pointercancel",
      this.onPointerCancel,
      true,
    );
  }
}
