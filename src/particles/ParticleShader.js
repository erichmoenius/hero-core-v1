import * as THREE from "three"

export function createParticleMaterial(){

return new THREE.ShaderMaterial({

uniforms:{
uTime:{value:0},
uScale:{value:1},
uMouseX:{value:0},
uMouseY:{value:0}
},

vertexShader:`
attribute float aHue;

uniform float uTime;
uniform float uScale;
uniform float uMouseX;
uniform float uMouseY;

varying float vHue;

void main(){

vec3 pos = position;

pos.x += uMouseX * pos.z * 0.12;
pos.y += uMouseY * pos.z * 0.08;

vHue = aHue;

vec4 mv = modelViewMatrix * vec4(pos,1.0);

float dist = length(pos);

gl_PointSize = 4.0;

gl_Position = projectionMatrix * mv;

}
`,

fragmentShader:`

uniform float uTime;
varying float vHue;

void main(){

float d = length(gl_PointCoord - 0.5);

if(d>0.5) discard;

float glow = smoothstep(0.5,0.0,d);

vec3 col = vec3(0.3,0.6,1.0);

gl_FragColor = vec4(col*glow,glow);

}
`,

transparent:true,
blending:THREE.AdditiveBlending,
depthWrite:false

})

}