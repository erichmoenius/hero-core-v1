import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class ColorTheme extends BaseTheme {
  init() {
    this.colors = {
      state1: new THREE.Color(0xff0000),
      state2: new THREE.Color(0x00ff00),
      state3: new THREE.Color(0x0000ff),
      state4: new THREE.Color(0xffff00)
    };
  }

  update(stateData) {
    const { current, blend } = stateData;

    if (!current) return;

    const baseColor = this.colors[current];

    if (baseColor) {
      this.scene.background = baseColor.clone().lerp(
        new THREE.Color(0xffffff),
        blend * 0.3
      );
    }
  }
}