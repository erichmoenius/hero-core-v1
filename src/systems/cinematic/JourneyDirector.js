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
  BIRTH: "BIRTH",
  RETURN: "RETURN",
  VOID: "VOID",
};
export default class JourneyDirector {
  constructor(cameraDirector) {
    this.cameraDirector = cameraDirector;

    this.activeJourney = null;

    this.gateways = [];

    this.phase = "IDLE";
    this.phaseTime = 0;
    this.onJourneyFinished = null;
  }

  getPhase() {
    return this.phase;
  }

  getJourney() {
    return this.activeJourney;
  }

  isActive() {
    return this.activeJourney !== null;
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

      console.log(
        "Gateway position:",
        gateway.position,
        "radius:",
        gateway.radius,
      );

      if (gateway.contains(position)) {
        return gateway;
      }
    }

    return null;
  }

  setGateways(gateways) {
    this.gateways = gateways;
  }

  update(cameraPosition, delta = 0.016) {
    if (!this.activeJourney) return;

    this.phaseTime += delta;

    console.log(
      "Journey:",
      this.activeJourney,
      "Phase:",
      this.phase,
      "Time:",
      this.phaseTime.toFixed(2),
    );

    if (this.phase === JourneyPhase.START && this.phaseTime >= 2) {
      this.phase = JourneyPhase.APPROACH;
      this.phaseTime = 0;

      console.log("Journey → APPROACH");
    }

    if (this.phase === JourneyPhase.APPROACH && this.phaseTime >= 3) {
      this.phase = JourneyPhase.HORIZON;

      this.phaseTime = 0;

      console.log("Journey → HORIZON");
    }

    if (this.phase === JourneyPhase.HORIZON && this.phaseTime >= 3) {
      this.phase = JourneyPhase.SINGULARITY;

      this.phaseTime = 0;

      console.log("Journey → SINGULARITY");
    }

    if (this.phase === JourneyPhase.SINGULARITY && this.phaseTime >= 4) {
      this.phase = JourneyPhase.WORMHOLE;

      this.phaseTime = 0;

      console.log("Journey → WORMHOLE");

      this.onTransit?.("wormhole");
    }

    if (this.phase === JourneyPhase.WORMHOLE && this.phaseTime >= 4) {
      this.phase = JourneyPhase.VOID;

      this.phaseTime = 0;

      console.log("Journey → VOID");

      this.onVoidStart?.();
    }

    if (this.phase === JourneyPhase.VOID && this.phaseTime >= 1) {
      this.phase = JourneyPhase.BIRTH;

      this.phaseTime = 0;

      console.log("Journey → BIRTH");

      this.onBirth?.();
    }

    if (this.phase === JourneyPhase.BIRTH && this.phaseTime >= 3) {
      this.phase = JourneyPhase.IDLE;

      this.phaseTime = 0;

      this.activeJourney = null;

      this.onTransitEnd?.();

      this.onJourneyFinished?.();

      console.log("Journey Complete → EXPLORE");
    }

    if (this.phase === JourneyPhase.RETURN && this.phaseTime >= 3) {
      this.phase = JourneyPhase.IDLE;

      this.phaseTime = 0;

      this.activeJourney = null;

      this.onTransitEnd?.();

      console.log("Journey Complete → IDLE");
    }
  }
}
