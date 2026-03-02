export class BaseTheme {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = renderer.scene;
    this.camera = renderer.camera;
  }

  init() {}

  update(stateData) {}

  dispose() {}
}