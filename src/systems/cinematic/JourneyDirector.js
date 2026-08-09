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

import { Journey } from "./Journey";

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
    return this.activeJourney?.phase ?? "IDLE";
  }

  getJourney() {
    return this.activeJourney;
  }

  isActive() {
    return this.activeJourney !== null;
  }

  begin(journey) {
    if (!(journey instanceof Journey)) {
      throw new Error("JourneyDirector.begin() expects a Journey.");
    }

    this.activeJourney = journey;

    this.activeJourney.onEvent = (event, data) => {
      if (event === "wormhole") {
        console.log("🚨 JourneyDirector → onTransit WORMHOLE");

        this.onTransit?.("wormhole");
      }

      if (event === "void") {
        console.log("Journey event → VOID");

        this.onVoidStart?.();
      }

      if (event === "birth") {
        console.log("Journey event → BIRTH");

        this.onBirth?.();
      }

      if (event === "complete") {
        console.log("Journey event → COMPLETE");

        this.onTransitEnd?.();

        this.onJourneyFinished?.();

        this.activeJourney = null;

        this.phase = JourneyPhase.IDLE;

        this.phaseTime = 0;
      }
    };

    this.activeJourney.start();

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

    this.activeJourney.update(delta);

    if (!this.activeJourney) return;

    this.phaseTime += delta;

    console.log(
      "Journey:",
      this.activeJourney,
      "Phase:",
      this.activeJourney.phase,
      "Time:",
      this.phaseTime.toFixed(2),
    );

    if (this.phase === JourneyPhase.SINGULARITY && this.phaseTime >= 4) {
      this.phase = JourneyPhase.WORMHOLE;

      this.phaseTime = 0;

      console.log("Journey → WORMHOLE");
    }

    if (this.phase === JourneyPhase.WORMHOLE && this.phaseTime >= 4) {
      this.phase = JourneyPhase.VOID;

      this.phaseTime = 0;

      console.log("Journey → VOID");

      this.onVoidStart?.();
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
