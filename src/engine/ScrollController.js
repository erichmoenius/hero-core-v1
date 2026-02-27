export class ScrollController {
  constructor() {
    this.progress = 0;
    this.maxScroll = 1;

    this.createScrollSpace();
    this.updateScroll();

    window.addEventListener("scroll", () => this.updateScroll());
    window.addEventListener("resize", () => this.updateScroll());
  }

  createScrollSpace() {
    const scrollHeight = 4000; // später dynamisch
    const spacer = document.createElement("div");
    spacer.style.height = `${scrollHeight}px`;
    document.body.appendChild(spacer);
  }

  updateScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    this.progress = docHeight > 0 ? scrollTop / docHeight : 0;
    this.progress = Math.min(Math.max(this.progress, 0), 1);
  }

  getProgress() {
    return this.progress;
  }
}