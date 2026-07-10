import * as THREE from "three";

export default class EngineCore {
  constructor() {
    console.log("ENGINE CORE CONSTRUCTED");

    this.group = new THREE.Group();

    this.time = 0;

    // ------------------------------------------------
    // CONTAINMENT SHELL
    // ------------------------------------------------

    this.shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 64, 64),

      new THREE.MeshPhysicalMaterial({
        color: 0x181b1f,

        metalness: 0.95,

        roughness: 0.9,

        transparent: true,

        opacity: 0.1,

        transmission: 0.1,

        depthWrite: false,

        side: THREE.DoubleSide,
      }),
    );

    this.group.add(this.shell);

    // ------------------------------------------------
    // SINGULARITY
    // ------------------------------------------------

    this.singularity = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 48, 48),

      new THREE.MeshBasicMaterial({
        color: 0x020202,
      }),
    );

    // ------------------------------------------------
    // ACCRETION RING
    // ------------------------------------------------

    this.accretionRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.02, 24, 192),

      new THREE.MeshStandardMaterial({
        color: 0xc89a45,

        emissive: 0x7a5418,

        emissiveIntensity: 0.12,

        metalness: 0.65,

        roughness: 0.45,

        transparent: true,

        opacity: 0.85,
      }),
    );

    this.accretionRing.rotation.set(
      THREE.MathUtils.degToRad(68),

      THREE.MathUtils.degToRad(18),

      THREE.MathUtils.degToRad(12),
    );

    this.accretionRing.position.z = 0.015;

    this.group.add(this.accretionRing);

    // ------------------------------------------------
    // RING IMPERFECTION
    // ------------------------------------------------

    this.accretionRing.scale.set(
      1.0,

      0.985,

      1.015,
    );

    // ------------------------------------------------
    // ORBIT PARTICLES
    // ------------------------------------------------

    this.orbitParticles = [];

    for (let i = 0; i < 60; i++) {
      const size = 0.015 + Math.random() * 0.015;

      let geometry;

      const shape = Math.random();

      if (shape < 0.7) {
        // Most particles = rough dust

        geometry = new THREE.IcosahedronGeometry(
          size,

          0,
        );
      } else if (shape < 0.9) {
        // Some particles = larger fragments

        geometry = new THREE.DodecahedronGeometry(
          size * 1.15,

          0,
        );
      } else {
        // Rare particles = dense nuggets

        geometry = new THREE.OctahedronGeometry(
          size * 0.85,

          0,
        );
      }

      const family = Math.random();

      let color;

      if (family < 0.25) {
        color = 0xfff3d1; // White-gold

        // Inner dust
      } else if (family < 0.8) {
        color = 0xe6bf67; // Ancient gold

        // Main disk
      } else {
        color = 0x8d6b3f; // Bronze

        // Outer dust
      }

      const material = new THREE.MeshBasicMaterial({
        color: color,
      });

      const particle = new THREE.Mesh(
        geometry,

        material,
      );

      let radius;

      const cluster = Math.random() < 0.35;

      if (family < 0.25) {
        // Inner dust

        radius = 0.18 + Math.random() * 0.1;
      } else if (family < 0.8) {
        // Main accretion disk

        radius =
          (cluster ? 0.36 : 0.32) + Math.random() * (cluster ? 0.08 : 0.18);
      } else {
        // Outer drifting dust

        radius = 0.6 + Math.random() * 0.35;
      }

      particle.userData = {
        angle: Math.random() * Math.PI * 2,

        radius: 0.32 + Math.random() * 0.35,

        speed:
          THREE.MathUtils.lerp(
            0.9,

            0.2,

            (radius - 0.32) / 0.35,
          ) +
          Math.random() * 0.05,

        height:
          family > 0.8
            ? (Math.random() - 0.5) * 0.3
            : (Math.random() - 0.5) * (0.04 + Math.random() * 0.1),

        drift: Math.random() * Math.PI * 2,

        driftSpeed: 0.15 + Math.random() * 0.2,

        driftAmount: 0.015 + Math.random() * 0.02,
      };

      this.group.add(particle);

      this.orbitParticles.push(particle);
    }

    this.group.add(this.singularity);

    // ------------------------------------------------
    // INNER CORE
    // ------------------------------------------------

    this.innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.045,

        32,

        32,
      ),

      new THREE.MeshBasicMaterial({
        color: 0x000000,
      }),
    );

    this.group.add(this.innerCore);

    this.group.position.set(0.04, -0.03, 0.02);

    // ------------------------------------------------
    // EVENT HORIZON
    // ------------------------------------------------

    this.eventHorizon = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.15,

        32,

        32,
      ),

      new THREE.MeshPhysicalMaterial({
        color: 0x040404,

        transparent: true,

        opacity: 0.1,

        transmission: 0.0,

        metalness: 0.0,

        roughness: 0.55,

        clearcoat: 1.0,

        depthWrite: false,
      }),
    );

    this.group.add(this.eventHorizon);

    // ------------------------------------------------
    // PHOTON ARC
    // ------------------------------------------------

    const arcGeometry = new THREE.TorusGeometry(
      0.115, // radius

      0.0025, // thickness

      8,

      64,

      Math.PI * 0.22, // about 40°
    );

    const arcMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe8b5,

      emissive: 0xc79b4a,

      emissiveIntensity: 0.08,

      metalness: 0.2,

      roughness: 0.8,

      transparent: true,

      opacity: 0.7,
    });

    this.photonArc = new THREE.Mesh(
      arcGeometry,

      arcMaterial,
    );

    this.photonArc.rotation.x = THREE.MathUtils.degToRad(68);

    this.group.add(this.photonArc);

    // ------------------------------------------------
    // DEVELOPMENT SCALE
    // ------------------------------------------------

    this.group.scale.setScalar(3);

    // ------------------------------------------------
    // DEVELOPMENT ORIENTATION
    // ------------------------------------------------

    this.group.rotation.set(
      THREE.MathUtils.degToRad(-12),

      THREE.MathUtils.degToRad(18),

      THREE.MathUtils.degToRad(8),
    );

    //TEMPORARY DEBUG
    const axes = new THREE.AxesHelper(5);
    this.group.add(axes);

    console.log("ENGINE CORE GROUP", this.group);
    console.log("ENGINE CORE CHILDREN", this.group.children);
  }

  update(delta) {
    this.time += delta;

    const breathe = 1 + Math.sin(this.time * 0.45) * 0.008;

    this.shell.scale.setScalar(breathe);

    // ------------------------------------------------
    // EVENT HORIZON
    // ------------------------------------------------

    if (this.eventHorizon) {
      const horizonScale = 1 + Math.sin(this.time * 0.28) * 0.015;

      this.eventHorizon.scale.setScalar(horizonScale);
    }

    this.eventHorizon.material.opacity =
      0.16 + Math.sin(this.time * 0.22) * 0.02;

    // ------------------------------------------------
    // ACCRETION RING
    // ------------------------------------------------

    if (this.accretionRing) {
      this.accretionRing.rotation.z += delta * 0.45;

      this.accretionRing.position.x = Math.sin(this.time * 0.18) * 0.003;

      this.accretionRing.position.y = Math.cos(this.time * 0.14) * 0.002;

      this.accretionRing.rotation.x =
        THREE.MathUtils.degToRad(68) + Math.sin(this.time * 0.25) * 0.02;

      this.accretionRing.rotation.y =
        THREE.MathUtils.degToRad(18) + Math.cos(this.time * 0.18) * 0.015;

      this.accretionRing.material.emissiveIntensity =
        0.12 + Math.sin(this.time * 0.35) * 0.02;

      // ------------------------------------------------
      // PHOTON ARC
      // ------------------------------------------------

      if (this.photonArc) {
        this.photonArc.rotation.z += delta * 0.2;
      }

      if (this.orbitParticles) {
        this.orbitParticles.forEach((particle) => {
          particle.userData.angle += delta * particle.userData.speed;

          const animatedRadius =
            particle.userData.radius +
            Math.sin(
              this.time * particle.userData.driftSpeed +
                particle.userData.drift,
            ) *
              particle.userData.driftAmount;

          particle.position.set(
            Math.cos(particle.userData.angle) * animatedRadius,

            particle.userData.height,

            Math.sin(particle.userData.angle) * animatedRadius,
          );
        });
      }
    }
  }

  get object() {
    return this.group;
  }
}
