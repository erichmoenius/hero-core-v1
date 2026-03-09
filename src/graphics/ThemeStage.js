import * as THREE from "three";

export class ThemeStage {

  constructor(scene){

    this.scene = scene;

    // Container für Themes
    this.content = new THREE.Group();
    scene.add(this.content);

    const size = 5.5;

    // Glass Portal
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        opacity: 0.15,
        transparent: true,
        roughness: 0.2,
        metalness: 0,
        depthWrite:false
      })
    );

    glass.position.z = 0.01;

    scene.add(glass);

  }

  getContent(){
    return this.content;
  }

}