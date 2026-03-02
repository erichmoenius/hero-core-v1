import { STATES } from "../config/states.config.js";

export class StateManager {
  constructor() {
    this.current = null;
    this.next = null;
    this.previous = null;
    this.blend = 0;

    this.changeListeners = [];
  }

  onChange(callback) {
    this.changeListeners.push(callback);
  }

  update(progress) {
    let detectedState = null;

    for (let i = 0; i < STATES.length; i++) {
      const state = STATES[i];

      if (progress >= state.start && progress <= state.end) {
        detectedState = state.id;
        this.next = STATES[i + 1]?.id || state.id;

        const range = state.end - state.start;
        this.blend = range > 0
          ? (progress - state.start) / range
          : 0;

        break;
      }
    }

    if (detectedState && detectedState !== this.current) {
      this.previous = this.current;
      this.current = detectedState;

      this.changeListeners.forEach(callback => {
        callback({
          previous: this.previous,
          current: this.current
        });
      });
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