// =====================================================
// FREE FLIGHT
// =====================================================
//
// Hero Core Free Flight
//
// Responsibilities:
//
// • Owns free exploration movement state
// • Provides 3D movement intent
// • Supports future mouse / touch input
// • Provides smooth velocity / inertia
//
// This class NEVER knows:
//
// ❌ Three.js Camera
// ❌ Journey
// ❌ Theme
// ❌ Engine
// ❌ Transit
//
// CameraDirector remains the sole owner of the camera.
//
// =====================================================

export class FreeFlight {
  constructor() {
    // -------------------------------------------------
    // STATE
    // -------------------------------------------------

    this.active = false;

    // Current exploration offset
    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };

    // Current movement velocity
    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    // -------------------------------------------------
    // MOVEMENT
    // -------------------------------------------------

    this.speed = 1.0;

    this.acceleration = 4.0;

    this.damping = 3.0;

    // -------------------------------------------------
    // LIMITS
    // -------------------------------------------------

    this.maxSpeed = 3.0;
  }

  // -------------------------------------------------
  // START
  // -------------------------------------------------

  start() {
    this.active = true;
  }

  // -------------------------------------------------
  // STOP
  // -------------------------------------------------

  stop() {
    this.active = false;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
  }

  // -------------------------------------------------
  // RESET
  // -------------------------------------------------

  reset() {
    this.position.x = 0;
    this.position.y = 0;
    this.position.z = 0;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
  }

  // -------------------------------------------------
  // UPDATE
  // -------------------------------------------------

  update(delta = 0.016) {
    if (!this.active) return;

    // -----------------------------------------------
    // VELOCITY
    // -----------------------------------------------

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // -----------------------------------------------
    // DAMPING
    // -----------------------------------------------

    const damping = Math.exp(-this.damping * delta);

    this.velocity.x *= damping;
    this.velocity.y *= damping;
    this.velocity.z *= damping;
  }

  // -------------------------------------------------
  // GET POSITION
  // -------------------------------------------------

  getPosition() {
    return this.position;
  }

  // -------------------------------------------------
  // GET VELOCITY
  // -------------------------------------------------

  getVelocity() {
    return this.velocity;
  }

  // -------------------------------------------------
  // DESTROY
  // -------------------------------------------------

  destroy() {
    this.stop();

    this.reset();
  }
}
