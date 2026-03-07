import * as THREE from "three";

export class ThemeStage {

constructor(scene){

const geo = new THREE.PlaneGeometry(2.5,2.5);

const mat = new THREE.MeshBasicMaterial({
color:0x111111,
transparent:true,
opacity:0.9
});

this.mesh = new THREE.Mesh(geo,mat);

this.mesh.position.z = 0;

scene.add(this.mesh);

}

}