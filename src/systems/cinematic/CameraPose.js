import * as THREE from "three";

export class CameraPose {
  constructor() {
    this.position = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();

    this.roll = 0;
    this.fov = 60;
  }

  copy(pose) {
    this.position.copy(pose.position);
    this.lookTarget.copy(pose.lookTarget);

    this.roll = pose.roll;
    this.fov = pose.fov;

    return this;
  }
}
