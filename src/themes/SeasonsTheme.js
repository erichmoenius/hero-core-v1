import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class SeasonsTheme extends BaseTheme {

constructor(container){
super(container);
}

init(){

this.colors = {

state1: 0x8df5a6, // spring → light green

state2: 0xff7a00, // summer → strong warm orange

state3: 0xa06b3b, // autumn → brown dust

state4: 0x9fdfff  // winter → icy blue

};

this.geometry = new THREE.PlaneGeometry(5.5,5.5);

this.material = new THREE.MeshBasicMaterial({
color: this.colors.state1,
transparent: true,
opacity: 0.35,
depthWrite: false,
depthTest: false,
blending: THREE.AdditiveBlending
});

this.plane = new THREE.Mesh(
this.geometry,
this.material
);

// wichtig
this.plane.renderOrder = 2;

// leicht hinter das Glas
this.plane.position.z = -0.02;

this.container.add(this.plane);

}

update({ current, next, blend, intensity }){

if(!current || !next) return;

const c1 = new THREE.Color(this.colors[current]);
const c2 = new THREE.Color(this.colors[next]);

const blended = c1.clone().lerp(c2, blend);

this.plane.material.color.copy(blended);


// Portal breathing
if(intensity !== undefined){

const boost = 1 + intensity * 0.08;

this.plane.scale.set(
5.5 * boost,
5.5 * boost,
1
);

}

}

dispose(){

if(!this.plane) return;

this.container.remove(this.plane);

this.geometry.dispose();
this.material.dispose();

this.plane = null;

}

}