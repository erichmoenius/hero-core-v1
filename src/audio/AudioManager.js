// src/audio/AudioManager.js

export default class AudioManager {

  constructor() {

    // ------------------------------------------------
    // CORE
    // ------------------------------------------------

    this.audioContext = null;

    this.analyser = null;
    this.dataArray = null;

    this.source = null;
    this.stream = null;

    this.prevBass = 0;
    this.kickCooldown = 0;

    // ------------------------------------------------
    // DEVICES
    // ------------------------------------------------

    this.selectedDeviceId = null;
    this.devices = [];

    // ------------------------------------------------
    // SETTINGS
    // ------------------------------------------------

    this.fftSize = 2048;
    this.smoothing = 0.85;
  }

  // ------------------------------------------------
  // INIT
  // ------------------------------------------------

  async init() {

    try {

      // --------------------------------------------
      // AUDIO CONTEXT
      // --------------------------------------------

      if (!this.audioContext) {

        this.audioContext =
          new (window.AudioContext || window.webkitAudioContext)();
      }

      // --------------------------------------------
      // RESUME CONTEXT
      // --------------------------------------------

      if (this.audioContext.state === "suspended") {

        await this.audioContext.resume();
      }

      // --------------------------------------------
      // ANALYSER
      // --------------------------------------------

      this.analyser = this.audioContext.createAnalyser();

      this.analyser.fftSize = this.fftSize;

      this.analyser.smoothingTimeConstant =
        this.smoothing;

      this.dataArray = new Uint8Array(
        this.analyser.frequencyBinCount
      );

      // --------------------------------------------
      // GET DEVICES
      // --------------------------------------------

      await this.getAudioDevices();

      console.log("DEVICES FOUND:", this.devices.length);

      // --------------------------------------------
// AUTO SELECT VOICEMEETER
// --------------------------------------------

this.autoSelectVoicemeeter();

console.log(
  "DEVICES FOUND:",
  this.devices.length
);

      // --------------------------------------------
      // START LIVE INPUT
      // --------------------------------------------

      await this.startLiveInput();

      console.log("🎧 AudioManager initialized.");

    } catch (error) {

      console.error(
        "❌ AudioManager init failed:",
        error
      );
    }
  }

  // ------------------------------------------------
  // GET AUDIO DEVICES
  // ------------------------------------------------

  async getAudioDevices() {

    try {

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      this.devices = devices.filter(
        d => d.kind === "audioinput"
      );

      console.log("🎧 AUDIO INPUT DEVICES:");
      console.table(this.devices);

      this.devices.forEach(device => {

        console.log(device.label);

      });

      return this.devices;

    } catch (error) {

      console.error(
        "❌ Failed to get audio devices:",
        error
      );

      return [];
    }
  }

  // ------------------------------------------------
  // AUTO SELECT VOICEMEETER
  // ------------------------------------------------

  autoSelectVoicemeeter() {

    const priorities = [

      "out b1",
      "voicemeeter output",
      "aux output",
      "voicemeeter"

    ];

    let found = null;

    for (const priority of priorities) {

      found = this.devices.find(device =>

        device.label
          .toLowerCase()
          .includes(priority)

      );

      if (found) break;
    }

    if (found) {

      this.selectedDeviceId = found.deviceId;

      console.log("✅ Selected Audio Device:");
      console.log(found.label);

    } else {

      console.warn(
        "⚠ No Voicemeeter device found."
      );
    }
  }

  // ------------------------------------------------
  // SET DEVICE MANUALLY
  // ------------------------------------------------

  setDevice(deviceId) {

    this.selectedDeviceId = deviceId;

    console.log("🎧 Device manually set:");
    console.log(deviceId);
  }

  // ------------------------------------------------
  // START LIVE INPUT
  // ------------------------------------------------

  async startLiveInput() {

    try {

      // --------------------------------------------
      // STOP OLD STREAM
      // --------------------------------------------

      this.stopLiveInput();

      // --------------------------------------------
      // RESUME CONTEXT
      // --------------------------------------------

      if (
        this.audioContext &&
        this.audioContext.state === "suspended"
      ) {

        await this.audioContext.resume();
      }

      // --------------------------------------------
      // GET USER MEDIA
      // --------------------------------------------

      this.stream =
        await navigator.mediaDevices.getUserMedia({

          audio: {

            deviceId: this.selectedDeviceId
              ? { exact: this.selectedDeviceId }
              : undefined,

            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false

          }

        });

      // --------------------------------------------
      // CREATE SOURCE
      // --------------------------------------------

      this.source =
        this.audioContext.createMediaStreamSource(
          this.stream
        );

      // --------------------------------------------
      // CONNECT TO ANALYSER
      // --------------------------------------------

      this.source.connect(this.analyser);

      console.log(
  "TRACK SETTINGS:",
  this.stream.getAudioTracks()[0].getSettings()
);

console.log(
  "TRACK LABEL:",
  this.stream.getAudioTracks()[0].label
);

      console.log("🎵 Live audio connected.");

    } catch (error) {

      console.error(
        "❌ Live input failed:",
        error
      );
    }
  }

  // ------------------------------------------------
  // STOP LIVE INPUT
  // ------------------------------------------------

  stopLiveInput() {

    try {

      // --------------------------------------------
      // DISCONNECT SOURCE
      // --------------------------------------------

      if (this.source) {

        this.source.disconnect();
        this.source = null;
      }

      // --------------------------------------------
      // STOP TRACKS
      // --------------------------------------------

      if (this.stream) {

        this.stream
          .getTracks()
          .forEach(track => {

            track.stop();

          });

        this.stream = null;
      }

      console.log("🛑 Live input stopped.");

    } catch (error) {

      console.error(
        "❌ Failed stopping stream:",
        error
      );
    }
  }

  // ------------------------------------------------
  // GET FREQUENCY DATA
  // ------------------------------------------------

  getFrequencyData() {

    if (
      !this.analyser ||
      !this.dataArray
    ) {

      return null;
    }

    this.analyser.getByteFrequencyData(
      this.dataArray
    );

    return this.dataArray;
  }

  // ------------------------------------------------
  // GET AVERAGE ENERGY
  // ------------------------------------------------

  getAverageEnergy(start = 0, end = 64) {

    if (!this.dataArray) return 0;

    let sum = 0;

    for (let i = start; i < end; i++) {

      sum += this.dataArray[i];
    }

    return sum / (end - start) / 255;
  }

  // ------------------------------------------------
  // GET STATE
  // ------------------------------------------------

  getState() {

    // update FFT

    this.getFrequencyData();

    // bands

    const bass =
      this.getAverageEnergy(0, 16);

    const mid =
      this.getAverageEnergy(16, 64);

    const high =
      this.getAverageEnergy(64, 128);

    // combined energy

    const energy =
      (bass + mid + high) / 3;

    // 🔥 cooldown timer
this.kickCooldown =
  Math.max(
    0,
    this.kickCooldown - 1
  );

const kick =
  this.kickCooldown === 0 &&
  bass > this.prevBass + 0.003;

if(kick){

  this.kickCooldown = 8;

}

this.prevBass = bass;  

    return {

      bass,
      mid,
      high,
      energy,
      kick

    };
  }

  // ------------------------------------------------
  // DESTROY
  // ------------------------------------------------

  destroy() {

    this.stopLiveInput();

    if (this.audioContext) {

      this.audioContext.close();
      this.audioContext = null;
    }

    console.log("🔥 AudioManager destroyed.");
  }
}