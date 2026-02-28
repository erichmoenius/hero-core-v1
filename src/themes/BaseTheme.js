export class BaseTheme {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = renderer.scene;
    this.camera = renderer.camera;
  }

  init() {
    // Setup scene objects
  }

  update(stateData) {
    // React to state changes
  }

  dispose() {
    // Cleanup scene
  }
}