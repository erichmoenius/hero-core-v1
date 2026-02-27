import { STATES } from "../config/states.config.js";

export class StateManager {
  constructor() {
    this.currentState = null;
    this.nextState = null;
    this.blend = 0;
    this.lastStateId = null;
  }

  update(progress) {
    for (let i = 0; i < STATES.length; i++) {
      const state = STATES[i];

      if (progress >= state.start && progress <= state.end) {
        this.currentState = state;
        this.nextState = STATES[i + 1] || state;

        const range = state.end - state.start;

        this.blend = range > 0
          ? (progress - state.start) / range
          : 0;

        break;
      }
    }

    // State Change Detection
    if (this.currentState && this.currentState.id !== this.lastStateId) {
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