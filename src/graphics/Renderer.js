import * as THREE from "three";

export class Renderer {
  constructor() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(
      -1, 1,
      1, -1,
      0.1, 10
    );

    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    document.body.style.margin = "0";
    const root = document.getElementById("app");
    root.appendChild(this.renderer.domElement);

    root.style.position = "fixed";
    root.style.top = "0";
    root.style.left = "0";
    root.style.width = "100%";
    root.style.height = "100%";

    window.addEventListener("resize", () => this.onResize());
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}