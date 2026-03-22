import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;
    this.time = 0;

    // ------------------------------------------------
    // 🎬 VIDEO LAYER 1 (BASE / SPACE)
    // ------------------------------------------------

    const tex1 = loadMovieTexture("/mov/hyper.mp4");

    this.mat1 = new THREE.MeshBasicMaterial({
      map: tex1,
      transparent: true,
      opacity: 0.5,
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
    // 🎬 VIDEO LAYER 2 (ENERGY)
    // ------------------------------------------------

    const tex2 = loadMovieTexture("/mov/blue.mp4");

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
  // 🎬 UPDATE (Scroll + State + Motion)
  // ------------------------------------------------

  update(state){

    this.time += 0.016;

    const i = state.intensity ?? 0;
    const p = state.progress ?? 0; // 🔥 SCROLL


    // ------------------------------------------------
    // 🎥 PARALLAX + BREATHING
    // ------------------------------------------------

    this.mesh1.position.x = Math.sin(this.time * 0.1) * 0.2;
    this.mesh1.position.y = Math.cos(this.time * 0.08) * 0.15;

    this.mesh2.position.x = Math.sin(this.time * 0.37) * 0.6;
    this.mesh2.position.y = Math.cos(this.time * 0.23) * 0.4;

    this.mesh1.scale.setScalar(1.02 + Math.sin(this.time * 0.25) * 0.03);
    this.mesh2.scale.setScalar(1.04 + Math.sin(this.time * 0.4) * 0.05);


    // ------------------------------------------------
    // 🚀 SCROLL DRAMATURGY (KEY FEATURE)
    // ------------------------------------------------

    // depth movement (flying into scene)
    this.mesh1.position.z = -4 + p * 2.5;
    this.mesh2.position.z = -3.5 + p * 2;

    // scale push
    this.mesh1.scale.multiplyScalar(1 + p * 0.4);
    this.mesh2.scale.multiplyScalar(1 + p * 0.7);


    // ------------------------------------------------
    // 🎬 BASE VALUES
    // ------------------------------------------------

    let baseOpacity = 0.3 + p * 0.4;
    let detailOpacity = 0.1 + p * 0.5;

    let baseColor = new THREE.Color(1,1,1);
    let detailColor = new THREE.Color(1,1,1);

    let blendMode = THREE.AdditiveBlending;


    // ------------------------------------------------
    // 🎭 STATE DRAMATURGY
    // ------------------------------------------------

    if(state.fire > 0){
      baseOpacity = 0.3 + state.fire * 0.4;
      detailOpacity = 0.2 + state.fire * 0.6;

      baseColor.setRGB(1.3, 0.4, 0.2);
      detailColor.setRGB(1.8, 0.5, 0.2);

      blendMode = THREE.AdditiveBlending;
    }

    else if(state.water > 0){
      baseOpacity = 0.4 + state.water * 0.3;
      detailOpacity = 0.15 + state.water * 0.25;

      baseColor.setRGB(0.3, 0.5, 1.3);
      detailColor.setRGB(0.5, 0.7, 1.6);

      blendMode = THREE.NormalBlending;
    }

    else if(state.gas > 0){
      baseOpacity = 0.25 + state.gas * 0.2;
      detailOpacity = 0.1 + state.gas * 0.1;

      baseColor.setRGB(1.1, 1.1, 1.1);
      detailColor.setRGB(1.3, 1.3, 1.3);
    }

    else if(state.solid > 0){
      baseOpacity = 0.2 + state.solid * 0.2;
      detailOpacity = 0.05;

      baseColor.setRGB(0.6, 0.6, 0.6);
      detailColor.setRGB(0.8, 0.8, 0.8);

      blendMode = THREE.NormalBlending;
    }


    // ------------------------------------------------
    // ⚡ INTENSITY BOOST
    // ------------------------------------------------

    baseOpacity += i * 0.2;
    detailOpacity += i * 0.3;


    // ------------------------------------------------
    // 🎬 CONTRAST + BALANCE
    // ------------------------------------------------

    baseOpacity *= 1.2;   // stärkerer Raum
    detailOpacity *= 0.85; // weniger Dominanz


    // ------------------------------------------------
    // 🎬 COLOR INTENSITY (Scroll Boost)
    // ------------------------------------------------

    baseColor.multiplyScalar(0.8 + p * 0.5);
    detailColor.multiplyScalar(1.0 + p * 0.8);


    // ------------------------------------------------
    // 🎬 SMOOTH TRANSITIONS
    // ------------------------------------------------

    this.mat1.opacity += (baseOpacity - this.mat1.opacity) * 0.05;
    this.mat2.opacity += (detailOpacity - this.mat2.opacity) * 0.05;

    this.mat1.color.lerp(baseColor, 0.05);
    this.mat2.color.lerp(detailColor, 0.05);

    this.mat2.blending = blendMode;


    // ------------------------------------------------
    // 💓 ENERGY PULSE
    // ------------------------------------------------

    this.mat2.opacity += Math.sin(this.time * 1.7) * 0.02;


    // ------------------------------------------------
    // 🔥 BREAKTHROUGH MOMENT
    // ------------------------------------------------

    if(p > 0.8){
      this.mat2.opacity += (p - 0.8) * 0.5;
    }

  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){

    this.container.remove(this.mesh1);
    this.container.remove(this.mesh2);

    this.mesh1.geometry.dispose();
    this.mesh2.geometry.dispose();

    this.mat1.dispose();
    this.mat2.dispose();
  }

}