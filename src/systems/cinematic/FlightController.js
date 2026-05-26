import * as THREE from "three";

export class FlightController {

  constructor(camera){

    this.camera = camera;

    // ------------------------------------------------
    // 🎥 TARGETS
    // ------------------------------------------------

    this.targetPosition =
      new THREE.Vector3(0,0,5);

    this.lookTarget =
      new THREE.Vector3(0,0,-10);

    // ------------------------------------------------
    // 🌌 INTERNAL MOTION
    // ------------------------------------------------

    this.velocity =
      new THREE.Vector3();

    this.lookVelocity =
      new THREE.Vector3();

    // ------------------------------------------------
    // ⚙️ SETTINGS
    // ------------------------------------------------

    this.positionDamping = 0.035;

    this.lookDamping = 0.045;

    this.maxSpeed = 0.08;

    this.floatStrength = 0.12;

    this.floatSpeed = 0.18;

    // ------------------------------------------------
    // 🌠 STATE
    // ------------------------------------------------

    this.time = 0;

  }

  // ------------------------------------------------
  // 🎯 SET TARGET POSITION
  // ------------------------------------------------

  setTarget(x,y,z){

    this.targetPosition.set(x,y,z);

  }

  // ------------------------------------------------
  // 👁️ SET LOOK TARGET
  // ------------------------------------------------

  lookAtTarget(x,y,z){

    this.lookTarget.set(x,y,z);

  }

  // ------------------------------------------------
  // 🔄 UPDATE
  // ------------------------------------------------

  update(delta = 0.016, audio = {}){

    this.time += delta;

    const energy =
      audio.energy || 0;

    // ------------------------------------------------
    // 🌫️ FLOATING DRIFT
    // ------------------------------------------------

    const floatY =

      Math.sin(
        this.time * this.floatSpeed
      ) *

      (
        this.floatStrength +
        energy * 0.08
      );

    // ------------------------------------------------
    // 🚀 TARGET OFFSET
    // ------------------------------------------------

    const desired =
      this.targetPosition.clone();

    desired.y += floatY;

    // ------------------------------------------------
    // 🌌 INERTIA
    // ------------------------------------------------

    const force =
      desired
        .clone()
        .sub(this.camera.position);

    this.velocity.add(

      force.multiplyScalar(
        this.positionDamping
      )

    );

    // ------------------------------------------------
    // 🌀 DAMPING
    // ------------------------------------------------

    this.velocity.multiplyScalar(0.92);

    // ------------------------------------------------
    // 🚀 LIMIT
    // ------------------------------------------------

    this.velocity.clampLength(
      0,
      this.maxSpeed
    );

    // ------------------------------------------------
    // 🌠 APPLY
    // ------------------------------------------------

    this.camera.position.add(
      this.velocity
    );

    // ------------------------------------------------
    // 👁️ LOOK TARGET
    // ------------------------------------------------

    const currentLook =
      new THREE.Vector3();

    this.camera.getWorldDirection(
      currentLook
    );

    currentLook.add(
      this.camera.position
    );

    const lookForce =
      this.lookTarget
        .clone()
        .sub(currentLook);

    this.lookVelocity.add(

      lookForce.multiplyScalar(
        this.lookDamping
      )

    );

    this.lookVelocity.multiplyScalar(
      0.9
    );

    currentLook.add(
      this.lookVelocity
    );

    // ------------------------------------------------
    // 🎥 FINAL LOOK
    // ------------------------------------------------

    this.camera.lookAt(
      currentLook
    );

  }

}