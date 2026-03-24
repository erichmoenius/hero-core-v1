import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

  constructor(container){

    this.container = container;
    this.time = 0;

    // ------------------------------------------------
    // 🎬 FILE CONFIG
    // ------------------------------------------------

    this.files = {
      base: "/mov/base.mp4",
      mid: "/mov/mid.mp4",
      energy: "/mov/energy.mp4"
    };

    // ------------------------------------------------
    // 🎬 BASE (A/B CROSSFADE)
    // ------------------------------------------------

    this.baseA = this.createLayer(this.files.base, 14, -8, 0.5);
    this.baseB = this.createLayer(this.files.base, 14, -8, 0.0);

    this.baseActive = "A";
    this.baseFade = 0;
    this.baseTimer = 0;

    this.baseSwitchTime = 12;
    this.baseFadeSpeed = 0.01;

    // ------------------------------------------------
    // 🎬 MID + ENERGY
    // ------------------------------------------------

    this.mid = this.createLayer(this.files.mid, 10, -6, 0.4);

    this.energy = this.createLayer(
      this.files.energy,
      6,
      -4,
      0.25,
      true
    );

    // ------------------------------------------------
    // 🎬 STATIC OFFSETS
    // ------------------------------------------------

    this.baseOffset = new THREE.Vector2(-0.2, 0.0);
    this.midOffset = new THREE.Vector2(0.3, 0.1);
    this.energyOffset = new THREE.Vector2(-0.4, -0.2);
  }


  // ------------------------------------------------
  // 🎬 CACHE HELPER
  // ------------------------------------------------

  getFreshPath(path){
    return path + "?v=" + Date.now();
  }


  // ------------------------------------------------
  // 🎬 CREATE LAYER
  // ------------------------------------------------

  createLayer(path, width, z, opacity, additive=false){

    const texture = loadMovieTexture(this.getFreshPath(path));

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: opacity,
      toneMapped: false,
      depthWrite: false
    });

    if(additive){
      material.blending = THREE.AdditiveBlending;
    }

    const geometry = new THREE.PlaneGeometry(
      width,
      width * 9 / 16
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0,0,z);

    this.container.add(mesh);

    return { mesh, material };
  }


  // ------------------------------------------------
  // 🎬 RELOAD BASE
  // ------------------------------------------------

  reloadBase(layer){

    const texture = loadMovieTexture(
      this.getFreshPath(this.files.base)
    );

    layer.material.map = texture;
    layer.material.needsUpdate = true;
    layer.material.opacity = 0;
  }


  // ------------------------------------------------
  // 🎬 UPDATE
  // ------------------------------------------------

  update(state){

    this.time += 0.016;
    this.baseTimer += 0.016;

    const p = state.progress ?? 0;
    const i = state.intensity ?? 0;

    // ------------------------------------------------
    // 🎬 BASE SWITCH
    // ------------------------------------------------

    if(this.baseTimer > this.baseSwitchTime){

      this.baseTimer = 0;

      if(this.baseActive === "A"){
        this.reloadBase(this.baseB);
      } else {
        this.reloadBase(this.baseA);
      }

      this.baseFade = 0;
    }


    // ------------------------------------------------
    // 🎬 CROSSFADE (CINEMATIC)
    // ------------------------------------------------

    const ease = (t) => t * t * (3 - 2 * t);

    this.baseFade += this.baseFadeSpeed;

    const f = Math.min(this.baseFade, 1);
    const e = ease(f);

    if(this.baseActive === "A"){
      this.baseA.material.opacity = (1 - e) * 0.5;
      this.baseB.material.opacity = e * 0.5;
    } else {
      this.baseA.material.opacity = e * 0.5;
      this.baseB.material.opacity = (1 - e) * 0.5;
    }

    if(f >= 1){
      this.baseActive = this.baseActive === "A" ? "B" : "A";
    }


    // ------------------------------------------------
    // 🎥 CINEMATIC DRIFT
    // ------------------------------------------------

    const baseX = this.baseOffset.x + Math.sin(this.time * 0.05) * 0.08;

    this.baseA.mesh.position.x = baseX;
    this.baseB.mesh.position.x = baseX;

    this.mid.mesh.position.x =
      this.midOffset.x + Math.sin(this.time * 0.2) * 0.25;

    this.mid.mesh.position.y =
      this.midOffset.y + Math.cos(this.time * 0.15) * 0.15;

    this.energy.mesh.position.x =
      this.energyOffset.x + Math.sin(this.time * 0.5) * 0.6;

    this.energy.mesh.position.y =
      this.energyOffset.y + Math.cos(this.time * 0.4) * 0.4;

    // Scroll verstärkt Offset
    this.mid.mesh.position.x += (p - 0.5) * 0.5;
    this.energy.mesh.position.x += (p - 0.5) * 1.2;


    // ------------------------------------------------
    // 🚀 SCROLL = CINEMATIC ZOOM
    // ------------------------------------------------

    const zoom = 1 + p * 1.5;

    this.baseA.mesh.position.z = -8 + p * 3;
    this.baseB.mesh.position.z = -8 + p * 3;

    this.baseA.mesh.scale.setScalar(1.0 * zoom);
    this.baseB.mesh.scale.setScalar(1.0 * zoom);

    this.mid.mesh.position.z = -6 + p * 4;
    this.mid.mesh.scale.setScalar(1.1 * zoom);

    this.energy.mesh.position.z = -4 + p * 5;
    this.energy.mesh.scale.setScalar(1.3 * zoom);


    // ------------------------------------------------
    // ⚡ INTENSITY (LMB)
    // ------------------------------------------------

    this.energy.material.opacity = 0.25 + i * 0.5;
    this.mid.material.opacity = 0.4 + i * 0.2;


    // ------------------------------------------------
    // 💓 ENERGY PULSE
    // ------------------------------------------------

    this.energy.material.opacity += Math.sin(this.time * 2) * 0.05;


    // ------------------------------------------------
    // 🎬 GLOBAL DRIFT
    // ------------------------------------------------

    this.container.position.z = Math.sin(this.time * 0.2) * 0.2;
  }


  // ------------------------------------------------
  // CLEANUP
  // ------------------------------------------------

  destroy(){

    this.container.remove(this.baseA.mesh);
    this.container.remove(this.baseB.mesh);
    this.container.remove(this.mid.mesh);
    this.container.remove(this.energy.mesh);

    this.baseA.mesh.geometry.dispose();
    this.baseB.mesh.geometry.dispose();
    this.mid.mesh.geometry.dispose();
    this.energy.mesh.geometry.dispose();

    this.baseA.material.dispose();
    this.baseB.material.dispose();
    this.mid.material.dispose();
    this.energy.material.dispose();
  }
}