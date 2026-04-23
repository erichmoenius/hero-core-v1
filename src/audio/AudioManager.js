import AudioHandler from "./AudioHandler.js";

export class AudioManager {

  constructor(){

    // ---------- CORE ----------
    this.handler = new AudioHandler();

    // ---------- STATE ----------
    this.state = {
      energy: 0,
      bass: 0,
      mid: 0,
      high: 0
    };

    // ---------- SETTINGS ----------
    this.settings = {
      enabled: true,
      masterGain: 1.0,
      smoothing: 0.05,   // balanced (not too laggy)
      compression: 0.4   // boosts low signals nicely
    };

    // ---------- INTERNAL ----------
    this._ready = false;
    this._hasData = false;
  }

  /* -------------------------------------------------- */
  // 🎬 LOAD
  async load(fileOrUrl){

    try{
      await this.handler.load(fileOrUrl);
      this._ready = true;
      console.log("🎧 Audio loaded");
    }catch(e){
      console.error("Audio load failed:", e);
    }

  }

  /* -------------------------------------------------- */
  // ▶️ PLAY
  async play(){

    if(!this._ready) return;

    try{
      await this.handler.initContext();
      await this.handler.play();
    }catch(e){
      console.error("Audio play failed:", e);
    }

  }

  /* -------------------------------------------------- */
  pause(){
    this.handler.pause();
  }

  /* -------------------------------------------------- */
  async resume(){

    if(!this._ready) return;

    try{
      await this.handler.initContext();
      await this.handler.play();
    }catch(e){
      console.error("Audio resume failed:", e);
    }

  }

  /* -------------------------------------------------- */
  stop(){
    this.handler.stop();
  }

  /* -------------------------------------------------- */
  // 🔄 UPDATE (called every frame)
  update(){

    if(!this.settings.enabled || !this._ready) return;

    this.handler.update();

    const rawEnergy = this.handler.getEnergy();
    const rawBass   = this.handler.getBass();
    const rawMid    = this.handler.getMid();
    const rawHigh   = this.handler.getHigh();

    // detect if signal exists
    this._hasData = rawEnergy > 0.001;

    // ---------- PROCESS ----------
    this.state.energy = this._process(this.state.energy, rawEnergy);
    this.state.bass   = this._process(this.state.bass, rawBass);
    this.state.mid    = this._process(this.state.mid, rawMid);
    this.state.high   = this._process(this.state.high, rawHigh);

  }

  /* -------------------------------------------------- */
  // 🎛️ INTERNAL SIGNAL PROCESSING
  _process(prev, value){

    // compression → boosts low signals, reduces spikes
    const compressed = Math.pow(value, this.settings.compression);

    // smoothing → cinematic motion
    return prev + (compressed - prev) * this.settings.smoothing;

  }

  /* -------------------------------------------------- */
  // 📦 PUBLIC STATE
  getState(){

    if(!this._hasData){
      return {
        energy: 0,
        bass: 0,
        mid: 0,
        high: 0
      };
    }

    return {
      energy: this.state.energy * this.settings.masterGain,
      bass:   this.state.bass   * this.settings.masterGain,
      mid:    this.state.mid    * this.settings.masterGain,
      high:   this.state.high   * this.settings.masterGain
    };

  }

  /* -------------------------------------------------- */
  // 🎛️ CONTROL API
  setEnabled(v){
    this.settings.enabled = v;
  }

  setGain(v){
    this.settings.masterGain = v;
  }

  setSmoothing(v){
    this.settings.smoothing = v;
  }

  setCompression(v){
    this.settings.compression = v;
  }

  /* -------------------------------------------------- */
  // 📊 STATUS
  isActive(){
    return this._hasData;
  }

}