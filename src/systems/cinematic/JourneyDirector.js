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

export default class JourneyDirector {
  constructor(cameraDirector) {
    this.cameraDirector = cameraDirector;

    this.activeJourney = null;

    this.gateways = [];
  }

  begin(journey) {
    this.activeJourney = journey;
  }

  addGateway(gateway) {
    this.gateways.push(gateway);
  }

  stop() {
    this.activeJourney = null;
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
  }
}
