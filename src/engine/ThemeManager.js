export class ThemeManager {

  constructor(container){
    this.container = container;
    this.themes = {};
    this.activeTheme = null;
    this.activeName = null;
  }

  register(name, ThemeClass){
    this.themes[name] = ThemeClass;
  }

  activate(name){

    // ❌ gleiches Theme blocken
    if(this.activeName === name) return;

    if(!this.themes[name]) return;

    // ------------------------------------------------
    // 🔥 HARD RESET CONTAINER (WICHTIG!)
    // ------------------------------------------------

    while(this.container.children.length > 0){
      const obj = this.container.children[0];
      this.container.remove(obj);
    }

    // ------------------------------------------------
    // 🔥 CLEANUP (optional zusätzlich)
    // ------------------------------------------------

    if(this.activeTheme && this.activeTheme.destroy){
      this.activeTheme.destroy();
    }

    // ------------------------------------------------
    // NEW THEME
    // ------------------------------------------------

    const ThemeClass = this.themes[name];
    this.activeTheme = new ThemeClass(this.container);
    this.activeName = name;

    if(this.activeTheme.init){
      this.activeTheme.init();
    }

    console.log("Theme activated:", name);
  }

  update(state){

    if(!this.activeTheme) return;

    if(this.activeTheme.update){
      this.activeTheme.update(state);
    }

  }

}