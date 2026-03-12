import * as THREE from "three";

export class GlassPortal {

constructor(scene, backgroundTexture){

this.uniforms = {

uTexture: { value: backgroundTexture },
uTime: { value: 0 }

};

const geometry = new THREE.PlaneGeometry(6,6);

const material = new THREE.ShaderMaterial({

uniforms: this.uniforms,

transparent: true,
depthWrite: false,

vertexShader:`

varying vec2 vUv;
varying vec3 vPos;

void main(){

vUv = uv;
vPos = position;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);

}

`,

fragmentShader:`

uniform sampler2D uTexture;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPos;

void main(){

vec2 uv = vUv;

// -------- Refraction distortion --------

vec2 distortion = vec2(
sin(uv.y*10.0 + uTime)*0.002,
cos(uv.x*10.0 + uTime)*0.002
);

vec2 refractUV = uv + distortion;


// -------- Chromatic dispersion --------

float r = texture2D(uTexture, refractUV + 0.002).r;
float g = texture2D(uTexture, refractUV).g;
float b = texture2D(uTexture, refractUV - 0.002).b;

vec3 color = vec3(r,g,b);

// cinematic light sweep (slow + wide)

float sweep = sin((uv.x + uv.y + uTime*0.10)*3.0);

sweep = smoothstep(0.7,1.0,sweep);

color += vec3(0.6,0.8,1.0) * sweep * 0.45;


// -------- Fresnel edge glow --------

float dist = length(vUv - 0.5);

float edge = smoothstep(0.35,0.55,dist);

vec3 edgeColor = vec3(0.3,0.6,1.0);

color += edgeColor * edge * 0.8;


// -------- subtle glass tint --------

color *= vec3(0.9,0.95,1.0);


// transparency stronger in center

float alpha = 0.15 + edge*0.6;

gl_FragColor = vec4(color,alpha);

}

`

});

this.mesh = new THREE.Mesh(geometry,material);

scene.add(this.mesh);

}

update(delta){

this.uniforms.uTime.value += delta;

}

}