import AudioHandler from "./AudioHandler.js";

export class AudioManager {

  constructor(){
    this.handler = new AudioHandler();

    this.state = { energy:0, bass:0, mid:0, high:0 };

    this.settings = {
      enabled: true,
      masterGain: 1,
      smoothing: 0.05,
      compression: 0.4
    };

    this._ready = false;
  }

  async load(f){
    await this.handler.load(f);
    this._ready = true;
  }

  async play(){
    if(!this._ready) return;
    await this.handler.play();
  }

  pause(){ this.handler.pause(); }
  resume(){ this.handler.play(); }

  update(){

    if(!this._ready) return;

    this.handler.update();

    const e = this.handler.getEnergy();
    const b = this.handler.getBass();
    const m = this.handler.getMid();
    const h = this.handler.getHigh();

    this.state.energy = this._p(this.state.energy, e);
    this.state.bass   = this._p(this.state.bass, b);
    this.state.mid    = this._p(this.state.mid, m);
    this.state.high   = this._p(this.state.high, h);
  }

  _p(prev,val){
    const c = Math.pow(val, this.settings.compression);
    return prev + (c-prev)*this.settings.smoothing;
  }

  getState(){
    return {
      energy: this.state.energy*this.settings.masterGain,
      bass:   this.state.bass*this.settings.masterGain,
      mid:    this.state.mid*this.settings.masterGain,
      high:   this.state.high*this.settings.masterGain
    };
  }
}