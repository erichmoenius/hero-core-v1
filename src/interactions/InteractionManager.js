import { MouseTrailSystem } from "./MouseTrailSystem.js";

import { FibonacciPresence } from "./FibonacciPresence.js";

import { GravityField } from "./GravityField.js";


export class InteractionManager {

constructor(container, gui = null){

this.container = container;

this.gui = gui;


// ------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------

this.mode = "off";

this.activeSystem = null;


// ------------------------------------------------
// 🧩 SYSTEMS
// ------------------------------------------------

this.systems = {

  off: null,

  trail:
    new MouseTrailSystem(
      this.container
    ),

  fibonacci:
    new FibonacciPresence(
      this.container
    ),

  gravity:
    new GravityField(
      this.container
    )

};


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------

this.settings = {

  mode: "off"

};

if(this.gui){

  this.setupGUI();

}

}


// ------------------------------------------------
// 🎛️ GUI
// ------------------------------------------------

setupGUI(){

const folder =
  this.gui.addFolder(
    "🖱️ Interaction"
  );

folder.add(

  this.settings,

  "mode",

  [
    "off",
    "trail",
    "fibonacci",
    "gravity"
  ]

).onChange((value)=>{

  this.setMode(value);

});

folder.open();

}


// ------------------------------------------------
// 🔄 SET MODE
// ------------------------------------------------

setMode(mode = "off"){

if(this.mode === mode) return;


// ------------------------------------------------
// ⛔ DISABLE OLD
// ------------------------------------------------

if(this.activeSystem){

  this.activeSystem.disable();

}


// ------------------------------------------------
// 🎯 UPDATE MODE
// ------------------------------------------------

this.mode = mode;

this.settings.mode = mode;


// ------------------------------------------------
// 🌌 ACTIVATE
// ------------------------------------------------

this.activeSystem =
  this.systems[mode] || null;

if(this.activeSystem){

  this.activeSystem.enable();

}


// ------------------------------------------------
// 📝 DEBUG
// ------------------------------------------------

console.log(
  `🎛️ Interaction Mode: ${mode}`
);

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------

update(mouse, audio, time){

if(!this.activeSystem) return;

this.activeSystem.update(
  mouse,
  audio,
  time
);

}


// ------------------------------------------------
// 🎨 STYLE
// ------------------------------------------------

setStyle(style){

if(!this.activeSystem) return;

if(this.activeSystem.setStyle){

  this.activeSystem.setStyle(style);

}

}


// ------------------------------------------------
// 🧹 DESTROY
// ------------------------------------------------

destroy(){

Object.values(this.systems).forEach(system => {

  if(system?.destroy){

    system.destroy();

  }

});

}

}