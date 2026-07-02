/*
------------------------------------------------------------

THE ENGINE

It was never built.

It was accumulated.

Every repair remembers.
Every ring belongs to a different age.

The Engine is the Storyteller.

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

        color: 0x3a3530,

        metalness: 1,

        roughness: 0.28,

        clearcoat: 1,

        clearcoatRoughness: 0.12

    });

    this.createCore();
    this.createRings();
    // this.createRepairPlates();
    // this.createContainmentAssembly();

}

    // =====================================================
    // CORE
    // =====================================================

    createCore() {

        const geometry = new THREE.SphereGeometry(
            0.55,
            64,
            64
        );

        const material = new THREE.MeshPhysicalMaterial({

            color: 0x111111,

            metalness: 0.98,
            roughness: 0.16,

            clearcoat: 1,
            clearcoatRoughness: 0.04,

            emissive: 0x050505,
            emissiveIntensity: 0.18

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
                tube: 0.110,

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

            const material = new THREE.MeshPhysicalMaterial({

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

            const ring = new THREE.Mesh(
                geometry,
                material
            );

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

    this.createRepairPlate(ring);

}

        });

    }

createRepairPlate(ring) {

    const group = new THREE.Group();

    const material = this.repairMaterial;

    const top = new THREE.Mesh(

        new THREE.BoxGeometry(
            1.20,
            0.35,
            0.22
        ),

        material

    );

    const bottom = top.clone();

    top.position.z = 0.18;
    bottom.position.z = -0.18;

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
    group.position.set(
        3.70,
        0,
        0
    );

    group.rotation.x = 0.04;
    group.rotation.y = -0.02;
    group.rotation.z = 0.06;

    ring.add(group);

}

        createContainmentAssembly() {

    this.assembly = [];

    const geometry = new THREE.BoxGeometry(
        0.18,
        0.12,
        0.10
    );

    const material = new THREE.MeshPhysicalMaterial({

        color: 0x2a241f,

        metalness: 1,

        roughness: 0.32,

        clearcoat: 1,

        clearcoatRoughness: 0.12

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

        // Ancient drift
        this.group.rotation.y += delta * 0.003;

        this.rings.forEach((ring,index)=>{

            ring.rotation.z +=
                delta * ring.userData.speed * 80;

            // Tiny independent motion
            ring.rotation.x +=
                Math.sin(
                    this.time*0.08 + index
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