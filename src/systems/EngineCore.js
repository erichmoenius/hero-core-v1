import * as THREE from "three";

export default class EngineCore {

    constructor() {

    console.log("ENGINE CORE CONSTRUCTED");

    this.group = new THREE.Group();

        
    // ------------------------------------------------
    // CONTAINMENT SHELL
    // ------------------------------------------------

    this.shell = new THREE.Mesh(

    new THREE.SphereGeometry(
        0.34,
        64,
        64
    ),

    new THREE.MeshPhysicalMaterial({

        color: 0x181b1f,

        metalness: 0.95,

        roughness: 0.90,

        transparent: true,

        opacity: 0.10,

        transmission: 0.10,

        depthWrite: false,

        side: THREE.DoubleSide

    })

);

    this.group.add(this.shell);

    // ------------------------------------------------
    // SINGULARITY 
    // ------------------------------------------------

    this.singularity = new THREE.Mesh(

        new THREE.SphereGeometry(
            0.065,
            32,
            32
        ),

        new THREE.MeshBasicMaterial({

        color: 0x020202

        })

    );

    // ------------------------------------------------
    // ACCRETION RING
    // ------------------------------------------------

    this.accretionRing = new THREE.Mesh(

        new THREE.TorusGeometry(

            0.45,
            0.025,
            32,
            256

    ),

    new THREE.MeshBasicMaterial({

        color: 0xffcc77,

        transparent: true,

        opacity: 0.85

    })

    );

    this.accretionRing.rotation.set(

    THREE.MathUtils.degToRad(68),

    THREE.MathUtils.degToRad(18),

    THREE.MathUtils.degToRad(12)

    );

    this.group.add(this.accretionRing);

    this.group.add(this.singularity);

    this.group.position.set(
        0.04,
        -0.03,
        0.02
    );
        
        
    //TEMPORARY DEBUG
    const axes = new THREE.AxesHelper(5);
    this.group.add(axes);

    console.log("ENGINE CORE GROUP", this.group);
    console.log("ENGINE CORE CHILDREN", this.group.children);
     

}

    update(delta) {

        const breathe =

            1 +

    Math.sin(performance.now() * 0.00045) * 0.008;

    this.shell.scale.setScalar(

        breathe

        );

    // ------------------------------------------------
    // ACCRETION RING
    // ------------------------------------------------

    if (this.accretionRing) {

        this.accretionRing.rotation.z +=
            delta * 0.6;

    }

}

    get object() {

        return this.group;

    }

}