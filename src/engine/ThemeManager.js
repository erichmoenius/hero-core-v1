export class ThemeManager {

constructor(container){
this.container = container;
this.themes = {};
this.activeTheme = null;
}

register(name, ThemeClass){
this.themes[name] = ThemeClass;
}

activate(name){

if(!this.themes[name]) return;

// altes Theme entfernen
if(this.activeTheme && this.activeTheme.dispose){
this.activeTheme.dispose();
}

const ThemeClass = this.themes[name];

this.activeTheme = new ThemeClass(this.container);

this.activeTheme.init();

}

update(state){

if(!this.activeTheme) return;

this.activeTheme.update(state);

}

}