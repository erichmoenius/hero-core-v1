/*
------------------------------------------------------------

THE ENGINE

It was never built.

It was accumulated.

Every ring belongs to a different age.

Every repair remembers.

------------------------------------------------------------
*/

import * as THREE from "three";
export default class EngineSystem {

    constructor() {

    this.group = new THREE.Group();
    this.group.name = "Engine";

    this.time = 0;

    this.rings = [];

    // Material shared by all repair clamps

this.repairMaterial = new THREE.MeshPhysicalMaterial({

    color: 0x342d27,

    metalness: 0.90,

    roughness: 0.62,

    clearcoat: 0.15,

    clearcoatRoughness: 0.85

});

    this.createCore();

    this.createLights();

    this.createRings();

    // this.createRepairPlates();
    // this.createContainmentAssembly();

}

    // =====================================================
    // CORE
    // =====================================================

    createCore() {

        const geometry = new THREE.SphereGeometry(
            0.48,
            64,
            64
        );

        const material = new THREE.MeshPhysicalMaterial({

        color: 0x4d6485,

        metalness: 0.05,

        roughness: 1,

        clearcoat: 0,

        emissive: 0x0b1220,

        emissiveIntensity: 0.08

});

        this.core = new THREE.Mesh(
            geometry,
            material
        );

        // Slight imperfection
        this.core.position.set(
            0.04,
            -0.03,
            0.02
        );

        this.group.add(this.core);
        this.group.add(this.heart);

// ------------------------------------------------
// ENGINE HEART
// ------------------------------------------------

    const heartGeometry = new THREE.OctahedronGeometry(
    0.35
);

    const heartMaterial = new THREE.MeshPhysicalMaterial({

    color: 0xff0000,

    metalness: 0,

    roughness: 0.2,

    transparent: false,

    opacity: 1.0,

    transmission: 0.35,

    clearcoat: 0

});

this.heart = new THREE.Mesh(
    heartGeometry,
    heartMaterial
);

this.core.add(this.heart);

}

// =====================================================
// LIGHTING
// =====================================================

createLights() {

    const warm = new THREE.DirectionalLight(
        0xffc28a,
        0.45
    );

    warm.position.set(
        4,
        2,
        3
    );

    this.group.add(warm);

    const cool = new THREE.DirectionalLight(
        0x7ba8ff,
        0.25
    );

    cool.position.set(
        -3,
        -1,
        -2
    );

    this.group.add(cool);

}

    // =====================================================
    // RINGS
    // =====================================================

    createRings() {

        

                const configs = [

            {
                radius: 0.95,
                tube: 0.020,
                rotation: new THREE.Vector3(12,38,4),
                speed: 0.002
            },

            {
                radius: 1.30,
                tube: 0.030,
                rotation: new THREE.Vector3(-30,15,42),
                speed: -0.003
            },

            {
                radius: 1.90,
                tube: 0.042,
                rotation: new THREE.Vector3(25,0,15),
                speed: 0.004
            },

            {
                radius: 2.20,
                tube: 0.020,
                rotation: new THREE.Vector3(70,-18,55),
                speed: 0.002
            },

            {
                radius: 2.70,
                tube: 0.018,
                rotation: new THREE.Vector3(-48,82,5),
                speed: -0.0015
            },

            {
                radius: 3.15,
                tube: 0.010,
                rotation: new THREE.Vector3(88,22,66),
                speed: 0.001
            },

            {

                radius: 3.70,

    // Massive forged containment ring
                tube: 0.135,
                rotation: new THREE.Vector3(
                    -15,
                    110,
                    -25
    ),

                speed: 0.00035,

                segments: true
            }

        ];

        configs.forEach(cfg => {

            const geometry = new THREE.TorusGeometry(

                cfg.radius,
                cfg.tube,
                24,
                256

            );

            const age = Math.random();

let material;

if (cfg.radius === 3.70) {

    // Ancient containment alloy

material = new THREE.MeshPhysicalMaterial({

    color: new THREE.Color().setHSL(
        0.085,
        0.05,
        0.085 + age * 0.025
    ),

    metalness: 0.88,

    roughness: 0.82,

    clearcoat: 0.05,

    clearcoatRoughness: 1.0,

    emissive: 0x020101,

    emissiveIntensity: 0.003

});

} else {

    // Standard engine alloy
    material = new THREE.MeshPhysicalMaterial({

        color: new THREE.Color().setHSL(
            0.08,
            0.12,
            0.14 + age * 0.08
        ),

        metalness: 1,
        roughness: 0.18 + age * 0.35,

        clearcoat: 1,
        clearcoatRoughness: age * 0.45,

        emissive: 0x100804,
        emissiveIntensity: 0.03

    });

}

            const ring = new THREE.Mesh(
                geometry,
                material
            );

            if (cfg.radius === 3.70) {

    this.createForgeSeam(ring, 0);
    this.createForgeSeam(ring, Math.PI * 0.55);
    this.createForgeSeam(ring, Math.PI * 1.25);

}

            ring.rotation.set(

                THREE.MathUtils.degToRad(cfg.rotation.x),
                THREE.MathUtils.degToRad(cfg.rotation.y),
                THREE.MathUtils.degToRad(cfg.rotation.z)

            );

// Tiny imperfections

            ring.scale.set(

                1,

                0.97 + Math.random()*0.05,

                0.98 + Math.random()*0.04

            );

            ring.userData.speed = cfg.speed;

            this.group.add(ring);

            this.rings.push(ring);
            
            if (cfg.radius === 3.70) {

            this.createRepairPlate(ring, 0);

            this.createRepairPlate(ring, Math.PI * 0.55);

}

        });

    }

createRepairPlate(ring, angle = 0) {

    const group = new THREE.Group();

    const material = this.repairMaterial;

    const top = new THREE.Mesh(

        new THREE.BoxGeometry(
            1.45,
            0.22,
            0.16
        ),

        material

    );

    const bottom = top.clone();

    top.position.x += 0.03;
    top.position.y += 0.01;

    bottom.position.x -= 0.02;
    bottom.position.y -= 0.01;

    top.rotation.z = THREE.MathUtils.degToRad(1.5);
    bottom.rotation.z = THREE.MathUtils.degToRad(-0.8);

    group.add(top);
    group.add(bottom);

    const boltGeometry = new THREE.CylinderGeometry(

    0.045,
    0.045,
    0.42,
    16

);

const boltMaterial = new THREE.MeshPhysicalMaterial({

    color: 0x151515,

    metalness: 1,

    roughness: 0.32,

    clearcoat: 1

});

const boltPositions = [

    [-0.42, 0, 0.18],
    [ 0.42, 0, 0.18],
    [-0.42, 0,-0.18],
    [ 0.42, 0,-0.18]

];

boltPositions.forEach(pos => {

    const bolt = new THREE.Mesh(

        boltGeometry,

        boltMaterial

    );

    bolt.rotation.x = Math.PI * 0.5;

    bolt.position.set(

        pos[0],
        pos[1],
        pos[2]

    );

    group.add(bolt);

    const sleeve = new THREE.Mesh(

    new THREE.CylinderGeometry(
        0.07,
        0.07,
        0.26,
        16
    ),

    material

);

    sleeve.rotation.x = Math.PI * 0.5;

    sleeve.position.copy(bolt.position);

    group.add(sleeve);

// ------------------------------------------------
// FRONT BOLT HEAD
// ------------------------------------------------

const head = new THREE.Mesh(

    new THREE.CylinderGeometry(
        0.075,
        0.075,
        0.04,
        16
    ),

    boltMaterial

);

head.rotation.x = Math.PI * 0.5;

head.position.copy(bolt.position);

// Move to one side of the clamp
head.position.y += 0.22;

group.add(head);

// ------------------------------------------------
// BACK BOLT HEAD
// ------------------------------------------------

const backHead = head.clone();

// Move to the opposite side
backHead.position.y -= 0.44;

group.add(backHead);

});

    // TEMPORARY POSITION
    const radius = 3.70;

    group.position.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
    0
);

    group.lookAt(0, 0, 0);

    group.rotation.x = 0.04;
    group.rotation.y = -0.02;
    group.rotation.z = 0.06;

    ring.add(group);

}

createForgeSeam(ring, angle) {

    const seam = new THREE.Mesh(

        new THREE.BoxGeometry(
            0.06,
            0.18,
            0.22
        ),

        new THREE.MeshPhysicalMaterial({

            color: 0x1b1a19,

            metalness: 0.8,

            roughness: 0.9

        })

    );

    const radius = 3.70;

    seam.position.set(

        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0

    );

    seam.lookAt(0, 0, 0);

    ring.add(seam);

}

        createContainmentAssembly() {

    this.assembly = [];

    const geometry = new THREE.BoxGeometry(
        0.18,
        0.12,
        0.10
    );

    const material = new THREE.MeshPhysicalMaterial({

    color: 0x3a3632,

    metalness: 0.95,

    roughness: 0.48,

    clearcoat: 0.45,

    clearcoatRoughness: 0.65

});

    const block = new THREE.Mesh(
        geometry,
        material
    );

    block.position.set(
        3.70,
        0,
        0
    );

    this.group.add(block);

    this.assembly.push(block);

}

// =====================================================
// UPDATE
// =====================================================

    update(delta = 0.016) {

        this.time += delta;

    // ------------------------------------------------
    // CORE BREATHING
    // ------------------------------------------------    

    const breathe =

    1 +

    Math.sin(this.time * 0.45) * 0.008;

        this.core.scale.setScalar(breathe);

    // ------------------------------------------------
    // HEART
    // ------------------------------------------------

    const pulse =
    1 +
    Math.sin(this.time * 1.2) * 0.08;

    this.heart.scale.setScalar(pulse);

    this.heart.material.opacity =
    0.05 +
    Math.sin(this.time * 1.2) * 0.04;   

    this.heart.rotation.y += delta * 0.35;

    this.heart.rotation.x += delta * 0.12;

    // ------------------------------------------------
    // CORE HEARTBEAT
    // ------------------------------------------------ 

    this.core.material.emissiveIntensity =

    0.05 +

    Math.sin(this.time * 0.3) * 0.015;

    //------------------------------------------------
    // ANCIENT DRIFT
    // ------------------------------------------------
        
    this.group.rotation.y += delta * 0.003;

    this.rings.forEach((ring, index) => {

        ring.rotation.z +=
            delta * ring.userData.speed * 80;

        // Tiny independent motion
        ring.rotation.x +=      
            Math.sin(this.time*0.08 + index
                ) * 0.00002;

        });

    }

    // =====================================================
    // PUBLIC
    // =====================================================

    get object(){

        return this.group;

    }

}