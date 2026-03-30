import * as THREE from "three";

export class Renderer {

  constructor(){

    // ------------------------------------------------
    // SCENE + CAMERA
    // ------------------------------------------------

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.camera.position.set(0, 0, 5);


    // ------------------------------------------------
    // WEBGL RENDERER
    // ------------------------------------------------

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    // ------------------------------------------------
    // RENDER TARGET (für Portal)
    // ------------------------------------------------

    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );


    // ------------------------------------------------
    // CANVAS SETUP
    // ------------------------------------------------

    const canvas = this.renderer.domElement;

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "auto";
    canvas.style.zIndex = "0";

    document.body.appendChild(canvas);


    // ------------------------------------------------
    // RESIZE
    // ------------------------------------------------

    window.addEventListener("resize", () => {

      const w = window.innerWidth;
      const h = window.innerHeight;

      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(w, h);
      this.renderTarget.setSize(w, h);

    });

  }


  // ------------------------------------------------
  // RENDER PIPELINE
  // ------------------------------------------------

  render(){

    // PASS 1 → Scene in Texture (ohne Portal)
    if(this.portal) this.portal.mesh.visible = false;

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);


    // PASS 2 → normale Szene
    if(this.portal) this.portal.mesh.visible = true;

    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);

  }

}