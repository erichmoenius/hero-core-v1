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
  }

  begin(journey) {
    this.activeJourney = journey;
  }

  stop() {
    this.activeJourney = null;
  }

  isPlaying() {
    return this.activeJourney !== null;
  }

  update(delta = 0.016) {
    if (!this.activeJourney) return;
  }
}
