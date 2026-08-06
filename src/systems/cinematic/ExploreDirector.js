export const ExploreMode = {
  FREE: "FREE",

  FOCUS: "FOCUS",

  INSPECT: "INSPECT",

  INVITATION: "INVITATION",
};

export class ExploreDirector {
  constructor(cameraDirector) {
    this.cameraDirector = cameraDirector;

    this.mode = ExploreMode.FREE;
    this.currentObject = null;
    this.lastObject = null;
  }

  update(delta) {
    switch (this.mode) {
      case ExploreMode.FREE:
        this.updateFree(delta);
        break;

      case ExploreMode.FOCUS:
        break;

      case ExploreMode.INSPECT:
        break;

      case ExploreMode.INVITATION:
        break;
    }
  }

  updateFree(delta) {
    this.updateNavigation(delta);

    this.updateDiscovery(delta);

    this.updateInteraction(delta);
  }

  updateDiscovery(delta) {
    this.findExplorableObjects(delta);
  }

  findExplorableObjects(delta) {
    if (!this.theme) {
      this.currentObject = null;
      return;
    }

    const objects = this.theme.getExplorableObjects();

    this.currentObject = objects.length > 0 ? objects[0] : null;

    //TEMP DEBUGGING
    if (this.currentObject !== this.lastObject) {
      this.lastObject = this.currentObject;

      console.log("Exploring:", this.currentObject);
    }
  }

  updateInteraction(delta) {}

  updateNavigation(delta) {
    this.updateMouseLook(delta);

    this.updateWheel(delta);

    this.updateIdleMotion(delta);
  }

  updateMouseLook(delta) {
    // Camera steering lives here.
  }

  updateWheel(delta) {
    // Forward/backward exploration lives here.
  }

  updateIdleMotion(delta) {
    // Breathing motion lives here.
  }

  setMode(mode) {
    if (this.mode === mode) return;

    this.mode = mode;

    console.log("EXPLORE →", mode);
  }

  /*
   * EXPLORE
   *
   * Freely navigate a living universe until something
   * invites you to experience it.
   *
   * Navigation
   * - Free Flight
   * - Mouse Look
   * - Wheel Travel
   * - Idle Motion
   *
   * Discovery
   * - Object Discovery
   * - Object Inspection
   * - Gateway Detection
   *
   * Interaction
   * - Engine Invitation
   * - LMB Accept Journey
   */
}
