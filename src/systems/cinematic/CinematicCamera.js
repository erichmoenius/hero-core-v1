import * as THREE from "three";

// =====================================================
// CINEMATIC CAMERA
// =====================================================
//
// Hero Core Camera Director
//
// Responsibilities:
//
// • Smooth cinematic camera movement
// • Camera inertia
// • Floating idle motion
// • Camera target transitions
// • Focus Mode
// • Future DaVinci fly-throughs
//
// This class NEVER knows:
//
// ❌ Engine
// ❌ Blob
// ❌ Storyteller
// ❌ Themes
//
// It only knows:
//
// ✔ Camera
// ✔ Target Position
// ✔ Look Target
// ✔ Camera State
//
// =====================================================

export default class CinematicCamera {
  constructor(camera) {
    this.camera = camera;

    // ------------------------------------------------
    // CAMERA MODE
    // ------------------------------------------------

    this.mode = "explore";

    // explore
    // inspect
    // orbit
    // travel
    // emerge

    // ------------------------------------------------
    // TARGETS
    // ------------------------------------------------

    this.targetPosition = new THREE.Vector3(0, 0, 5);

    this.lookTarget = new THREE.Vector3(0, 0, 0);

    // ------------------------------------------------
    // CAMERA OFFSET
    // ------------------------------------------------

    this.offset = new THREE.Vector3();

    // ------------------------------------------------
    // CAMERA CHANNELS
    // ------------------------------------------------

    this.channels = {
      parallax: new THREE.Vector3(),

      cinematic: new THREE.Vector3(),

      focus: new THREE.Vector3(),

      shake: new THREE.Vector3(),
    };

    // ------------------------------------------------
    // PARALLAX
    // ------------------------------------------------

    this.parallax = new THREE.Vector2();

    // ------------------------------------------------
    // INTERNAL MOTION
    // ------------------------------------------------

    this.velocity = new THREE.Vector3();

    this.lookVelocity = new THREE.Vector3();

    // ------------------------------------------------
    // TEMP VECTORS
    // (avoid allocations every frame)
    // ------------------------------------------------

    this.tempA = new THREE.Vector3();

    this.tempB = new THREE.Vector3();

    this.tempC = new THREE.Vector3();

    // ------------------------------------------------
    // SETTINGS
    // ------------------------------------------------

    this.positionDamping = 0.035;

    this.lookDamping = 0.05;

    this.maxSpeed = 0.08;

    this.floatStrength = 0.1;

    this.floatSpeed = 0.18;

    // ------------------------------------------------
    // TIME
    // ------------------------------------------------

    this.time = 0;
  }

  // =====================================================
  // STATES
  // =====================================================

  setIdle() {
    this.state = "idle";
  }

  focus(position, lookAt = position) {
    this.state = "focus";

    this.targetPosition.copy(position);

    this.lookTarget.copy(lookAt);
  }

  returnHome(position, lookAt) {
    this.state = "return";

    this.targetPosition.copy(position);

    this.lookTarget.copy(lookAt);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(delta = 0.016) {
    console.log("🎥 CinematicCamera update");

    this.time += delta;

    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(
      0,

      floatY,

      0,
    );
  }

  // =====================================================
  // PARALLAX
  // =====================================================

  updateParallax(mouse, strength = 1) {
    this.parallax.x += (mouse.x - this.parallax.x) * 0.08;

    this.parallax.y += (mouse.y - this.parallax.y) * 0.08;

    this.channels.parallax.set(
      this.parallax.x * strength,

      this.parallax.y * strength,

      0,
    );

    return this.parallax;
  }

  // =====================================================
  // IDLE
  // =====================================================

  getIdleOffset() {
    return this.channels.cinematic;
  }

  // =====================================================
  // PUBLIC
  // =====================================================

  getOffset() {
    return this.getFinalOffset();
  }

  // =====================================================
  // FINAL OFFSET
  // =====================================================

  getFinalOffset() {
    this.offset.set(0, 0, 0);

    this.offset.add(this.channels.parallax);

    this.offset.add(this.channels.cinematic);

    this.offset.add(this.channels.focus);

    this.offset.add(this.channels.shake);

    return this.offset;
  }
}
