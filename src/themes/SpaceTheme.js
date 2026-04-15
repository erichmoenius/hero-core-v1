import * as THREE from "three";

export class SpaceTheme {

constructor(container){

  this.container = container;
  this.time = 0;
  this.velocity = 0;

  // ---------------- STAR LAYERS ----------------
  // unterschiedliche Tiefe + Größen für echtes Parallax

  this.far  = this.createLayer(1500, 40, 0.015, 0x6688ff);
  this.mid  = this.createLayer(1000, 20, 0.03,  0xffffff);
  this.near = this.createLayer(600,  10, 0.05,  0xffaa55);

}


// ---------------- CREATE LAYER ----------------

createLayer(count, depth, size, color){

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for(let i = 0; i < count; i++){

    const i3 = i * 3;

    positions[i3 + 0] = (Math.random() - 0.5) * 40;
    positions[i3 + 1] = (Math.random() - 0.5) * 40;

    // 🔥 symmetrische Tiefe → kein collapsing mehr
    positions[i3 + 2] = (Math.random() - 0.5) * depth;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    size,
    color,
    transparent: true,
    opacity: 0.15,          // 🔥 FIX: kein Nebel mehr
    depthWrite: false,
    depthTest: true,        // 🔥 FIX: verhindert Layer-Fog
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);

  this.container.add(points);

  return {
    points,
    depth,
    baseSize: size
  };

}


// ---------------- UPDATE ----------------

update(state){

  this.time += 0.016;

  const p = state.progress ?? 0;
  const i = state.intensity ?? 0;


  // ------------------------------------------------
  // 🚀 VELOCITY SYSTEM (smooth + cinematic)
  // ------------------------------------------------

  // Richtung durch Scroll
  const targetSpeed = (p - 0.5) * 20;

  // smoothing (kein Ruckeln)
  this.velocity += (targetSpeed - this.velocity) * 0.08;

  // damping (stabil)
  this.velocity *= 0.96;

  // boost (LMB)
  this.velocity += i * 0.6;

  const forward = this.velocity;


  // ------------------------------------------------
  // 🌌 PARALLAX (echte Tiefe)
  // ------------------------------------------------

  this.updateLayer(this.far,  forward * 0.2);
  this.updateLayer(this.mid,  forward * 0.6);
  this.updateLayer(this.near, forward * 1.4);


  // ------------------------------------------------
  // 🌫️ DEPTH ATMOSPHERE (subtle!)
  // ------------------------------------------------

  const fog = 0.85 + Math.sin(this.time * 0.3) * 0.1;

  this.far.points.material.opacity  = 0.10 * fog;
  this.mid.points.material.opacity  = 0.18 * fog;
  this.near.points.material.opacity = 0.25 * fog;


  // ------------------------------------------------
  // ✨ LIGHT PULSE (nur near layer)
  // ------------------------------------------------

  const pulse = 1 + Math.sin(this.time * 2.0) * 0.05;
  this.near.points.material.size = this.near.baseSize * pulse;

}


// ---------------- LAYER UPDATE ----------------

updateLayer(layer, speed){

  const pos = layer.points.geometry.attributes.position;
  const depth = layer.depth;

  for(let i = 0; i < pos.count; i++){

    let z = pos.getZ(i);

    // leichte Variation → natürlicher Flow
    const variance = 0.6 + Math.sin(i * 12.9898) * 0.4;

    z += speed * 0.02 * variance;

    // 🔥 echtes Infinite Space (Wrap)
    if(z > depth * 0.5) z -= depth;
    if(z < -depth * 0.5) z += depth;

    pos.setZ(i, z);
  }

  pos.needsUpdate = true;

}


// ---------------- CLEANUP ----------------

destroy(){

  [this.far, this.mid, this.near].forEach(layer => {

    this.container.remove(layer.points);

    layer.points.geometry.dispose();
    layer.points.material.dispose();

  });

}

}