import { CameraPose } from "./CameraPose";

export class Flight {
  constructor() {
    this.startPose = new CameraPose();
    this.targetPose = new CameraPose();

    this.duration = 0;
    this.elapsed = 0;

    this.active = false;
  }
}
