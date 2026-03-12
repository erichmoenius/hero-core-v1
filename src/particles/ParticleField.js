import * as THREE from "three";

export function createParticleField(N){

const positions = new Float32Array(N * 3);
const hues = new Float32Array(N);

// galaxy parameters
const radius = 6;
const arms = 3;
const spin = 1.5;

for(let i=0;i<N;i++){

const r = Math.random() * 6;

const angle = r * 1.5;

const armOffset = (i % 3) / 3 * Math.PI * 2;

const spiralAngle = angle + armOffset;

// mehr Raumtiefe
const spread = (Math.random() - 0.5) * 1.5;

positions[i*3] = Math.cos(spiralAngle) * r + spread;
positions[i*3+1] = (Math.random() - 0.5) * 2.5; // vertikale Tiefe
positions[i*3+2] = Math.sin(spiralAngle) * r + spread;

hues[i] = (i * 0.618033) % 1;

}

const geometry = new THREE.BufferGeometry();

const posAttr = new THREE.BufferAttribute(positions,3);
posAttr.setUsage(THREE.DynamicDrawUsage);

geometry.setAttribute("position",posAttr);
geometry.setAttribute("aHue",new THREE.BufferAttribute(hues,1));

return {
geometry,
positions,
posAttr
};

}