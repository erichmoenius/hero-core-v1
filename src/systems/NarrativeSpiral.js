import * as THREE from "three";

export class NarrativeSpiral {

  constructor(scene){

  this.scene = scene;

  this.group = new THREE.Group();

  this.group.name = "NarrativeSpiral";

  this.scene.add(this.group);

  this.lines = [];

  this.nodes = [];

  this.createSpiral();

}

  createSpiral(){

    const count = 120;

    for(let i = 0; i < count; i++){

      const arm = i % 2;

const angle =
  i * 0.25 +
  arm * Math.PI;

const radius =

  Math.pow(i, 1.1) * 0.02;

const x =
  Math.cos(angle) * radius;

const y =

  Math.sin(angle) *

  radius *

  0.55;

      const size =
        0.015 +
        Math.random() * 0.04;

      const geo =
        new THREE.SphereGeometry(
          size,
          8,
          8
      );

      const brightness =
  0.6 +
  Math.random() * 0.4;

const color =
  new THREE.Color(
    brightness,
    brightness * 0.85,
    brightness * 0.45
  );

const mat =
  new THREE.MeshBasicMaterial({

    color

  });

      const sphere =
        new THREE.Mesh(
          geo,
          mat
        );

const glowGeo =
  new THREE.SphereGeometry(
    size * 2.5,
    8,
    8
  );

const glowMat =
  new THREE.MeshBasicMaterial({

    color: 0xffd86b,

    transparent: true,

    opacity: 0.20

  });

const glow =
  new THREE.Mesh(
    glowGeo,
    glowMat
  );        

      sphere.position.set(
  x,
  y,
  0
);

glow.position.copy(
  sphere.position
);

this.group.add(
  glow
);

this.group.add(
  sphere
);

this.nodes.push(
  sphere
);

}

console.log(
  "Narrative nodes:",
  this.nodes.length
);

for(let i = 0; i < this.nodes.length - 4; i++){

  const a = this.nodes[i];

  const b = this.nodes[i + 4];

  const points = [

    a.position,

    b.position

  ];

  const geo =
    new THREE.BufferGeometry()
      .setFromPoints(points);

  const mat =
    new THREE.LineBasicMaterial({

      color: 0xffd86b,

      transparent: true,

      opacity: 0.02

    });

  const line =
    new THREE.Line(
      geo,
      mat
    );

  // this.group.add(
  //   line
  // );

  this.lines.push(
    line
  );

}

this.group.position.set(

  4.5,

  1.0,

  -8

);

this.group.scale.setScalar(2.0); 


this.group.rotation.x = 0.35;
this.group.rotation.y = -0.15;

  }

  update(delta = 0.016, audio = {}){

  if(!this.time){

    this.time = 0;

  }

  const energy =

    audio.energy || 0;

  this.time += delta;

  // slow storyteller rotation

  this.group.rotation.z +=

    0.00005 +

    energy * 0.0005;

  // breathing

  const breath =

    1 +

    Math.sin(

      this.time * 0.5

    ) * 0.05 +

    energy * 1.0;

  this.group.scale.setScalar(

    breath

  );

  // communication v1

  for(const line of this.lines){

    line.material.opacity =

      0.02 +

      energy * 0.15;

  }

}

  destroy(){

    this.scene.remove(this.group);

  }

}