export default class AudioHandler {

  constructor() {
    this.ctx = null;
    this.buffer = null;
    this.source = null;

    this.analyser = null;
    this.gainNode = null;
    this.data = null;

    this.startTime = 0;
    this.pauseOffset = 0;

    // 🔥 smoothing storage
    this.smooth = {
      energy: 0,
      bass: 0,
      mid: 0,
      high: 0
    };
  }

  /* -------------------------------------------------- */
  async initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  /* -------------------------------------------------- */
  async load(fileOrUrl) {

    await this.initContext();
    this.stop(true);

    let arrayBuffer;

    if (fileOrUrl instanceof File) {
      arrayBuffer = await fileOrUrl.arrayBuffer();
    } else {
      const res = await fetch(fileOrUrl);
      arrayBuffer = await res.arrayBuffer();
    }

    this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

    if (!this.analyser) {

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;

      this.gainNode = this.ctx.createGain();

      this.data = new Uint8Array(this.analyser.frequencyBinCount);

      // source → analyser → gain → destination
      this.analyser.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
    }

    this.pauseOffset = 0;
  }

  /* -------------------------------------------------- */
  buildSource(offset = 0) {

    if (!this.buffer) return;

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;

    this.source.connect(this.analyser);

    this.startTime = this.ctx.currentTime - offset;
    this.source.start(0, offset);
  }

  /* -------------------------------------------------- */
  async play() {
    if (!this.buffer) return;
    await this.initContext();
    this.buildSource(this.pauseOffset);
  }

  /* -------------------------------------------------- */
  pause() {
    if (!this.source) return;

    this.pauseOffset = this.ctx.currentTime - this.startTime;

    try { this.source.stop(); } catch {}
    this.source.disconnect();
    this.source = null;
  }

  /* -------------------------------------------------- */
  stop(silent = false) {

    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }

    this.pauseOffset = 0;

    if (!silent)
      console.log("Audio stopped");
  }

  reset() {
    this.stop();
  }

  /* -------------------------------------------------- */
  // 🔥 SINGLE UPDATE PER FRAME
  update() {
    if (!this.analyser || !this.data) return;
    this.analyser.getByteFrequencyData(this.data);
  }

  /* -------------------------------------------------- */
  getEnergy() {

    if (!this.data) return 0;

    let sum = 0;
    for (let i = 0; i < this.data.length; i++)
      sum += this.data[i];

    let raw = (sum / this.data.length) / 255;

    // 🎬 compression (important!)
    raw = Math.pow(raw, 0.4);

    // 🎬 smoothing
    this.smooth.energy += (raw - this.smooth.energy) * 0.08;

    return this.smooth.energy;
  }

  /* -------------------------------------------------- */
  getBass() {

    if (!this.data) return 0;

    let sum = 0;
    for (let i = 0; i < 15; i++)
      sum += this.data[i];

    let raw = (sum / 15) / 255;

    this.smooth.bass += (raw - this.smooth.bass) * 0.1;

    return this.smooth.bass;
  }

  /* -------------------------------------------------- */
  getMid() {

    if (!this.data) return 0;

    let sum = 0;
    for (let i = 20; i < 80; i++)
      sum += this.data[i];

    let raw = (sum / 60) / 255;

    this.smooth.mid += (raw - this.smooth.mid) * 0.08;

    return this.smooth.mid;
  }

  /* -------------------------------------------------- */
  getHigh() {

    if (!this.data) return 0;

    let sum = 0;
    for (let i = 80; i < 200; i++)
      sum += this.data[i];

    let raw = (sum / 120) / 255;

    this.smooth.high += (raw - this.smooth.high) * 0.12;

    return this.smooth.high;
  }

}