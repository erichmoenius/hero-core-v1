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

// FAR nebula
this.farNebula = this._createNebulaLayer(-12,0.003,0.04,2.2);

// FOG layer
this.fogLayer = this._createFogLayer(-10);

// NEAR nebula
this.nearNebula = this._createNebulaLayer(-9,0.007,0.10,3.0);

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

vec2 curl(vec2 p){

float e = 0.001;

float n1 = noise(p + vec2(0.0,e));
float n2 = noise(p - vec2(0.0,e));
float a = (n1 - n2) / (2.0*e);

float n3 = noise(p + vec2(e,0.0));
float n4 = noise(p - vec2(e,0.0));
float b = (n3 - n4) / (2.0*e);

return vec2(a,-b);

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

// ───── Depth Parallax ─────

vec2 parallax = uMouse * 0.12;

vec2 uvFar  = uv + parallax * 0.25;
vec2 uvMid  = uv + parallax * 0.6;
vec2 uvNear = uv + parallax * 1.0;

// curl turbulence
vec2 flow = curl(uv * 2.0 + uTime * 0.15);
uv += flow * 0.12;

// spiral
float r = length(uv);
float angle = atan(uv.y, uv.x);

angle += r * 2.0 + uTime * uSpeed * 3.5;

uv = vec2(cos(angle), sin(angle)) * r;
uv += 0.5;

// mouse parallax
uv += uMouse * uMouseStrength;

// nebula noise
float n = 0.0;
float weight = 0.6;

vec2 p = uvMid;

for(int i=0;i<4;i++){

    float layer = fbm(p * uNoiseScale);

    n += layer * weight;

    // simulierte Tiefenverschiebung
    p += vec2(0.03,0.02);

    weight *= 0.55;

}

n = pow(n,1.25);    
n += fbm(uvNear * (uNoiseScale*3.5)) * 0.08;

float glow = smoothstep(0.25,0.85,n);

// ───── Fake Nebula Self Shadow ─────

// light direction
vec2 lightDir = normalize(vec2(-0.6,0.4));

// sample density along light direction
float shadow = 0.0;

for(int i=1;i<=3;i++){

    float stepSize = float(i) * 0.03;

    vec2 samplePos = uv + lightDir * stepSize;

    shadow += fbm(samplePos * uNoiseScale);

}

shadow /= 3.0;

// convert to shadow factor
float shadowFactor = smoothstep(0.4,0.9,shadow);

// apply shadow
n *= mix(1.0,0.65,shadowFactor);

vec3 colorA = vec3(0.02,0.03,0.10);
vec3 colorB = vec3(0.08,0.12,0.35);
vec3 colorC = vec3(0.35,0.55,1.0);

// subtle color drift
float hue = sin(uTime*0.05 + n*6.0);

vec3 shift1 = vec3(0.2,0.3,0.6); // blue
vec3 shift2 = vec3(0.3,0.6,0.8); // cyan
vec3 shift3 = vec3(0.4,0.2,0.7); // violet

vec3 nebulaColor = mix(shift1,shift2,hue*0.5+0.5);
nebulaColor = mix(nebulaColor,shift3,n*0.3);

vec3 col = mix(colorA,colorB,n);
col += nebulaColor * n * 0.25;

// nebula glow
col += colorC * glow * 0.35;


// ───── Volumetric Light Rays ─────

// radial distance from center
vec2 center = vec2(0.5,0.5);
float dist = length(vUv - center);

// light ray pattern
float rays = sin((vUv.x + vUv.y + uTime*0.05) * 10.0);
rays = rays * 0.5 + 0.5;

// falloff
rays *= smoothstep(0.8,0.2,dist);

// scattering strength
col += colorC * rays * 0.15;


// gamma correction
col = pow(col, vec3(0.9));

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

return mesh;

}

update(){

this.uniforms.uTime.value += 0.01;

this.uniforms.uMouse.value.lerp(this.mouse,0.05);

}

}