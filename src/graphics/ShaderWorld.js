import * as THREE from "three";

export class ShaderWorld {

constructor(scene){

this.uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2(0,0) }
};

this.mouse = new THREE.Vector2();

window.addEventListener("mousemove",(e)=>{

const x = e.clientX / window.innerWidth - 0.5;
const y = e.clientY / window.innerHeight - 0.5;

this.mouse.set(x,y);

});

const geo = new THREE.PlaneGeometry(40,40);

const mat = new THREE.ShaderMaterial({

uniforms:this.uniforms,

vertexShader: `
varying vec2 vUv;

void main(){

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

}
`,

fragmentShader: `
uniform float uTime;
uniform vec2 uMouse;

varying vec2 vUv;


// random
float hash(vec2 p){
return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}


// noise
float noise(vec2 p){

vec2 i = floor(p);
vec2 f = fract(p);

vec2 u = f*f*(3.0-2.0*f);

return mix(
mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),
mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),
u.y);

}


// fractal noise
float fbm(vec2 p){

float v = 0.0;
float a = 0.5;

for(int i=0;i<5;i++){

v += a * noise(p);

p *= 2.0;
a *= 0.5;

}

return v;

}


void main(){

vec2 uv = vUv;

// mouse parallax
uv += uMouse * 0.08;

// slow nebula drift
uv.x += uTime * 0.006;

float n = fbm(uv * 3.0);

vec3 colorA = vec3(0.07,0.05,0.18);
vec3 colorB = vec3(0.2,0.12,0.45);
vec3 colorC = vec3(0.6,0.3,0.9);

vec3 col = mix(colorA,colorB,n);
col = mix(col,colorC,n*n*0.5);

gl_FragColor = vec4(col,1.0);

}
`,

depthWrite:false

});

this.mesh = new THREE.Mesh(geo,mat);

this.mesh.position.z = -10;

scene.add(this.mesh);

}

update(){

this.uniforms.uTime.value += 0.01;

// smooth parallax
this.uniforms.uMouse.value.lerp(this.mouse,0.05);

}

}