import * as THREE from "three";
import { CameraPose } from "./CameraPose";
import { FlightSystem } from "./FlightSystem";
import { Flight } from "./Flight";

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

    this.flightStyle = "linear";

    this.inspectTarget = null;

    this.journey = null;

    this.onFlightFinished = null;

    // ------------------------------------------------
    // TARGETS
    // ------------------------------------------------

    // Current camera position (the only live camera position)
    this.position = new THREE.Vector3(0, 0, 5);

    // Explore/home position
    this.basePosition = this.position.clone();

    // Destination for smooth transitions
    this.targetPosition = new THREE.Vector3(0, 0, 5);

    // Camera look target
    this.lookTarget = new THREE.Vector3(0, 0, 0);

    // Home camera pose
    this.homePosition = this.targetPosition.clone();
    this.homeLookTarget = this.lookTarget.clone();

    // ------------------------------------------------
    // ACTIVE TARGET
    // ------------------------------------------------

    this.currentTarget = new THREE.Vector3(0, 0, 0);

    // Future flight system
    this.currentPose = new CameraPose();

    this.flightSystem = new FlightSystem();

    this.flightSystem.onFinished = () => {
      this.setMode(CameraMode.EXPLORE);

      this.onFlightFinished?.();
    };

    this.flightSystem.onFinished = () => {
      console.log("🎉 Flight finished.");

      this.onFlightFinished?.();
    };

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
  }

  // =====================================================
  // PUBLIC API/MODES
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

    // CameraPose API

    if (target?.position && target?.lookTarget) {
      this.targetPosition.copy(target.position);

      this.lookTarget.copy(target.lookTarget);

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

  cancelTravel() {
    this.setMode(CameraMode.EXPLORE);
  }

  cancel() {
    this.flightSystem.stop();

    this.cancelTravel();
  }

  beginJourney(journey) {
    this.journey = journey;
  }

  isInJourney() {
    return this.journey !== null;
  }

  returnHome() {
    this.basePosition.copy(this.homePosition);

    this.setMode(CameraMode.RETURN);

    this.targetPosition.copy(this.basePosition);
    this.lookTarget.copy(this.homeLookTarget);
  }

  travel(targetPose) {
    if (!this.currentPose) {
      throw new Error("currentPose is undefined");
    }

    if (!this.currentPose.position) {
      throw new Error("currentPose.position is undefined");
    }

    if (!targetPose) {
      throw new Error("targetPose is undefined");
    }

    const flight = this.createFlight(targetPose);

    this.logTravel(targetPose);

    this.beginFlight(flight);
  }

  createFlight(targetPose) {
    const flight = new Flight();

    flight.startPose.copy(this.currentPose);
    flight.targetPose.copy(targetPose);

    flight.duration = 2.0;

    return flight;
  }

  beginFlight(flight) {
    this.setMode(CameraMode.TRAVEL);

    this.flightSystem.start(flight);
  }

  logTravel(targetPose) {
    console.log("Travel started");

    console.log("currentPose", this.currentPose);
    console.log("targetPose", targetPose);

    console.log("currentPose.position:", this.currentPose.position);
    console.log("currentPose.lookTarget:", this.currentPose.lookTarget);

    console.log("targetPose.position:", targetPose.position);
    console.log("targetPose.lookTarget:", targetPose.lookTarget);
  }

  // =====================================================
  // UPDATE
  // =====================================================

  updateExplore(delta) {
    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    this.setPosition(this.time);

    this.applyFlight();

    console.log("Camera position:", this.position.toArray());
    console.log("CameraMode.EXPLORE");

    this.applyComputedPosition();
  }

  updateInspect(delta) {
    if (this.journeyDirector) {
      console.log("Camera Journey:", this.journeyDirector.getPhase());
    }

    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    // this.setPosition(this.time, this.inspectParallaxStrength);
    const px = this.parallax.x * this.inspectParallaxStrength;
    const py = this.parallax.y * this.inspectParallaxStrength;

    this.position.copy(this.targetPosition);

    this.position.x += px;
    this.position.y += py;

    this.applyComputedPosition();
  }

  applyFlight() {
    const flight = this.flightSystem.flight;

    if (!flight) return;
  }

  updateTravel(delta) {
    this.position.copy(this.currentPose.position);

    this.applyComputedPosition();
  }

  updateReturn(delta) {
    const floatY = Math.sin(this.time * this.floatSpeed) * this.floatStrength;

    this.channels.cinematic.set(0, floatY, 0);

    this.applyLookTarget();

    console.log("CameraMode.TRAVEL");

    this.position.lerp(this.targetPosition, 0.08);

    if (this.position.distanceTo(this.targetPosition) < 0.01) {
      this.position.copy(this.targetPosition);

      this.basePosition.copy(this.targetPosition);

      this.setMode(CameraMode.EXPLORE);
    }
    this.applyComputedPosition();
  }

  // Main update(delta)

  update(delta = 0.016) {
    this.time += delta;

    // Update cinematic flight system
    this.flightSystem.update(delta);

    const flight = this.flightSystem.flight;

    if (flight) {
      const t = this.flightSystem.getProgress();

      let progress = t;

      if (this.flightStyle === "gravity") {
        progress = Math.pow(t, 3);
      }

      this.currentPose.position.lerpVectors(
        flight.startPose.position,
        flight.targetPose.position,
        progress,
      );

      this.targetPosition.copy(this.currentPose.position);
    }

    // this.currentTarget.lerp(this.lookTarget, this.lookDamping);
    this.currentTarget.copy(this.lookTarget);

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
  // CAMERA
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

    console.log("Base:", this.basePosition.toArray());
    console.log("Parallax:", this.parallax);

    console.log("Parallax:", this.parallax);

    return this.position;
  }

  // =====================================================
  // CAMERA POSITION
  // =====================================================

  applyComputedPosition() {
    // Keep the current cinematic pose synchronized
    console.log(
      "POSE",
      this.currentPose.position.toArray(),
      "LIVE",
      this.position.toArray(),
    );
    this.currentPose.position.copy(this.position);
    this.currentPose.lookTarget.copy(this.currentTarget);

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

    //this.camera.lookAt(this.currentTarget);

    console.log("Look target:", this.currentTarget.toArray());
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
  // HELPERS
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
