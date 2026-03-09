import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";

export class ImageTheme extends BaseTheme {

  constructor(container){
    super(container);
  }

  init(){

    const loader = new THREE.TextureLoader();

    this.textures = {
      state1: loader.load(img1),
      state2: loader.load(img2),
      state3: loader.load(img3),
      state4: loader.load(img4)
    };

    this.lastCurrent = null;
    this.lastNext = null;

    // Portal-sized plane
    this.geometry = new THREE.PlaneGeometry(5.5,5.5);

    this.material1 = new THREE.MeshBasicMaterial({
      transparent:true,
      depthWrite:false
    });

    this.material2 = new THREE.MeshBasicMaterial({
      transparent:true,
      depthWrite:false
    });

    this.plane1 = new THREE.Mesh(this.geometry, this.material1);
    this.plane2 = new THREE.Mesh(this.geometry, this.material2);

    // IMPORTANT: use container, not scene
    this.container.add(this.plane1);
    this.container.add(this.plane2);

  }

  update({ current, next, blend, intensity }){

    if(!current || !next) return;

    // change textures only when state changes
    if(current !== this.lastCurrent){
      this.material1.map = this.textures[current];
      this.material1.needsUpdate = true;
      this.lastCurrent = current;
    }

    if(next !== this.lastNext){
      this.material2.map = this.textures[next];
      this.material2.needsUpdate = true;
      this.lastNext = next;
    }

    // crossfade
    this.material1.opacity = 1 - blend;
    this.material2.opacity = blend;

    // optional intensity scale
    if(intensity !== undefined){
      const boost = 1 + intensity * 0.15;
      this.plane1.scale.set(boost, boost, 1);
      this.plane2.scale.set(boost, boost, 1);
    }

  }

  dispose(){

    if(!this.plane1) return;

    this.container.remove(this.plane1);
    this.container.remove(this.plane2);

    this.geometry.dispose();
    this.material1.dispose();
    this.material2.dispose();

  }

}