// =====================================================
// JOURNEY DIRECTOR
// =====================================================
//
// Hero Core Journey Director
//
// Responsibilities:
//
// • Starts cinematic journeys
// • Coordinates CameraDirector
// • Future orchestration of audio, FX and world transitions
//
// This class NEVER knows:
//
// ❌ Three.js Camera
//
// It only knows:
//
// ✔ CameraDirector
// ✔ Active Journey
//
// =====================================================

const JourneyPhase = {
  IDLE: "IDLE",
  START: "START",
  APPROACH: "APPROACH",
  HORIZON: "HORIZON",
  SINGULARITY: "SINGULARITY",
  WORMHOLE: "WORMHOLE",
  ARRIVAL: "ARRIVAL",
  RETURN: "RETURN",
};
export default class JourneyDirector {
  constructor(cameraDirector) {
    this.cameraDirector = cameraDirector;

    this.activeJourney = null;

    this.gateways = [];

    this.phase = "IDLE";
    this.phaseTime = 0;
  }

  begin(journey) {
    this.activeJourney = journey;

    this.phase = JourneyPhase.START;

    this.phaseTime = 0;

    console.log("Journey started");
  }

  addGateway(gateway) {
    this.gateways.push(gateway);
  }

  stop() {
    this.activeJourney = null;

    this.phase = "IDLE";
    this.phaseTime = 0;
  }

  isPlaying() {
    return this.activeJourney !== null;
  }

  findGateway(position) {
    for (const gateway of this.gateways) {
      if (!gateway.enabled) continue;

      if (gateway.contains(position)) {
        return gateway;
      }
    }

    return null;
  }

  setGateways(gateways) {
    this.gateways = gateways;
  }

  update(delta = 0.016) {
    if (!this.activeJourney) return;

    this.phaseTime += delta;

    if (this.phase === JourneyPhase.START && this.phaseTime >= 2) {
      this.phase = JourneyPhase.APPROACH;
      this.phaseTime = 0;

      console.log("Journey → APPROACH");
    }
  }
}
