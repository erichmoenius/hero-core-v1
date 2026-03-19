import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;
    this.time = 0;

    // ------------------------------------------------
    // 🎬 VIDEO LAYER 1 (BASE)
    // ------------------------------------------------

    const tex1 = loadMovieTexture("/mov/blue.mp4");

    this.mat1 = new THREE.MeshBasicMaterial({
      map: tex1,
      transparent: true,
      opacity: 1.1,
      toneMapped: false
    });

    this.mat1.blending = THREE.NormalBlending;

    this.mesh1 = new THREE.Mesh(
      new THREE.PlaneGeometry(10,6),
      this.mat1
    );

    this.mesh1.position.set(0,0,-4);
    this.container.add(this.mesh1);


    // ------------------------------------------------
    // 🎬 VIDEO LAYER 2 (DETAIL / ENERGY)
    // ------------------------------------------------

    const tex2 = loadMovieTexture("/mov/red_spirale.mp4");

    this.mat2 = new THREE.MeshBasicMaterial({
      map: tex2,
      transparent: true,
      opacity: 0.2,
      toneMapped: false
    });

    this.mat2.blending = THREE.AdditiveBlending;

    this.mesh2 = new THREE.Mesh(
      new THREE.PlaneGeometry(10,6),
      this.mat2
    );

    this.mesh2.position.set(0,0,-3.5);
    this.container.add(this.mesh2);
  }


  // ------------------------------------------------
  // 🎬 UPDATE (CINEMATIC + STATE)
  // ------------------------------------------------

  update(state){

    this.time += 0.016;

    const i = state.intensity ?? 0;

    // ------------------------------------------------
    // 🎥 MOTION (Parallax + Breathing)
    // ------------------------------------------------

    this.mesh1.position.x = Math.sin(this.time * 0.1) * 0.2;
    this.mesh1.position.y = Math.cos(this.time * 0.08) * 0.15;

    this.mesh2.position.x = Math.sin(this.time * 0.37) * 0.6;
    this.mesh2.position.y = Math.cos(this.time * 0.23) * 0.4; 

    this.mesh1.scale.setScalar(1.02 + Math.sin(this.time * 0.3) * 0.04);
    this.mesh2.scale.setScalar(1.05 + Math.sin(this.time * 0.5) * 0.06);


    // ------------------------------------------------
    // 🎬 BASE VALUES
    // ------------------------------------------------

    let baseOpacity = 0.2;
    let detailOpacity = 0.15;

    let baseColor = new THREE.Color(1,1,1);
    let detailColor = new THREE.Color(1,1,1);

    let blendMode = THREE.NormalBlending;


    // ------------------------------------------------
    // 🎭 STATE DRAMATURGY
    // ------------------------------------------------

    if(state.fire > 0){
      baseOpacity = 0.2 + state.fire * 0.4;
      detailOpacity = 0.2 + state.fire * 0.5;

      baseColor.setRGB(1.2, 0.5, 0.2);
      detailColor.setRGB(1.5, 0.6, 0.3);

      blendMode = THREE.AdditiveBlending;
    }

    else if(state.water > 0){
      baseOpacity = 0.3 + state.water * 0.25;
      detailOpacity = 0.15 + state.water * 0.25;

      baseColor.setRGB(0.3, 0.5, 1.2);
      detailColor.setRGB(0.5, 0.7, 1.5);
    }

    else if(state.gas > 0){
      baseOpacity = 0.2 + state.gas * 0.2;
      detailOpacity = 0.1 + state.gas * 0.1;

      baseColor.setRGB(1.1, 1.1, 1.1);
      detailColor.setRGB(1.3, 1.3, 1.3);
    }

    else if(state.solid > 0){
      baseOpacity = 0.15 + state.solid * 0.2;
      detailOpacity = 0.05;

      baseColor.setRGB(0.6, 0.6, 0.6);
      detailColor.setRGB(0.8, 0.8, 0.8);
    }


    // ------------------------------------------------
    // ⚡ INTENSITY BOOST
    // ------------------------------------------------

    baseOpacity += i * 0.25;
    detailOpacity += i * 0.35;


    // ------------------------------------------------
    // 🎬 CONTRAST BOOST (Drama!)
    // ------------------------------------------------

    baseOpacity *= 0.9;
    detailOpacity *= 1.2;


    // ------------------------------------------------
    // 🎬 SMOOTH TRANSITIONS
    // ------------------------------------------------

    this.mat1.opacity += (baseOpacity - this.mat1.opacity) * 0.05;
    this.mat2.opacity += (detailOpacity - this.mat2.opacity) * 0.05;

    this.mat1.color.lerp(baseColor, 0.05);
    this.mat2.color.lerp(detailColor, 0.05);

    this.mat2.blending = blendMode;


    // ------------------------------------------------
    // 💓 SUBTLE ENERGY PULSE
    // ------------------------------------------------

    this.mat2.opacity += Math.sin(this.time * 2) * 0.03;
  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){
    this.container.remove(this.mesh1);
    this.container.remove(this.mesh2);
  }

}