import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;
    this.time = 0;

    // ------------------------------------------------
    // 🎬 VIDEO A + B (Crossfade Base)
    // ------------------------------------------------

    this.texA = loadMovieTexture("/mov/hyper.mp4");
    this.texB = loadMovieTexture("/mov/blue.mp4");

    this.matA = new THREE.MeshBasicMaterial({
      map: this.texA,
      transparent: true,
      opacity: 1.0,
      toneMapped: false
    });

    this.matB = new THREE.MeshBasicMaterial({
      map: this.texB,
      transparent: true,
      opacity: 0.0,
      toneMapped: false
    });

    // Base planes (gleich groß!)
    this.meshA = new THREE.Mesh(
      new THREE.PlaneGeometry(16,9),
      this.matA
    );

    this.meshB = new THREE.Mesh(
      new THREE.PlaneGeometry(16,9),
      this.matB
    );

    this.meshA.position.set(0,0,-4);
    this.meshB.position.set(0,0,-4);

    this.container.add(this.meshA);
    this.container.add(this.meshB);


    // ------------------------------------------------
    // 🎬 ENERGY LAYER (dein alter Layer 2)
    // ------------------------------------------------

    const texEnergy = loadMovieTexture("/mov/blue.mp4");

    this.matEnergy = new THREE.MeshBasicMaterial({
      map: texEnergy,
      transparent: true,
      opacity: 0.2,
      toneMapped: false
    });

    this.matEnergy.blending = THREE.AdditiveBlending;

    this.meshEnergy = new THREE.Mesh(
      new THREE.PlaneGeometry(16,9),
      this.matEnergy
    );

    this.meshEnergy.position.set(0,0,-3.5);
    this.container.add(this.meshEnergy);
  }


  // ------------------------------------------------
  // 🎬 UPDATE
  // ------------------------------------------------

  update(state){

    this.time += 0.016;

    const i = state.intensity ?? 0;
    const p = state.progress ?? 0;


    // ------------------------------------------------
    // 🎬 CROSSFADE (CORE FEATURE)
    // ------------------------------------------------

    const fade = (Math.sin(this.time * 0.15) + 1) * 0.5;

    this.matA.opacity = 1.0 - fade;
    this.matB.opacity = fade;


    // ------------------------------------------------
    // 🎥 PARALLAX + BREATHING
    // ------------------------------------------------

    this.meshA.position.x = Math.sin(this.time * 0.1) * 0.2;
    this.meshA.position.y = Math.cos(this.time * 0.08) * 0.15;

    this.meshB.position.x = Math.sin(this.time * 0.12) * 0.25;
    this.meshB.position.y = Math.cos(this.time * 0.1) * 0.2;

    this.meshEnergy.position.x = Math.sin(this.time * 0.37) * 0.6;
    this.meshEnergy.position.y = Math.cos(this.time * 0.23) * 0.4;


    this.meshA.scale.setScalar(1.02 + Math.sin(this.time * 0.25) * 0.03);
    this.meshB.scale.setScalar(1.03 + Math.sin(this.time * 0.28) * 0.035);
    this.meshEnergy.scale.setScalar(1.05 + Math.sin(this.time * 0.4) * 0.05);


    // ------------------------------------------------
    // 🚀 SCROLL DEPTH
    // ------------------------------------------------

    this.meshA.position.z = -4 + p * 2.5;
    this.meshB.position.z = -4 + p * 2.5;
    this.meshEnergy.position.z = -3.5 + p * 2;


    // ------------------------------------------------
    // 🎬 ENERGY LAYER CONTROL
    // ------------------------------------------------

    let energyOpacity = 0.1 + p * 0.4;

    if(state.fire > 0){
      energyOpacity += state.fire * 0.6;
      this.matEnergy.blending = THREE.AdditiveBlending;
    }

    else if(state.water > 0){
      energyOpacity += state.water * 0.3;
      this.matEnergy.blending = THREE.NormalBlending;
    }

    else if(state.gas > 0){
      energyOpacity += state.gas * 0.2;
    }

    else if(state.solid > 0){
      energyOpacity *= 0.5;
      this.matEnergy.blending = THREE.NormalBlending;
    }


    // intensity boost (LMB)
    energyOpacity += i * 0.4;


    // smooth fade
    this.matEnergy.opacity += (energyOpacity - this.matEnergy.opacity) * 0.05;


    // ------------------------------------------------
    // 💓 ENERGY PULSE
    // ------------------------------------------------

    this.matEnergy.opacity += Math.sin(this.time * 1.7) * 0.02;


    // ------------------------------------------------
    // 🔥 BREAK MOMENT
    // ------------------------------------------------

    if(p > 0.8){
      this.matEnergy.opacity += (p - 0.8) * 0.5;
    }

  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){

    this.container.remove(this.meshA);
    this.container.remove(this.meshB);
    this.container.remove(this.meshEnergy);

    this.meshA.geometry.dispose();
    this.meshB.geometry.dispose();
    this.meshEnergy.geometry.dispose();

    this.matA.dispose();
    this.matB.dispose();
    this.matEnergy.dispose();
  }

}