import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class SeasonsTheme extends BaseTheme {

  init() {
    this.colors = {
      state1: 0x88c057, // Spring (Grün frisch)
      state2: 0xffc857, // Summer (Gelb warm)
      state3: 0xd1495b, // Autumn (Rot/Orange)
      state4: 0x5f6caf  // Winter (Blau kühl)
    };

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    this.plane.scale.set(2, 2, 1);
    this.scene.add(this.plane);
  }

  update({ current, next, blend }) {
    if (!current || !next) return;

    const c1 = new THREE.Color(this.colors[current]);
    const c2 = new THREE.Color(this.colors[next]);

    const blended = c1.lerp(c2, blend);
    this.plane.material.color.copy(blended);
  }

  dispose() {
    this.scene.remove(this.plane);
  }
}