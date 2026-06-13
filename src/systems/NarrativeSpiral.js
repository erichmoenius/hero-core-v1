import * as THREE from "three";

export class NarrativeSpiral {

  constructor(scene){

    this.scene = scene;

    this.group = new THREE.Group();

    this.group.name = "NarrativeSpiral";

    this.scene.add(this.group);

    this.lines = [];

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
  i * 0.025;

const x =
  Math.cos(angle) * radius;

const y =
  Math.sin(angle) * radius;

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

    opacity: 0.08

  });

//for(let i = 0; i < this.group.children.length - 1; i++){

  //const a = this.group.children[i];
  //const b = this.group.children[i + 1];

  //const points = [

    //a.position,
    //b.position

  //];

  //const geo =
    //new THREE.BufferGeometry()
      //.setFromPoints(points);

  //const mat =
    //new THREE.LineBasicMaterial({

      //color: 0xffd86b,

      //transparent: true,

      //opacity: 0.15

    //});

  //const line =
    //new THREE.Line(
      //geo,
      //mat
    //);

  //this.group.add(line);

  //this.lines.push(line);

//}  

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

    }

    this.group.position.set(
      3.2,
      1.0,
      -8
    );
  

  }

  update(delta = 0.016){

  if(!this.time){

    this.time = 0;

  }

  this.time += delta;

  // slow storyteller rotation

  this.group.rotation.z += 0.0005;

  // breathing

  const breath =

    1 +

    Math.sin(
      this.time * 0.5
    ) * 0.05;

  this.group.scale.setScalar(
    breath
  );

}

  destroy(){

    this.scene.remove(this.group);

  }

}