import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;

    this.time = 0;

    // ------------------------------------------------
    // 🎬 VIDEO LAYER 1 (BASE)
    // ------------------------------------------------

    const tex1 = loadMovieTexture("/mov/test_fixed.mp4");

    this.mat1 = new THREE.MeshBasicMaterial({
      map: tex1,
      transparent: true,
      opacity: 0.35,
      toneMapped: false
    });

    this.mat1.blending = THREE.NormalBlending;

    this.mesh1 = new THREE.Mesh(
      new THREE.PlaneGeometry(10,6),
      this.mat1
    );

    this.mesh1.position.set(0,0,-4);

    container.add(this.mesh1);


    // ------------------------------------------------
    // 🎬 VIDEO LAYER 2 (DETAIL)
    // ------------------------------------------------

    const tex2 = loadMovieTexture("/mov/red_spirale.mp4");

    this.mat2 = new THREE.MeshBasicMaterial({
      map: tex2,
      transparent: true,
      opacity: 0.15,
      toneMapped: false
    });

    this.mat2.blending = THREE.AdditiveBlending;

    this.mesh2 = new THREE.Mesh(
      new THREE.PlaneGeometry(10,6),
      this.mat2
    );

    this.mesh2.position.set(0,0,-3.5);

    container.add(this.mesh2);
  }


  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  update(state){

    this.time += 0.016;

    const i = state.intensity ?? 0;

    // ------------------------------------------------
    // 🎬 PARALLAX (depth feeling)
    // ------------------------------------------------

    this.mesh1.position.x = Math.sin(this.time * 0.2) * 0.3;
    this.mesh1.position.y = Math.cos(this.time * 0.15) * 0.2;

    this.mesh2.position.x = Math.sin(this.time * 0.4) * 0.5;
    this.mesh2.position.y = Math.cos(this.time * 0.3) * 0.3;

    // ------------------------------------------------
    // 🎬 SCALE BREATHING
    // ------------------------------------------------

    this.mesh1.scale.setScalar(1.02 + Math.sin(this.time * 0.3) * 0.04);
    this.mesh2.scale.setScalar(1.05 + Math.sin(this.time * 0.5) * 0.06);

    // ------------------------------------------------
    // 🎬 STATE REACTION
    // ------------------------------------------------

    let baseOpacity = 0.25;
    let detailOpacity = 0.1;

    if(state.fire > 0){
      baseOpacity = 0.2 + state.fire * 0.4;
      detailOpacity = 0.15 + state.fire * 0.5;

      this.mat2.blending = THREE.AdditiveBlending;
    }
    else if(state.water > 0){
      baseOpacity = 0.3 + state.water * 0.25;
      detailOpacity = 0.1 + state.water * 0.2;

      this.mat2.blending = THREE.NormalBlending;
    }
    else if(state.gas > 0){
      baseOpacity = 0.2 + state.gas * 0.2;
      detailOpacity = 0.05 + state.gas * 0.1;
    }
    else if(state.solid > 0){
      baseOpacity = 0.15 + state.solid * 0.2;
      detailOpacity = 0.05;
    }

    baseOpacity += i * 0.2;
    detailOpacity += i * 0.2;

    // smooth fade
    this.mat1.opacity += (baseOpacity - this.mat1.opacity) * 0.05;
    this.mat2.opacity += (detailOpacity - this.mat2.opacity) * 0.05;
  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){
    this.container.remove(this.mesh1);
    this.container.remove(this.mesh2);
  }

}