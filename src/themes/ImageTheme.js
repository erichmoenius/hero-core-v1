import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

import img1 from "../assets/images/img1.jpg";
import img2 from "../assets/images/img2.jpg";
import img3 from "../assets/images/img3.jpg";
import img4 from "../assets/images/img4.jpg";

export class ImageTheme extends BaseTheme {

  init() {
    this.loader = new THREE.TextureLoader();

    this.textures = {
      state1: this.loader.load(img1),
      state2: this.loader.load(img2),
      state3: this.loader.load(img3),
      state4: this.loader.load(img4)
    };

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.material1 = new THREE.MeshBasicMaterial({
      map: null,
      transparent: true
    });

    this.material2 = new THREE.MeshBasicMaterial({
      map: null,
      transparent: true
    });

    this.plane1 = new THREE.Mesh(this.geometry, this.material1);
    this.plane2 = new THREE.Mesh(this.geometry, this.material2);

    this.plane1.scale.set(2,2,1);
    this.plane2.scale.set(2,2,1);

    this.scene.add(this.plane1);
    this.scene.add(this.plane2);
  }

  update({ current, next, blend }) {
    if (!current || !next) return;

    this.material1.map = this.textures[current];
    this.material2.map = this.textures[next];

    this.material1.opacity = 1 - blend;
    this.material2.opacity = blend;
  }

  dispose() {
    this.scene.remove(this.plane1);
    this.scene.remove(this.plane2);
  }
}