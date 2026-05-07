export default class AudioHandler {

  constructor(context) {

    this.ctx = context;

    this.buffer = null;
    this.source = null;

    this.analyser = null;
    this.gainNode = null;

    this.data = null;

    this.startTime = 0;
    this.pauseOffset = 0;

    this.isPlaying = false;
  }

  // ------------------------------------------------
  // 🔊 INIT NODES
  // ------------------------------------------------
  initNodes(){

    if(this.analyser) return;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;

    this.gainNode = this.ctx.createGain();

    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.data = new Uint8Array(
      this.analyser.frequencyBinCount
    );
  }

  // ------------------------------------------------
  // 📂 LOAD
  // ------------------------------------------------
  async load(fileOrUrl){

    this.stop(true);

    this.initNodes();

    let arrayBuffer;

    if(fileOrUrl instanceof File){

      arrayBuffer = await fileOrUrl.arrayBuffer();

    }else{

      const res = await fetch(fileOrUrl);
      arrayBuffer = await res.arrayBuffer();
    }

    this.buffer =
      await this.ctx.decodeAudioData(arrayBuffer);

    this.pauseOffset = 0;
  }

  // ------------------------------------------------
  // ▶️ BUILD SOURCE
  // ------------------------------------------------
  buildSource(offset = 0){

    if(!this.buffer) return;

    this.destroySource();

    this.source = this.ctx.createBufferSource();

    this.source.buffer = this.buffer;
    this.source.loop = true;

    this.source.connect(this.analyser);

    this.startTime =
      this.ctx.currentTime - offset;

    this.source.start(0, offset);

    this.isPlaying = true;
  }

  // ------------------------------------------------
  // ▶️ PLAY
  // ------------------------------------------------
  async play(){

    if(!this.buffer) return;

    if(this.ctx.state === "suspended"){
      await this.ctx.resume();
    }

    this.buildSource(this.pauseOffset);
  }

  // ------------------------------------------------
  // ⏸️ PAUSE
  // ------------------------------------------------
  pause(){

    if(!this.source) return;

    this.pauseOffset =
      this.ctx.currentTime - this.startTime;

    this.destroySource();

    this.isPlaying = false;
  }

  // ------------------------------------------------
  // ⏹️ STOP
  // ------------------------------------------------
  stop(silent = false){

    this.pauseOffset = 0;

    this.destroySource();

    this.isPlaying = false;

    if(!silent){
      console.log("🎧 File stopped");
    }
  }

  // ------------------------------------------------
  // 🧹 DESTROY SOURCE
  // ------------------------------------------------
  destroySource(){

    if(!this.source) return;

    try{
      this.source.stop();
    }catch{}

    try{
      this.source.disconnect();
    }catch{}

    this.source = null;
  }

  // ------------------------------------------------
  // 📊 UPDATE
  // ------------------------------------------------
  update(){

    if(!this.analyser || !this.data) return;

    this.analyser.getByteFrequencyData(this.data);
  }

}