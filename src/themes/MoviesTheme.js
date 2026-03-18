import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;

    // 🎬 texture
    this.texture = loadMovieTexture("/mov/test_fixed.mp4");

    // plane
    const geometry = new THREE.PlaneGeometry(10, 6);

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.4,
      toneMapped: false
    });

    this.material.blending = THREE.NormalBlending;

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(0, 0, -4);

    this.container.add(this.mesh);
  }


  // ------------------------------------------------
  // UPDATE (State-driven)
  // ------------------------------------------------

  update(state){

    // intensity from your system
    const i = state.intensity ?? 0;

    // 🎬 subtle breathing
    this.mesh.scale.setScalar(1.05 + Math.sin(performance.now()*0.0002)*0.02);

    // ------------------------------------------------
    // STATE DRAMATURGY
    // ------------------------------------------------

    // Gas / Air
    if(state.gas > 0){
      this.material.opacity = 0.25 + state.gas * 0.2;
    }

    // Water
    if(state.water > 0){
      this.material.opacity = 0.35 + state.water * 0.25;
    }

    // Fire
    if(state.fire > 0){
      this.material.opacity = 0.2 + state.fire * 0.4;
      this.material.blending = THREE.AdditiveBlending;
    } else {
      this.material.blending = THREE.NormalBlending;
    }

    // Solid
    if(state.solid > 0){
      this.material.opacity = 0.15 + state.solid * 0.2;
    }

    // extra intensity boost
    this.material.opacity += i * 0.2;
  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){
    this.container.remove(this.mesh);
  }

}