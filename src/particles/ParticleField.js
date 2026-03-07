import * as THREE from "three";

export function createParticleField(N) {

  const positions = new Float32Array(N * 3);
  const hues = new Float32Array(N);

  for (let i = 0; i < N; i++) {

    const r = Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    hues[i] = (i * 0.618033) % 1;

  }

  const geometry = new THREE.BufferGeometry();

  const posAttr = new THREE.BufferAttribute(positions, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);

  geometry.setAttribute("position", posAttr);
  geometry.setAttribute("aHue", new THREE.BufferAttribute(hues, 1));

  return {
    geometry,
    positions,
    posAttr
  };

}