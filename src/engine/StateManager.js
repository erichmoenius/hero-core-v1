import { STATES } from "../config/states.config.js";

export class StateManager {
  constructor() {
    this.currentState = null;
    this.nextState = null;
    this.blend = 0;
    this.lastStateId = null;
  }

  update(progress) {
    // harte mathematische State-Berechnung
    const index = Math.min(
      Math.floor(progress * STATES.length),
      STATES.length - 1
    );

    this.currentState = STATES[index];
    this.nextState = STATES[index + 1] || STATES[index];

    const stateStart = this.currentState.start;
    const stateEnd = this.currentState.end;
    const range = stateEnd - stateStart;

    let rawBlend = range > 0
      ? (progress - stateStart) / range
      : 0;

    this.blend = Math.min(Math.max(rawBlend, 0), 1);

    if (this.currentState.id !== this.lastStateId) {
      console.log("STATE CHANGE:", this.currentState.id);
      this.lastStateId = this.currentState.id;
    }
  }

  getStateData() {
    return {
      current: this.currentState?.id,
      next: this.nextState?.id,
      blend: this.blend
    };
  }
}