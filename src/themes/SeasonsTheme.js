import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class SeasonsTheme extends BaseTheme {

  constructor(container){
    super(container);
  }

  init(){

    this.colors = {
      state1: 0xaad6ff, // winter
      state2: 0x88cc88, // spring
      state3: 0xffcc66, // summer
      state4: 0xcc8844  // autumn
    };

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5,5.5),
      new THREE.MeshBasicMaterial({ color: this.colors.state1 })
    );

    // wichtig: container
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