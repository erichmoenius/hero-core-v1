import * as THREE from "three";
import { BaseTheme } from "./BaseTheme.js";

export class ColorTheme extends BaseTheme {

constructor(container){
super(container);
}

init(){

this.colors = {
state1: 0xff0000,
state2: 0xffff00,
state3: 0x00ff00,
state4: 0x0000ff
};

console.log("Theme container:", this.container);

this.geometry = new THREE.PlaneGeometry(5.5,5.5);

this.material = new THREE.MeshBasicMaterial({
color: this.colors.state1,
transparent: true,
depthWrite: false,
depthTest: false
});

this.plane = new THREE.Mesh(
this.geometry,
this.material
);

// wichtig für Portal-Rendering
this.plane.renderOrder = 2;

// wichtig: container
this.container.add(this.plane);

}


update({ current, next, blend, intensity }){

if(!current || !next) return;

const c1 = new THREE.Color(this.colors[current]);
const c2 = new THREE.Color(this.colors[next]);

const blended = c1.clone().lerp(c2, blend);

this.plane.material.color.copy(blended);


// ⭐ Portal Breathing (LMB Boost)

if(intensity !== undefined){

const boost = 1 + intensity * 0.15;

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