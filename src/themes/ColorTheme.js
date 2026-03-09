import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class ColorTheme extends BaseTheme {

  constructor(container){
    super(container);
  }

  init(){

    this.colors = {
      state1: 0xff0000,
      state2: 0xffff00,
      state3: 0x00ff00,
      state4: 0x0000ff
    };

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5,5.5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    // WICHTIG: container, nicht scene
    this.container.add(this.plane);

  }

  update({ current, next, blend }){

    if(!current || !next) return;

    const c1 = new THREE.Color(this.colors[current]);
    const c2 = new THREE.Color(this.colors[next]);

    const blended = c1.clone().lerp(c2, blend);

    this.plane.material.color.copy(blended);

  }

  dispose(){

    if(!this.plane) return;

    this.container.remove(this.plane);
    this.plane.geometry.dispose();
    this.plane.material.dispose();

  }

}