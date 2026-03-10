import * as THREE from "three";

export class GlassPortal {

constructor(scene){

this.uniforms = {
uTime:{value:0}
};

const geo = new THREE.PlaneGeometry(5.5,5.5);

const mat = new THREE.ShaderMaterial({

transparent:true,
depthWrite:false,

uniforms:this.uniforms,

vertexShader:`

varying vec2 vUv;

void main(){

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

}

`,

fragmentShader:`

uniform float uTime;

varying vec2 vUv;

void main(){

vec2 uv = vUv;


// -------- Glass distortion --------

float wave =
sin(uv.y*30.0 + uTime*1.5) *
sin(uv.x*20.0 + uTime);

uv += wave * 0.01;


// -------- Fresnel Edge --------

float r = length(vUv - 0.5);

float fresnel = smoothstep(0.35,0.5,r);


// -------- Glass color --------

vec3 glass = vec3(0.6,0.8,1.0);


// -------- final --------

vec3 col = glass * fresnel * 0.8;

gl_FragColor = vec4(col, fresnel * 0.4);

}

`

});

this.mesh = new THREE.Mesh(geo,mat);

this.mesh.position.z = -1;

scene.add(this.mesh);

}

update(){

this.uniforms.uTime.value += 0.01;

}

}