export class Journey {
  constructor(id = "journey") {
    this.id = id;

    this.completed = false;
    this.cancelled = false;
  }

  start() {}

  update(delta) {}

  complete() {
    this.completed = true;
  }

  cancel() {
    this.cancelled = true;
  }

  emit(event, data) {
    if (this.onEvent) {
      this.onEvent(event, data);
    }
  }
}
