import * as THREE from "three";

export class ShaderWorld{

constructor(scene){

const geo = new THREE.PlaneGeometry(20,20);

this.material = new THREE.ShaderMaterial({

uniforms:{
uTime:{value:0}
},

vertexShader:`

void main(){

gl_Position = projectionMatrix *
modelViewMatrix *
vec4(position,1.0);

}

`,

fragmentShader:`

uniform float uTime;

void main(){

vec2 uv = gl_FragCoord.xy / vec2(1920.0,1080.0);

uv.x += uTime * 0.03;

float glow = sin(uv.x*10.0+uTime)*0.5+0.5;

vec3 col = vec3(0.05,0.08,0.2) + glow*0.15;

gl_FragColor = vec4(col,1.0);

}

`

});

this.mesh = new THREE.Mesh(geo,this.material);

this.mesh.position.z = -5;

scene.add(this.mesh);

}

update(){

this.material.uniforms.uTime.value += 0.01;

}

}