import { MouseTrail } from "./MouseTrail.js";
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

    this.activeInteraction = null;

    // ------------------------------------------------
    // 🧩 INTERACTIONS
    // ------------------------------------------------

    this.interactions = {

      off: null,

      trail:
        new MouseTrail(
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
    // 🛑 SAFE STARTUP
    // ------------------------------------------------

    Object.values(this.interactions).forEach(
      interaction => {

        interaction?.disable?.();

      }
    );

    // ------------------------------------------------
    // 🎛️ GUI SETTINGS
    // ------------------------------------------------

    this.settings = {

      mode: "off"

    };

    // ------------------------------------------------
    // 🎛️ GUI
    // ------------------------------------------------

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
        "🖱️ Interactions"
      );

    folder.add(

      this.settings,

      "mode",

      {

        Off: "off",

        Trail: "trail",

        Fibonacci: "fibonacci",

        Gravity: "gravity"

      }

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
    // ⛔ DISABLE CURRENT
    // ------------------------------------------------

    if(this.activeInteraction){

      this.activeInteraction.disable();

    }

    // ------------------------------------------------
    // 🎯 UPDATE MODE
    // ------------------------------------------------

    this.mode = mode;

    this.settings.mode = mode;

    // ------------------------------------------------
    // 🌌 ACTIVATE NEW
    // ------------------------------------------------

    this.activeInteraction =
      this.interactions[mode] || null;

    if(this.activeInteraction){

      this.activeInteraction.enable();

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

    if(!this.activeInteraction) return;

    this.activeInteraction.update(

      mouse,

      audio,

      time

    );

  }

  // ------------------------------------------------
  // 🎨 STYLE
  // ------------------------------------------------

  setStyle(style){

    if(!this.activeInteraction) return;

    if(this.activeInteraction.setStyle){

      this.activeInteraction.setStyle(style);

    }

  }

  // ------------------------------------------------
  // 🧹 DESTROY
  // ------------------------------------------------

  destroy(){

    Object.values(this.interactions).forEach(
      interaction => {

        interaction?.destroy?.();

      }
    );

  }

}