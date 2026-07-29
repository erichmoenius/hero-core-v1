import { Flight } from "./Flight";

export class FlightSystem {
  constructor() {
    this.flight = null;

    this.onFinished = null;
  }

  createFlight() {
    return new Flight();
  }

  start(flight) {
    this.flight = flight;

    this.flight.active = true;
  }

  stop() {
    if (!this.flight) return;

    this.flight.active = false;
    this.flight = null;
  }

  update(delta) {
    if (!this.flight) return;

    this.flight.elapsed += delta;

    if (this.flight.elapsed >= this.flight.duration) {
      this.stop();

      if (this.onFinished) {
        this.onFinished();
      }
    }
  }

  getProgress() {
    if (!this.flight) return 0;

    if (this.flight.duration <= 0) return 1;

    return Math.min(this.flight.elapsed / this.flight.duration, 1);
  }
}
