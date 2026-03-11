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


// WebGL renderer
this.renderer = new THREE.WebGLRenderer({ antialias:true });


// RenderTarget für Refraction
this.renderTarget = new THREE.WebGLRenderTarget(
window.innerWidth,
window.innerHeight
);


// Canvas setup
this.renderer.setSize(window.innerWidth, window.innerHeight);

this.renderer.domElement.style.position = "fixed";
this.renderer.domElement.style.top = "0";
this.renderer.domElement.style.left = "0";
this.renderer.domElement.style.width = "100%";
this.renderer.domElement.style.height = "100%";
this.renderer.domElement.style.pointerEvents = "none";
this.renderer.domElement.style.zIndex = "-1";

document.body.appendChild(this.renderer.domElement);


// Resize
window.addEventListener("resize",()=>{

this.camera.aspect = window.innerWidth / window.innerHeight;
this.camera.updateProjectionMatrix();

this.renderer.setSize(window.innerWidth,window.innerHeight);

this.renderTarget.setSize(
window.innerWidth,
window.innerHeight
);

});

}

render(){

// Portal ausblenden
if(this.portal) this.portal.mesh.visible = false;


// PASS 1 → Scene ohne Portal
this.renderer.setRenderTarget(this.renderTarget);
this.renderer.clear();
this.renderer.render(this.scene,this.camera);


// Portal wieder sichtbar
if(this.portal) this.portal.mesh.visible = true;


// PASS 2 → Scene normal rendern
this.renderer.setRenderTarget(null);
this.renderer.render(this.scene,this.camera);

}
}