import * as THREE from "three";

export class ShaderWorld {

constructor(scene){

this.scene = scene;

this.uniforms = {
  uTime:{value:0},
  uMouse:{value:new THREE.Vector2(0,0)}
};

this.mouse = new THREE.Vector2();

// 🔥 NEW: zentrale Layer-Liste
this.layers = [];

window.addEventListener("mousemove",(e)=>{

  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;

  this.mouse.set(x,y);

});

this._createLayers();

}


// ------------------------------------------------
// CREATE LAYERS
// ------------------------------------------------

_createLayers(){

this.farNebula  = this._createNebulaLayer(-12,0.003,0.04,2.2);
this.fogLayer   = this._createFogLayer(-10);
this.nearNebula = this._createNebulaLayer(-9,0.007,0.10,3.0);

}


// ------------------------------------------------
// NEBULA
// ------------------------------------------------

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

float hash(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(
    mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),
    mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),
    u.y);
}

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
  uv += uMouse * uMouseStrength;

  float n = fbm(uv * uNoiseScale + uTime * uSpeed);
  n = pow(n,1.2);

  vec3 colorA = vec3(0.02,0.03,0.10);
  vec3 colorB = vec3(0.08,0.12,0.35);
  vec3 colorC = vec3(0.35,0.55,1.0);

  vec3 col = mix(colorA,colorB,n);
  col += colorC * n * 0.3;

  gl_FragColor = vec4(col,1.0);

}
`,

depthWrite:false,
transparent:false

});

const mesh = new THREE.Mesh(geo,mat);
mesh.position.z = z;

this.scene.add(mesh);

// 🔥 NEW: track layer
this.layers.push(mesh);

return mesh;

}


// ------------------------------------------------
// FOG
// ------------------------------------------------

_createFogLayer(z){

const geo = new THREE.PlaneGeometry(40,40);

const mat = new THREE.MeshBasicMaterial({
  color:0x1a2a55,
  transparent:true,
  opacity:0.08,
  depthWrite:false
});

const mesh = new THREE.Mesh(geo,mat);
mesh.position.z = z;

this.scene.add(mesh);

// 🔥 NEW
this.layers.push(mesh);

return mesh;

}


// ------------------------------------------------
// 🔥 NEW: GLOBAL VISIBILITY CONTROL
// ------------------------------------------------

setActive(active){

this.layers.forEach(layer=>{
  layer.visible = active;
});

}


// ------------------------------------------------
// UPDATE
// ------------------------------------------------

update(){

this.uniforms.uTime.value += 0.01;
this.uniforms.uMouse.value.lerp(this.mouse,0.05);

}

}