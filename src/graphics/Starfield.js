import * as THREE from "three";

export class Starfield {

constructor(scene){

this.scene = scene;

this.material = this.createMaterial();

this.far  = this.createLayer(4000,220);
this.mid  = this.createLayer(2000,140);
this.near = this.createLayer(1000,80);

}

createMaterial(){

return new THREE.ShaderMaterial({

uniforms:{
uTime:{value:0}
},

transparent:true,
depthWrite:false,
vertexColors:true,
blending:THREE.AdditiveBlending,

vertexShader:`

varying vec3 vColor;

void main(){

vColor = color;

vec4 mvPosition = modelViewMatrix * vec4(position,1.0);

float dist = length(mvPosition.xyz);

// Stern-Größe abhängig von Entfernung
gl_PointSize = 2.5 * (200.0 / dist);

gl_Position = projectionMatrix * mvPosition;

}
`,

fragmentShader:`

uniform float uTime;
varying vec3 vColor;

void main(){

vec2 uv = gl_PointCoord - 0.5;

float d = length(uv);

// runder Stern
float star = smoothstep(0.5,0.0,d);

// Twinkle
float twinkle = sin(uTime*3.0 + gl_FragCoord.x*0.02 + gl_FragCoord.y*0.02);
twinkle = twinkle*0.5 + 0.5;

star *= mix(0.6,1.4,twinkle);

// Glow
float glow = smoothstep(0.6,0.0,d);

vec3 finalColor = vColor * star * 1.2;
finalColor += vColor * glow * 0.5;

gl_FragColor = vec4(finalColor, star);

}

`

});

}

createLayer(count,spread){

const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for(let i=0;i<count;i++){

positions[i*3]   = (Math.random()-0.5)*spread;
positions[i*3+1] = (Math.random()-0.5)*spread;
positions[i*3+2] = -Math.random()*spread;

const r = Math.random();

let color;

if(r < 0.7){
color = new THREE.Color(1,1,1);
}
else if(r < 0.85){
color = new THREE.Color(0.6,0.7,1.0);
}
else{
color = new THREE.Color(1.0,0.8,0.5);
}

colors[i*3]   = color.r;
colors[i*3+1] = color.g;
colors[i*3+2] = color.b;

}

geometry.setAttribute(
"position",
new THREE.BufferAttribute(positions,3)
);

geometry.setAttribute(
"color",
new THREE.BufferAttribute(colors,3)
);

const points = new THREE.Points(geometry,this.material);

this.scene.add(points);

return points;

}

update(){

// Parallax Bewegung
this.far.rotation.y  += 0.00001;
this.mid.rotation.y  += 0.00005;
this.near.rotation.y += 0.0002;

// Twinkle Zeit
this.material.uniforms.uTime.value += 0.02;

}

}