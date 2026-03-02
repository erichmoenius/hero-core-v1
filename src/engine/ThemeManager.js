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
    if (!this.themes[name]) return;

    if (this.activeTheme && this.activeTheme.dispose) {
      this.activeTheme.dispose();
    }

    const ThemeClass = this.themes[name];
    this.activeTheme = new ThemeClass(this.renderer);
    this.activeTheme.init();
  }

  update(stateData) {
    if (!this.activeTheme) return;
    this.activeTheme.update(stateData);
  }
}