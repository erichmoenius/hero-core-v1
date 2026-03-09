import * as THREE from "three";

export class Renderer {

  constructor(){

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias:true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.pointerEvents = "none";
    this.renderer.domElement.style.zIndex = "-1";

    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize",()=>{

      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth,window.innerHeight);

    });

  }

  render(){
    this.renderer.render(this.scene,this.camera);
  }

}