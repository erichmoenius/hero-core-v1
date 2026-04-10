import * as THREE from "three";

export class SpaceTheme {

constructor(container){

this.container = container;
this.scene = container.parent;
this.time = 0;


// ------------------------------------------------
// 🌌 FOG (DEPTH)
// ------------------------------------------------

this.scene.fog = new THREE.FogExp2(0x000011, 0.06);


// ------------------------------------------------
// 🌌 GROUP
// ------------------------------------------------

this.group = new THREE.Group();
this.container.add(this.group);


// ------------------------------------------------
// 🌌 FIELD SETUP
// ------------------------------------------------

const count = 400;

for(let i = 0; i < count; i++){

  const geo = new THREE.BoxGeometry(0.4,0.4,0.4);

  // 🎨 color variation
  const hue = 0.55 + Math.random() * 0.1;

  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(hue, 0.6, 0.6),
    transparent: true,
    opacity: 0.5
  });

  const cube = new THREE.Mesh(geo, mat);

  // 🌌 RANDOM SPACE DISTRIBUTION
  cube.position.x = (Math.random() - 0.5) * 30;
  cube.position.y = (Math.random() - 0.5) * 30;
  cube.position.z = -Math.random() * 40;

  cube.userData.offset = Math.random() * 10;

  this.group.add(cube);
}

}


// ------------------------------------------------
// UPDATE
// ------------------------------------------------

update(state){

this.time += 0.016;

const p = state.progress ?? 0;
const i = state.intensity ?? 0;


// ------------------------------------------------
// 🌌 GLOBAL MOTION
// ------------------------------------------------

this.group.rotation.y += 0.0008;
this.group.rotation.x += 0.0003;


// ------------------------------------------------
// 🚀 DEPTH MOVEMENT
// ------------------------------------------------

this.group.position.z = p * 12;


// ------------------------------------------------
// ⚡ ENERGY + LIFE
// ------------------------------------------------

this.group.children.forEach((cube, idx)=>{

  const t = this.time + cube.userData.offset;

  // pulsating scale
  const scale = 1 + Math.sin(t * 2) * 0.2 + i * 0.8;
  cube.scale.setScalar(scale);

  // opacity reacts to intensity
  cube.material.opacity = 0.3 + i * 0.5;

  // micro float (alive feeling)
  cube.position.x += Math.cos(t) * 0.002;
  cube.position.y += Math.sin(t) * 0.002;

});

}


// ------------------------------------------------
// CLEANUP
// ------------------------------------------------

destroy(){

this.container.remove(this.group);

// reset fog (important!)
this.scene.fog = null;

this.group.traverse(obj => {
  if(obj.geometry) obj.geometry.dispose();
  if(obj.material) obj.material.dispose();
});

}

} 