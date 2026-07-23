import * as THREE from "three";

// =====================================================
// CAMERA MODES
// =====================================================

export const CameraMode = {
  EXPLORE: "explore",
  INSPECT: "inspect",
  TRAVEL: "travel",
  RETURN: "return",
};

export default class CameraDirector {
  constructor(camera) {
    this.camera = camera;

    // ------------------------------------------------
    // CAMERA MODE
    // ------------------------------------------------

    this.mode = CameraMode.EXPLORE;
    this.previousMode = CameraMode.EXPLORE;

    this.inspectTarget = null;

    this.journey = null;

    // ------------------------------------------------
    // TARGETS
    // ------------------------------------------------

    this.targetPosition = new THREE.Vector3(0, 0, 5);
    this.position = new THREE.Vector3(0, 0, 5);
    this.basePosition = this.position.clone();
    this.lookTarget = new THREE.Vector3(0, 0, 0);

    // Home camera pose
    this.homePosition = this.targetPosition.clone();
    this.homeLookTarget = this.lookTarget.clone();

    // ------------------------------------------------
    // ACTIVE TARGET
    // ------------------------------------------------

    this.currentTarget = new THREE.Vector3(0, 0, 0);

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
    // TIME
    // ------------------------------------------------

    this.time = 0;

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

    this.inspectParallaxStrength = 0.25;

    this.floatSpeed = 0.18;

    // ------------------------------------------------
    // TIME
    // ------------------------------------------------

    this.time = 0;
  }

  // =====================================================
  // MODES
  // =====================================================

  setMode(mode) {
    if (this.mode === mode) return;

    this.previousMode = this.mode;

    this.mode = mode;
  }

  isMode(mode) {
    return this.mode === mode;
  }

  inspect(target, lookAt = null) {
    this.setMode(CameraMode.INSPECT);

    // New API: inspection pose
    if (target?.position && target?.lookAt) {
      this.targetPosition.copy(target.position);
      this.lookTarget.copy(target.lookAt);
      return;
    }

    // Legacy API
    this.targetPosition.copy(target);
    this.lookTarget.copy(lookAt ?? target);
  }

  travel(position, lookAt = position) {
    this.inspect(position, lookAt);

    this.setMode(CameraMode.TRAVEL);
  }

  beginJourney(journey) {
    this.journey = journey;
  }

  isInJourney() {
    return this.journey !== null;
  }

  // returnHome(position, lookAt) {
  //   this.setMode(CameraMode.RETURN);

  //   this.targetPosition.copy(position);
  //   this.lookTarget.copy(lookAt);
  // }

  returnHome() {
    this.basePosition.copy(this.homePosition);

    this.setMode(CameraMode.RETURN);

    this.targetPosition.copy(this.basePosition);
    this.lookTarget.copy(this.homeLookTarget);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  updateExplore(delta) {
    console.log("EXPLORE POSITION", this.position.toArray());

    console.log("EXPLORE START");
    console.log("position", this.position.toArray());
    console.log("camera", this.camera.position.toArray());

    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    this.setPosition(this.time);

    this.applyComputedPosition();
  }

  updateInspect(delta) {
    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    // this.setPosition(this.time, this.inspectParallaxStrength);
    const px = this.parallax.x * this.inspectParallaxStrength;
    const py = this.parallax.y * this.inspectParallaxStrength;

    this.position.copy(this.targetPosition);

    this.position.x += px;
    this.position.y += py;

    console.log("Camera Position:", this.position);

    console.log("Target Position:", this.targetPosition);

    console.log("Look Target:", this.lookTarget);

    this.applyComputedPosition();
  }

  updateTravel(delta) {
    // TODO: Travel behavior
  }

  updateReturn(delta) {
    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    this.position.lerp(this.targetPosition, 0.08);

    if (this.position.distanceTo(this.targetPosition) < 0.01) {
      this.position.copy(this.targetPosition);

      this.basePosition.copy(this.targetPosition);

      console.log("RETURN DONE");
      console.log("position", this.position.toArray());
      console.log("camera", this.camera.position.toArray());

      this.setMode(CameraMode.EXPLORE);

      console.log("MODE", this.mode);
      console.log("position", this.position.toArray());
      console.log("camera", this.camera.position.toArray());
    }
    this.applyComputedPosition();
  }

  update(delta = 0.016) {
    this.time += delta;

    // this.currentTarget.lerp(this.lookTarget, this.lookDamping);
    this.currentTarget.copy(this.lookTarget);

    console.log("Camera mode:", this.mode);

    switch (this.mode) {
      case CameraMode.EXPLORE:
        this.updateExplore(delta);
        break;

      case CameraMode.INSPECT:
        this.updateInspect(delta);
        break;

      case CameraMode.TRAVEL:
        this.updateTravel(delta);
        break;

      case CameraMode.RETURN:
        this.updateReturn(delta);
        break;
    }
  }

  // =====================================================
  // PARALLAX
  // =====================================================

  setParallax(mouse, strength = 1) {
    return this.updateParallax(mouse, strength);
  }

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
  // COMPUTE POSITION
  // =====================================================

  setPosition(time, parallaxStrength = 1) {
    return this.computePosition(time, parallaxStrength);
  }

  computePosition(time, parallaxStrength = 1) {
    const px = this.parallax.x * parallaxStrength;
    const py = this.parallax.y * parallaxStrength;

    const idle = this.getIdleOffset();

    this.position.copy(this.basePosition);

    this.position.x += Math.sin(time * 0.3) * 0.2 + px + idle.x;
    this.position.y += Math.cos(time * 0.2) * 0.2 + py + idle.y;

    return this.position;
  }

  // =====================================================
  // CAMERA POSITION
  // =====================================================

  applyComputedPosition() {
    this.applyPosition(this.position.x, this.position.y, this.position.z);
  }

  applyPosition(x, y, z) {
    if (!this.camera) return;

    this.camera.position.set(x, y, z);
  }

  // =====================================================
  // LOOK TARGET
  // =====================================================

  applyLookTarget() {
    if (!this.camera) return;

    console.log("Looking at:", this.currentTarget.toArray());

    // this.camera.lookAt(this.currentTarget);
  }

  // =====================================================
  // TARGET
  // =====================================================

  setLookTarget(x, y, z) {
    return this.setTarget(x, y, z);
  }

  setTarget(x, y, z) {
    this.currentTarget.set(x, y, z);
  }

  // =====================================================
  // PUBLIC
  // =====================================================

  getOffset() {
    return this.getFinalOffset();
  }

  getPosition() {
    return this.position;
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
