import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class ColorTheme extends BaseTheme {

  init() {
    this.colors = {
      state1: 0xff0000,
      state2: 0xffff00,
      state3: 0x00ff00,
      state4: 0x0000ff
    };

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1,1),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );

    this.plane.scale.set(2,2,1);
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