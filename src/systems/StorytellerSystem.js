import * as THREE from "three";

export default class StorytellerSystem {

    constructor() {

        this.group = new THREE.Group();
        this.group.name = "Storyteller";

        this.time = 0;
        this.rings = [];

        this.createCore();
        this.createRings();

    }

    // =====================================================
    // CORE
    // =====================================================

    createCore() {

        const geometry = new THREE.SphereGeometry(0.55, 64, 64);

        const material = new THREE.MeshPhysicalMaterial({

            color: 0x111111,

            metalness: 0.95,
            roughness: 0.18,

            clearcoat: 1.0,
            clearcoatRoughness: 0.05,

            emissive: 0x050505,
            emissiveIntensity: 0.25

        });

        this.core = new THREE.Mesh(
            geometry,
            material
        );

        this.core.castShadow = true;
        this.core.receiveShadow = true;

        this.group.add(this.core);

    }

    // =====================================================
    // RINGS
    // =====================================================

    createRings() {

        const configs = [

            {
                radius: 1.9,
                tube: 0.035,
                rotation: new THREE.Vector3(25, 0, 15),
                speed: 0.03
            },

            {
                radius: 1.45,
                tube: 0.028,
                rotation: new THREE.Vector3(-50, 35, 5),
                speed: -0.02
            },

            {
                radius: 2.35,
                tube: 0.022,
                rotation: new THREE.Vector3(75, -20, 60),
                speed: 0.015
            }

        ];

        configs.forEach(cfg => {

            const geometry = new THREE.TorusGeometry(
                cfg.radius,
                cfg.tube,
                24,
                256
            );

            const material = new THREE.MeshPhysicalMaterial({

                color: 0x3a342d,

                metalness: 1,

                roughness: 0.28,

                clearcoat: 1,

                clearcoatRoughness: 0.05,

                emissive: 0x1d1406,

                emissiveIntensity: 0.15

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

            ring.userData.speed = cfg.speed;

            this.group.add(ring);

            this.rings.push(ring);

        });

    }

    // =====================================================
    // UPDATE
    // =====================================================

    update(delta = 0.016) {

        this.time += delta;

        this.group.rotation.y += delta * 0.05;

        this.rings.forEach(ring => {

            ring.rotation.z += delta * ring.userData.speed;

        });

        const pulse = 1 + Math.sin(this.time * 0.6) * 0.01;

        this.core.scale.setScalar(pulse);

    }

    // =====================================================
    // PUBLIC
    // =====================================================

    get object() {

        return this.group;

    }

}