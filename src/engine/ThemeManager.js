export class ThemeManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.themes = {};
    this.activeTheme = null;
  }

  register(name, ThemeClass) {
    this.themes[name] = ThemeClass;
  }

  activate(name) {
    if (!this.themes[name]) {
      console.warn(`Theme "${name}" not registered.`);
      return;
    }

    if (this.activeTheme) {
      this.activeTheme.dispose();
    }

    const ThemeClass = this.themes[name];
    this.activeTheme = new ThemeClass(this.renderer);
    this.activeTheme.init();
  }

  update(stateData) {
  console.log("ThemeManager update:", stateData);

  if (this.activeTheme) {
    this.activeTheme.update(stateData);
  } else {
    console.log("NO ACTIVE THEME");
  }
}
}