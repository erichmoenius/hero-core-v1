import { STATES } from "../config/states.config.js";

export class StateManager {
  constructor() {
    this.current = null;
    this.next = null;
    this.blend = 0;
  }

  update(progress) {
    for (let i = 0; i < STATES.length; i++) {
      const state = STATES[i];

      if (progress >= state.start && progress <= state.end) {
        this.current = state.id;
        this.next = STATES[i + 1]?.id || state.id;

        const range = state.end - state.start;
        this.blend = range > 0
          ? (progress - state.start) / range
          : 0;

        break;
      }
    }
  }

  get() {
    return {
      current: this.current,
      next: this.next,
      blend: this.blend
    };
  }
}