import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class ColorTheme extends BaseTheme {
init() {
  this.colors = {
    state1: new THREE.Color(0xff0000), // Rot
    state2: new THREE.Color(0xffff00), // Gelb
    state3: new THREE.Color(0x00ff00), // Grün
    state4: new THREE.Color(0x0000ff)  // Blau
  };
}

  update(stateData) {
    const { current, next, blend } = stateData;

    if (!current || !next) return;

    const currentColor = this.colors[current];
    const nextColor = this.colors[next];

    if (!currentColor || !nextColor) return;

    const result = currentColor.clone().lerp(nextColor, blend);

    console.log("RESULT RGB:", result.r, result.g, result.b);

    this.scene.background = result;
}
    }
