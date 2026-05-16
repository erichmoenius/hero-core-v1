export class BaseTheme {

  constructor(container, app){
    this.container = container;
    this.app = app;
  }

  init(){}

  update(state){}

  updateCamera(camera, state){}

  getEnvironment(){
    return {};
  }

  destroy(){}
}