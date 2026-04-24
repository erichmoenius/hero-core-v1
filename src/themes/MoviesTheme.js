import * as THREE from "three";
import { loadMovieTexture } from "../movieLoader.js";

export class MoviesTheme {

constructor(container, gui){

this.container = container;
this.gui = gui;

this.time = 0;

// SETTINGS
this.settings = {
  baseOpacity: 0.5,
  midOpacity: 0.7,
  energyOpacity: 0.2,
  motionStrength: 1,
  zoomStrength: 1.5,
  boostStrength: 1,
  audioStrength: 0.8
};

// AUDIO INPUT
this.audioInput = document.createElement("input");
this.audioInput.type = "file";
this.audioInput.accept = "audio/*";
this.audioInput.style.display = "none";
document.body.appendChild(this.audioInput);

this.audioInput.onchange = async (e)=>{
  const f=e.target.files[0];
  if(!f||!window.audio) return;
  await window.audio.load(f);
  await window.audio.play();
};

// GUI
this.initGUI();

// LAYERS
this.base = this.create("/mov/base.mp4",14,-8,this.settings.baseOpacity);
this.mid  = this.create("/mov/mid.mp4",10,-6,this.settings.midOpacity);
this.energy = this.create("/mov/energy.mp4",6,-4,this.settings.energyOpacity,true);

}

// GUI
initGUI(){

this.folder = this.gui.addFolder("🎬 Movies");

this.folder.add(this.settings,"baseOpacity",0,1,0.01);
this.folder.add(this.settings,"midOpacity",0,1,0.01);
this.folder.add(this.settings,"energyOpacity",0,1,0.01);

this.folder.add(this.settings,"motionStrength",0,2,0.01);
this.folder.add(this.settings,"zoomStrength",0,3,0.01);
this.folder.add(this.settings,"boostStrength",0,2,0.01);

this.folder.add(this.settings,"audioStrength",0,2,0.01);

const a = this.folder.addFolder("🎧 Audio");

a.add({load:()=>this.audioInput.click()},"load");
a.add({play:()=>window.audio?.play()},"play");
a.add({pause:()=>window.audio?.pause()},"pause");
a.add({resume:()=>window.audio?.resume()},"resume");

a.open();
this.folder.open();
}

// CREATE
create(path,w,z,op,add=false){

const tex = loadMovieTexture(path+"?v="+Date.now());

const mat = new THREE.MeshBasicMaterial({
  map:tex,transparent:true,opacity:op,depthWrite:false
});

if(add) mat.blending = THREE.AdditiveBlending;

const geo = new THREE.PlaneGeometry(w,w*9/16);
const mesh = new THREE.Mesh(geo,mat);

mesh.position.z = z;
this.container.add(mesh);

return {mesh,mat};
}

// UPDATE
update(state){

this.time+=0.016;

const p = state.progress||0;
const i = state.intensity||0;
const a = state.audio||{};

const s=this.settings;

// AUDIO
const energy = Math.pow(a.energy||0,0.6)*s.audioStrength;
const bass = (a.bass||0)*s.audioStrength;

// BOOST
const boost = (i + energy*2)*s.boostStrength;

// OPACITY (NOW WORKS)
this.base.mat.opacity += (s.baseOpacity*(1-boost*0.5)-this.base.mat.opacity)*0.08;
this.mid.mat.opacity  += (s.midOpacity*(1-boost*0.3)-this.mid.mat.opacity)*0.08;
this.energy.mat.opacity += (s.energyOpacity+boost-this.energy.mat.opacity)*0.08;

// MOTION
const m=s.motionStrength;

this.mid.mesh.position.x = Math.sin(this.time*0.2)*0.3*m;
this.energy.mesh.position.x = Math.sin(this.time*0.5)*0.6*m;

// DEPTH
const zoom=1+p*s.zoomStrength;

this.base.mesh.scale.setScalar(zoom);
this.mid.mesh.scale.setScalar(1.1*zoom*(1+bass));
this.energy.mesh.scale.setScalar(1.3*zoom*(1+bass*2));

}

// CLEANUP
destroy(){

this.container.remove(this.base.mesh);
this.container.remove(this.mid.mesh);
this.container.remove(this.energy.mesh);

this.base.mesh.geometry.dispose();
this.mid.mesh.geometry.dispose();
this.energy.mesh.geometry.dispose();

this.base.mat.dispose();
this.mid.mat.dispose();
this.energy.mat.dispose();

this.folder?.destroy();
}

}