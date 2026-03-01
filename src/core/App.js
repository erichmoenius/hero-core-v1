import * as THREE from "three";
import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
    this.scroll = new ScrollController();

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    // Frustum exakt abdecken
    this.plane.scale.set(2, 2, 1);
    this.plane.position.z = -1;

    this.renderer.scene.add(this.plane);

    this.loop = new Loop(
      () => this.update(),
      () => this.renderer.render()
    );

    this.loop.start();
  }

  update() {
    const p = this.scroll.getProgress();

    if (p < 0.25) {
      this.plane.material.color.set(0xff0000);
    } else if (p < 0.5) {
      this.plane.material.color.set(0xffff00);
    } else if (p < 0.75) {
      this.plane.material.color.set(0x00ff00);
    } else {
      this.plane.material.color.set(0x0000ff);
    }
  }
}