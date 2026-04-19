export class ThemeManager {

constructor(container, gui){

this.container = container;
this.gui = gui;

this.themes = new Map();
this.activeTheme = null;

}


// ---------- REGISTER ----------
register(name, ThemeClass){
this.themes.set(name, ThemeClass);
}


// ---------- ACTIVATE ----------
activate(name){

const ThemeClass = this.themes.get(name);
if(!ThemeClass){
  console.warn("Theme not found:", name);
  return;
}

// 🔥 destroy old theme
if(this.activeTheme){

  if(this.activeTheme.destroy){
    this.activeTheme.destroy();
  }

  this.activeTheme = null;
}

// 🔥 create new theme WITH GUI
this.activeTheme = new ThemeClass(
  this.container,
  this.gui
);

}


// ---------- UPDATE ----------
update(state){

if(!this.activeTheme) return;

if(this.activeTheme.update){
  this.activeTheme.update(state);
}

}

}