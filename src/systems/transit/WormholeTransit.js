import * as THREE from "three";
import { TransitState } from "./TransitState.js";
export default class WormholeTransit {
  constructor() {
    this.time = 0;

    this.state = TransitState.CREATED;

    this.group = new THREE.Group();

    const geometry = new THREE.TorusGeometry(0.8, 0.03, 16, 96);

    const material = new THREE.MeshBasicMaterial({
      color: 0x66ccff,

      transparent: true,

      opacity: 0.35,
    });

    this.ring = new THREE.Mesh(geometry, material);

    this.group.add(this.ring);
  }

  start() {
    this.state = TransitState.OPENING;

    console.log("🌀 Wormhole opening");
  }

  stop() {
    this.state = TransitState.FINISHED;

    console.log("🌀 Wormhole finished");
  }

  dispose() {
    this.group.clear();

    console.log("🌀 Wormhole disposed");
  }

  update(delta) {
    this.time += delta;

    this.ring.rotation.z += delta * 0.6;

    const pulse = 1 + Math.sin(this.time * 2.5) * 0.06;

    this.ring.scale.setScalar(pulse);

    if (this.state === TransitState.OPENING && this.time > 2) {
      this.state = TransitState.ACTIVE;

      console.log("🌀 Wormhole active");
    }
  }

  getState() {
    return this.state;
  }

  getObject() {
    return this.group;
  }
}
