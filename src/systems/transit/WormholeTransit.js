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

    const haloGeometry = new THREE.TorusGeometry(0.82, 0.06, 16, 96);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xa8e8ff,

      transparent: true,

      opacity: 0.22,

      side: THREE.DoubleSide,

      depthWrite: false,

      blending: THREE.AdditiveBlending,
    });

    this.halo = new THREE.Mesh(haloGeometry, haloMaterial);

    const coreGeometry = new THREE.SphereGeometry(0.32, 32, 32);

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });

    this.core = new THREE.Mesh(coreGeometry, coreMaterial);

    this.group.add(this.halo);
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

    this.halo.rotation.z -= delta * 0.25;

    const glow = 1 + Math.sin(this.time * 1.2) * 0.08;

    this.halo.scale.setScalar(glow);

    this.halo.material.opacity = 0.18 + Math.sin(this.time * 1.2) * 0.08;

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
