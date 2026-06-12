import * as THREE from "three";

export class NarrativeSpiral {

  constructor(scene){

    this.scene = scene;

    this.group = new THREE.Group();

    this.group.name = "NarrativeSpiral";

    this.scene.add(this.group);

  }

  createSpiral(){

  }

  update(){

  }

  destroy(){

    this.scene.remove(this.group);

  }

}