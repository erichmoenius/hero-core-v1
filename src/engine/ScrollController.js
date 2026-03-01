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
  if (document.getElementById("scroll-spacer")) return;

  const spacer = document.createElement("div");
  spacer.id = "scroll-spacer";
  spacer.style.height = "6000px";
  spacer.style.width = "1px";
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