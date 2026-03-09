import * as THREE from "three";

export class ShaderWorld {

constructor(scene){

this.scene = scene;

this.uniforms = {
  uTime:{value:0},
  uMouse:{value:new THREE.Vector2(0,0)}
};

this.mouse = new THREE.Vector2();

window.addEventListener("mousemove",(e)=>{

const x = e.clientX / window.innerWidth - 0.5;
const y = e.clientY / window.innerHeight - 0.5;

this.mouse.set(x,y);

});

this._createLayers();

}

_createLayers(){

this.farNebula = this._createNebulaLayer(-12,0.004,0.06,2.4);
this.nearNebula = this._createNebulaLayer(-9,0.009,0.12,3.2);

}

_createNebulaLayer(z, speed, mouseStrength, noiseScale){

const geo = new THREE.PlaneGeometry(40,40);

const mat = new THREE.ShaderMaterial({

uniforms:{
uTime:this.uniforms.uTime,
uMouse:this.uniforms.uMouse,
uSpeed:{value:speed},
uMouseStrength:{value:mouseStrength},
uNoiseScale:{value:noiseScale}
},

vertexShader:`

varying vec2 vUv;

void main(){

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

}

`,

fragmentShader:`

uniform float uTime;
uniform vec2 uMouse;
uniform float uSpeed;
uniform float uMouseStrength;
uniform float uNoiseScale;

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

vec2 uv = vUv - 0.5;


// ───── Spiral Distortion ─────

// radius from center
float r = length(uv);

// polar angle
float angle = atan(uv.y, uv.x);

// spiral rotation
angle += r * 2.5 + uTime * uSpeed * 4.0;

// back to cartesian
uv = vec2(cos(angle), sin(angle)) * r;

uv += 0.5;


// ───── Mouse Parallax ─────

uv += uMouse * uMouseStrength;


// ───── Nebula Noise ─────

float large = fbm(uv * uNoiseScale);
float detail = fbm(uv * (uNoiseScale*2.2));

float n = large * 0.8 + detail * 0.2;
n = pow(n, 1.4);

float glow = smoothstep(0.25,0.85,n);

// ───── Colors ─────

// deep space
vec3 colorA = vec3(0.02,0.03,0.10);

// nebula mid
vec3 colorB = vec3(0.08,0.12,0.35);

// glow
vec3 colorC = vec3(0.35,0.55,1.0);


vec3 col = mix(colorA,colorB,n);

col += colorC * glow * 0.35;

gl_FragColor = vec4(col,1.0);

}

`,


depthWrite:false,
transparent:false

});

const mesh = new THREE.Mesh(geo,mat);

mesh.position.z = z;

this.scene.add(mesh);

return mesh;

}

update(){

this.uniforms.uTime.value += 0.01;

this.uniforms.uMouse.value.lerp(this.mouse,0.05);

}

}