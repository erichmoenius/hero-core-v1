import * as THREE from "three";
import AudioHandler from "./AudioHandler.js";

export class AudioManager {

constructor(){

// ------------------------------------------------
// 🔥 ONE CONTEXT ONLY
// ------------------------------------------------

this.context =
  new (window.AudioContext ||
   window.webkitAudioContext)();


// ------------------------------------------------
// 🎧 FILE HANDLER
// ------------------------------------------------

this.handler =
  new AudioHandler(this.context);


// ------------------------------------------------
// 🎤 LIVE
// ------------------------------------------------

this.stream = null;
this.liveSource = null;
this.liveAnalyser = null;


// ------------------------------------------------
// ⚙️ STATE
// ------------------------------------------------

this.mode = "file";

this._ready = false;

this.freqData = null;

this.adaptive = {

  energyMax: 0.25,

  bassMax: 0.20,

  midMax: 0.20,

  highMax: 0.20

};

this.state = {

  energy: 0,
  bass: 0,
  mid: 0,
  high: 0,

  // 🔥 beat events
  beat: false,
  kick: false,
  snare: false
};


// ------------------------------------------------
// ⚙️ SETTINGS
// ------------------------------------------------

this.settings = {

  enabled: true,

  smoothing: 0.82,

  beatThreshold: 0.24,
  kickThreshold: 0.32,
  snareThreshold: 0.20
};

}

// ------------------------------------------------
// 🎧 FILE MODE
// ------------------------------------------------
async switchToFile(){

  // ------------------------------------------------
  // 🛑 FULL LIVE RESET
  // ------------------------------------------------

  this.stopLive();

  // ------------------------------------------------
  // 🎧 FILE MODE
  // ------------------------------------------------

  this.mode = "file";

  this._ready = true;

  console.log("🎧 FILE MODE");

}

// ------------------------------------------------
// 🎤 LIVE MODE
// ------------------------------------------------
async switchToLive(){

  this.stopLive();

  await this.stopFile();

  this.handler.pauseOffset = 0;

  this.handler.buffer = null;

  this.mode = "live";

try{

  this.stream =
    await navigator.mediaDevices.getUserMedia({
      audio: true
    });

  this.liveSource =
    this.context.createMediaStreamSource(
      this.stream
    );

  this.liveAnalyser =

  this.context.createAnalyser();

  this.liveAnalyser.fftSize = 2048;

  this.liveAnalyser.smoothingTimeConstant = 0.85;

  this.liveSource.connect(this.liveAnalyser);

  this._ready = true;

  console.log("🎤 LIVE MODE");

}catch(e){

  console.error(e);
}

}


// ------------------------------------------------
// 📂 LOAD FILE
// ------------------------------------------------
async load(file){

await this.switchToFile();

await this.handler.load(file);

}


// ------------------------------------------------
// ▶️ PLAY
// ------------------------------------------------
play(){

if(this.mode !== "file") return;

this.handler.play();

}


// ------------------------------------------------
// ⏸️ PAUSE
// ------------------------------------------------
pause(){

if(this.mode !== "file") return;

this.handler.pause();

}


// ------------------------------------------------
// 🔁 RESUME
// ------------------------------------------------
resume(){

if(this.mode !== "file") return;

this.handler.play();

}


// ------------------------------------------------
// ⏹️ STOP FILE
// ------------------------------------------------
async stopFile(){

this.handler.stop(true);

this.handler.buffer = null;

}


// ------------------------------------------------
// ⏹️ STOP LIVE
// ------------------------------------------------
stopLive(){

  // ------------------------------------------------
  // 🎤 STOP STREAM TRACKS
  // ------------------------------------------------

  if(this.stream){

    this.stream
      .getTracks()
      .forEach(track => {

        track.stop();

      });

    this.stream = null;

  }

  // ------------------------------------------------
  // 🎤 DISCONNECT SOURCE
  // ------------------------------------------------

  if(this.liveSource){

    try{

      this.liveSource.disconnect();

    }catch{}

    this.liveSource = null;

  }

  // ------------------------------------------------
  // 🎤 DISCONNECT ANALYSER
  // ------------------------------------------------

  if(this.liveAnalyser){

    try{

      this.liveAnalyser.disconnect();

    }catch{}

    this.liveAnalyser = null;

  }

  // ------------------------------------------------
  // 🧹 CLEAR FFT BUFFER
  // ------------------------------------------------

  this.freqData = null;

}


// ------------------------------------------------
// ⏹️ STOP ALL
// ------------------------------------------------
stop(){

this.stopFile();

this.stopLive();

this._ready = false;

}


// ------------------------------------------------
// 🔄 UPDATE
// ------------------------------------------------
update(){

if(!this.settings.enabled) return;

const analyser =
  this.mode === "file"
    ? this.handler.analyser
    : this.liveAnalyser;

if(!analyser) return;

if(

  !this.freqData ||

  this.freqData.length !==

  analyser.frequencyBinCount

){

  this.freqData =

    new Uint8Array(

      analyser.frequencyBinCount

    );

}

analyser.getByteFrequencyData(
  this.freqData
);

const energyRaw =

  this._getEnergy();

const energy =

  this._normalize(

    energyRaw,

    "energyMax"

  );

const bassRaw =

  this._getRange(
    0.0,
    0.08
  );

const bass =

  this._normalize(
    bassRaw,
    "bassMax"
  );

const midRaw =

  this._getRange(
    0.08,
    0.35
  );

const mid =

  this._normalize(
    midRaw,
    "midMax"
  );

const highRaw =

  this._getRange(
    0.35,
    1.0
  );

const high =

  this._normalize(
    highRaw,
    "highMax"
  );

 
// ------------------------------------------------
// 🔥 SMOOTH
// ------------------------------------------------

this.state.energy =
  this._smooth(this.state.energy, energy);

this.state.bass =
  this._smooth(this.state.bass, bass);

this.state.mid =
  this._smooth(this.state.mid, mid);

this.state.high =
  this._smooth(this.state.high, high);


// ------------------------------------------------
// ⚡ EVENT BEATS
// ------------------------------------------------

this.state.beat =
  bass > this.settings.beatThreshold;

this.state.kick =
  bass > this.settings.kickThreshold;

this.state.snare =
  mid > this.settings.snareThreshold;

}


// ------------------------------------------------
// 📊 ANALYSIS
// ------------------------------------------------
_getEnergy(){

  const data = this.freqData;

  let sum = 0;

  for(let i=0;i<data.length;i++){

    sum += data[i];

  }

  return (sum / data.length) / 255;

}

_getRange(start, end){

  const data = this.freqData;

  const len = data.length;

  const s = Math.floor(len * start);

  const e = Math.floor(len * end);

  let sum = 0;

  for(let i=s;i<e;i++){

    sum += data[i];

  }

  return (sum / (e - s)) / 255;

}

_normalize(value, key){

  // ------------------------------------------------
  // 🌊 ADAPTIVE MAX
  // ------------------------------------------------

  this.adaptive[key] =

    Math.max(

      value,

      this.adaptive[key] * 0.995

    );

  // ------------------------------------------------
  // ⚡ NORMALIZE
  // ------------------------------------------------

  return THREE.MathUtils.clamp(

    value /

    (this.adaptive[key] + 0.0001),

    0,

    1

  );

}

_smooth(prev, next){

return (
  prev * this.settings.smoothing +
  next * (1 - this.settings.smoothing)
);

}


// ------------------------------------------------
// 📦 STATE
// ------------------------------------------------
getState(){

return this.state;

}

}