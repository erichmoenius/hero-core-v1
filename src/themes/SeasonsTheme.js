import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class SeasonsTheme extends BaseTheme {
  init() {
    this.colors = {
      state1: new THREE.Color(0x7CFC00), // Spring – hellgrün
      state2: new THREE.Color(0xFFD700), // Summer – warmes gelb
      state3: new THREE.Color(0xFF8C00), // Autumn – orange
      state4: new THREE.Color(0x87CEFA)  // Winter – hellblau
    };
  }

  update(stateData) {
     this.scene.background = new THREE.Color(0xff00ff);
}

  dispose() {
    // optional cleanup
  }
}