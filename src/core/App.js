import * as THREE from "three";
import { Renderer } from "../graphics/Renderer.js";
import { Loop } from "./Loop.js";
import { ScrollController } from "../engine/ScrollController.js";
import { StateManager } from "../engine/StateManager.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
    this.scroll = new ScrollController();
    this.stateManager = new StateManager();

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    this.plane.scale.set(2, 2, 1);
    this.renderer.scene.add(this.plane);

    this.colors = {
      state1: 0xff0000,
      state2: 0xffff00,
      state3: 0x00ff00,
      state4: 0x0000ff
    };

    this.loop = new Loop(
      () => this.update(),
      () => this.renderer.render()
    );

    this.loop.start();
  }

  update() {
  const progress = this.scroll.getProgress();

  this.stateManager.update(progress);
  const state = this.stateManager.get();

  const currentHex = this.colors[state.current];
  const nextHex = this.colors[state.next];

  if (currentHex === undefined || nextHex === undefined) return;

  const currentColor = new THREE.Color(currentHex);
  const nextColor = new THREE.Color(nextHex);

  const blendedColor = currentColor.lerp(nextColor, state.blend);

  this.plane.material.color.copy(blendedColor);
}
  }
