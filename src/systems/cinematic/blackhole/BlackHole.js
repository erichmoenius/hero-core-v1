/**
 * BlackHole.js
 * ─────────────────────────────────────────────────────────────────────
 * Audio-reaktives Black Hole mit Accretion Disk für SpaceTheme.js
 *
 * Effekte:
 *   - Gravitational Lensing     — Raum-Verzerrung im Shader
 *   - Accretion Disk            — Partikel-Ring mit Doppler-Shift
 *   - Event Horizon             — dunkle Kugel mit Fresnel-Glow
 *   - Matter Jets               — Pole-Jets bei Kick
 *   - Schwarzschild-Halo        — äußerer Licht-Ring
 *
 * Audio-Mapping (AudioManager.getState()):
 *   audio.bass   → Disk-Helligkeit + Rotation-Boost
 *   audio.mid    → Jet-Intensität + Halo-Puls
 *   audio.high   → Disk-Detail + Partikel-Streuung
 *   audio.energy → Gesamthelligkeit
 *   audio.kick   → Materie-Jet Impuls
 *   audio.beat   → Rotation-Kick
 *
 * EINBINDUNG in SpaceTheme.js:
 * ─────────────────────────────────────────────────────────────────────
 *
 *   import { BlackHole } from "../systems/BlackHole.js"
 *
 *   // constructor():
 *   this.blackHole = new BlackHole(this.container)
 *   this.blackHole.setPosition(0, 0, -25)
 *   this.blackHole.addGUI(this.gui.addFolder("🕳️ Black Hole"))
 *
 *   // update():
 *   this.blackHole.update(audio, this.time)
 *
 *   // destroy():
 *   this.blackHole.destroy()
 *
 * ─────────────────────────────────────────────────────────────────────
 */

import * as THREE from "three";

// ══════════════════════════════════════════════════════════════════════
// EVENT HORIZON SHADER — dunkle Kugel mit Lensing-Glow
// ══════════════════════════════════════════════════════════════════════
const HORIZON_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main(){
  vNormal   = normalize(normalMatrix * normal);
  vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

const HORIZON_FRAG = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uEnergy;
uniform float uKickDecay;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
  vec3  V       = normalize(-vWorldPos);
  float NdotV   = max(dot(normalize(vNormal), V), 0.0);
  float fresnel = 1.0 - NdotV;
  fresnel = pow(fresnel, 2.2);

  // Gravitational lensing glow — orange/blau Doppler-Shift
  float pulse = sin(uTime * 1.8) * 0.5 + 0.5;
  float glowA = fresnel * (0.7 + uBass * 0.5 + uKickDecay * 0.3 + pulse * 0.1);

  // Doppler: eine Seite blauer (approaching), andere rötlicher (receding)
  float doppler = vWorldPos.x * 0.3;
  vec3 glowHot  = vec3(1.0,  0.55, 0.10);   // Orange/Gelb — heiß
  vec3 glowCold = vec3(0.20, 0.50, 1.00);   // Blau — kühl
  vec3 glowCol  = mix(glowCold, glowHot, clamp(doppler + 0.5, 0.0, 1.0));
  glowCol      += vec3(1.0, 0.8, 0.4) * uKickDecay * 0.4;

  // Kern: absolut schwarz — kein Licht entkommt
  vec3 col = glowCol * glowA * (0.8 + uEnergy * 0.5);

  gl_FragColor = vec4(col, glowA * 0.95);
}
`;

// ══════════════════════════════════════════════════════════════════════
// ACCRETION DISK SHADER — Partikel-Ring
// ══════════════════════════════════════════════════════════════════════
const DISK_VERT = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uEnergy;
uniform float uKickDecay;
uniform float uRotSpeed;

attribute float aRadius;
attribute float aAngle;
attribute float aOffset;
attribute float aBrightness;
attribute float aSize;

varying vec3  vColor;
varying float vAlpha;

void main(){
  float t     = uTime * uRotSpeed;

  // Keplersche Rotation: innen schneller
  float keplerSpeed = 1.0 / sqrt(max(aRadius, 0.1));
  float angle = aAngle + t * keplerSpeed * 0.8;

  // Audio: bass boosted turbulence
  float turbulence = sin(aOffset * 7.3 + t * 0.4) * 0.08
                   + cos(aOffset * 13.1 + t * 0.3) * 0.05
                   + uBass * sin(aOffset * 4.7 + t * 1.2) * 0.12;

  float r = aRadius + turbulence;

  // Disk leicht gewellt (keine perfekte Ebene)
  float warp = sin(angle * 2.0 + t * 0.2) * 0.04 * aRadius
             + uMid * sin(aOffset * 8.0 + t) * 0.06;

  vec3 pos = vec3(
    cos(angle) * r,
    warp,
    sin(angle) * r
  );

  // Doppler-Farbshift: links = blau (approaching), rechts = rot (receding)
  float doppler = cos(angle);
  vec3  hot     = vec3(1.00, 0.60, 0.15);   // heiß — Innenseite
  vec3  warm    = vec3(1.00, 0.30, 0.08);   // warm — mittel
  vec3  cool    = vec3(0.30, 0.55, 1.00);   // kühl — Außenseite
  vec3  baseCol = mix(hot, warm, smoothstep(0.5, 2.5, aRadius));
  baseCol       = mix(baseCol, cool, smoothstep(2.5, 5.0, aRadius));
  // Doppler-Shift überlagern
  baseCol = mix(baseCol, cool, clamp(-doppler * 0.5 + 0.5, 0.0, 1.0) * 0.4);
  baseCol = mix(baseCol, hot,  clamp( doppler * 0.5 + 0.5, 0.0, 1.0) * 0.3);
  // Audio-Helligkeit
  baseCol *= aBrightness * (0.7 + uEnergy * 0.8 + uBass * 0.5);
  baseCol += vec3(1.0, 0.8, 0.3) * uKickDecay * 0.3;

  vColor = baseCol;

  // Alpha: innen heller, außen subtiler
  float fadeIn  = smoothstep(0.3, 0.8, aRadius);
  float fadeOut = 1.0 - smoothstep(3.5, 5.5, aRadius);
  vAlpha = fadeIn * fadeOut * aBrightness * (0.5 + uEnergy * 0.4 + uBass * 0.3);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position  = projectionMatrix * mvPos;
  gl_PointSize = aSize * (1.5 + uBass * 1.0 + uHigh * 0.5) * (300.0 / -mvPos.z);
}
`;

const DISK_FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main(){
  // Weiches rundes Partikel
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);
  if(dist > 0.5) discard;
  float soft = 1.0 - smoothstep(0.15, 0.5, dist);
  gl_FragColor = vec4(vColor, vAlpha * soft);
}
`;

// ══════════════════════════════════════════════════════════════════════
// JET SHADER — Materie-Jets aus den Polen
// ══════════════════════════════════════════════════════════════════════
const JET_VERT = /* glsl */ `
uniform float uTime;
uniform float uMid;
uniform float uKickDecay;
uniform float uEnergy;

attribute float aT;       // 0..1 entlang des Jets
attribute float aOffset;
attribute float aSide;    // +1 oben, -1 unten

varying vec3  vColor;
varying float vAlpha;

void main(){
  float t = uTime * 0.5;

  // Jet-Expansion: breiter mit Abstand vom Zentrum
  float spread = aT * aT * 0.4;
  float angle  = aOffset * 6.28318;
  float wave   = sin(aOffset * 12.0 + t * 3.0 + aT * 8.0) * spread * 0.3;

  vec3 pos = vec3(
    cos(angle) * spread + wave,
    aSide * aT * 4.5,             // Länge entlang Y-Achse
    sin(angle) * spread + wave
  );

  // Jet-Farbe: Weiß-Blau-Violett
  vec3 colInner = vec3(0.9, 0.95, 1.0);
  vec3 colOuter = vec3(0.3, 0.2,  0.9);
  vColor = mix(colInner, colOuter, aT);
  vColor *= (0.6 + uKickDecay * 1.2 + uMid * 0.5 + uEnergy * 0.3);

  // Alpha: am Ursprung stark, verblasst nach außen
  vAlpha = (1.0 - aT) * (0.15 + uKickDecay * 0.5 + uMid * 0.2);

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position  = projectionMatrix * mvPos;
  gl_PointSize = (3.0 - aT * 2.0) * (200.0 / -mvPos.z);
}
`;

const JET_FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;
void main(){
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);
  if(dist > 0.5) discard;
  float soft = 1.0 - smoothstep(0.1, 0.5, dist);
  gl_FragColor = vec4(vColor, vAlpha * soft);
}
`;

// ══════════════════════════════════════════════════════════════════════
// SCHWARZSCHILD HALO SHADER — äußerer Licht-Ring
// ══════════════════════════════════════════════════════════════════════
const HALO_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorldPos;
void main(){
  vNormal   = normalize(normalMatrix * normal);
  vWorldPos = (modelMatrix * vec4(position,1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

const HALO_FRAG = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uEnergy;
uniform float uKickDecay;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main(){
  vec3  V     = normalize(-vWorldPos);
  float fr    = 1.0 - max(dot(normalize(vNormal), V), 0.0);
  fr = pow(fr, 1.4);

  // Photon sphere glow — sehr feiner Ring
  float ring  = smoothstep(0.55, 0.75, fr) * (1.0 - smoothstep(0.75, 0.95, fr));
  float pulse = sin(uTime * 0.9) * 0.5 + 0.5;

  float a = ring * (0.25 + uBass * 0.3 + uMid * 0.15 + uKickDecay * 0.2 + pulse * 0.08);

  // Farbe: orange/gold — Schwarzschild-Radius Photon Ring
  vec3 col = mix(
    vec3(1.0, 0.65, 0.15),
    vec3(1.0, 0.90, 0.50),
    pulse
  );
  col += vec3(0.3, 0.5, 1.0) * uMid * 0.4;

  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

// ══════════════════════════════════════════════════════════════════════
export class BlackHole {
  constructor(scene, options = {}) {
    this._scene = scene;
    this._enabled = true;
    this._kickDecay = 0.0;
    this._group = new THREE.Group();
    this._scene.add(this._group);

    this.cfg = {
      horizonRadius: 0.8,
      diskInner: 0.9,
      diskOuter: 5.5,
      diskParticles: 6000,
      jetParticles: 800,
      rotSpeed: 0.35,
      bassAmt: 1.0,
      midAmt: 1.0,
      energyAmt: 1.0,
      scale: 1.0,
      opacity: 1.0,
      ...options,
    };

    this._buildHorizon();
    this._buildHalo();
    this._buildDisk();
    this._buildJets();
  }

  // ── Event Horizon ─────────────────────────────────────────────────

  _buildHorizon() {
    this._horizonU = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uEnergy: { value: 0 },
      uKickDecay: { value: 0 },
    };
    const geo = new THREE.SphereGeometry(this.cfg.horizonRadius, 64, 64);
    const mat = new THREE.ShaderMaterial({
      vertexShader: HORIZON_VERT,
      fragmentShader: HORIZON_FRAG,
      uniforms: this._horizonU,
      transparent: true,
      depthWrite: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
    });
    this._horizon = new THREE.Mesh(geo, mat);
    this._group.add(this._horizon);

    // Schwarzer Kern (opak) — verhindert dass Disk hindurchscheint
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this._core = new THREE.Mesh(
      new THREE.SphereGeometry(this.cfg.horizonRadius * 0.96, 32, 32),
      coreMat,
    );
    this._group.add(this._core);
  }

  // ── Schwarzschild Halo ────────────────────────────────────────────

  _buildHalo() {
    this._haloU = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uEnergy: { value: 0 },
      uKickDecay: { value: 0 },
    };
    const geo = new THREE.SphereGeometry(this.cfg.horizonRadius * 2.8, 64, 64);
    const mat = new THREE.ShaderMaterial({
      vertexShader: HALO_VERT,
      fragmentShader: HALO_FRAG,
      uniforms: this._haloU,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this._halo = new THREE.Mesh(geo, mat);
    this._group.add(this._halo);
  }

  // ── Accretion Disk ────────────────────────────────────────────────

  _buildDisk() {
    const N = this.cfg.diskParticles;
    const inner = this.cfg.diskInner;
    const outer = this.cfg.diskOuter;

    const radius = new Float32Array(N);
    const angle = new Float32Array(N);
    const offset = new Float32Array(N);
    const brightness = new Float32Array(N);
    const size = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      // Mehr Partikel innen (realistisch)
      const t = Math.pow(Math.random(), 0.6);
      const r = inner + t * (outer - inner);
      radius[i] = r;
      angle[i] = Math.random() * Math.PI * 2;
      offset[i] = Math.random();
      brightness[i] = 0.3 + Math.random() * 0.7;
      // Partikel innen kleiner/heller
      size[i] = 0.8 + (1.0 - t) * 1.4 + Math.random() * 0.6;
    }

    this._diskU = {
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uEnergy: { value: 0 },
      uKickDecay: { value: 0 },
      uRotSpeed: { value: this.cfg.rotSpeed },
    };

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(N * 3), 3),
    );
    geo.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
    geo.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offset, 1));
    geo.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: DISK_VERT,
      fragmentShader: DISK_FRAG,
      uniforms: this._diskU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this._disk = new THREE.Points(geo, mat);
    // Disk leicht geneigt — realistischer
    this._disk.rotation.x = Math.PI * 0.08;
    this._group.add(this._disk);
  }

  // ── Matter Jets ───────────────────────────────────────────────────

  _buildJets() {
    const N = this.cfg.jetParticles;

    const tArr = new Float32Array(N);
    const offsetArr = new Float32Array(N);
    const sideArr = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      tArr[i] = Math.random();
      offsetArr[i] = Math.random();
      sideArr[i] = i < N / 2 ? 1.0 : -1.0;
    }

    this._jetU = {
      uTime: { value: 0 },
      uMid: { value: 0 },
      uKickDecay: { value: 0 },
      uEnergy: { value: 0 },
    };

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(N * 3), 3),
    );
    geo.setAttribute("aT", new THREE.BufferAttribute(tArr, 1));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsetArr, 1));
    geo.setAttribute("aSide", new THREE.BufferAttribute(sideArr, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: JET_VERT,
      fragmentShader: JET_FRAG,
      uniforms: this._jetU,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this._jets = new THREE.Points(geo, mat);
    this._group.add(this._jets);
  }

  // ── Public API ────────────────────────────────────────────────────

  setPosition(x, y, z) {
    this._group.position.set(x, y, z);
    return this;
  }

  enable() {
    this._enabled = true;
    this._group.visible = true;
    return this;
  }

  disable() {
    this._enabled = false;
    this._group.visible = false;
    return this;
  }

  /**
   * In SpaceTheme.js update() aufrufen:
   *   this.blackHole.update(audio, this.time)
   *
   * @param {object} audio — AudioManager.getState()
   * @param {number} time  — laufende Zeit in Sekunden
   */
  update(audio = {}, time = 0) {
    if (!this._enabled) return;

    const cfg = this.cfg;
    const bass = (audio.bass ?? 0) * cfg.bassAmt;
    const mid = (audio.mid ?? 0) * cfg.midAmt;
    const high = audio.high ?? 0;
    const energy = (audio.energy ?? 0) * cfg.energyAmt;

    // Kick Decay
    if (audio.kick) this._kickDecay = 1.0;
    this._kickDecay *= 0.88;

    // Uniforms setzen
    const allU = [this._horizonU, this._haloU, this._diskU, this._jetU];
    for (const U of allU) {
      if (U.uTime) U.uTime.value = time;
      if (U.uBass) U.uBass.value = bass;
      if (U.uMid) U.uMid.value = mid;
      if (U.uHigh) U.uHigh.value = high;
      if (U.uEnergy) U.uEnergy.value = energy;
      if (U.uKickDecay) U.uKickDecay.value = this._kickDecay;
    }

    // Rotation — Disk dreht sich, Horizon leicht
    const beatBoost = audio.beat ? 1.6 : 1.0;
    this._disk.rotation.z += (0.003 + bass * 0.008) * beatBoost;
    this._horizon.rotation.y += 0.002;
    this._halo.rotation.y -= 0.001;

    // Scale
    this._group.scale.setScalar(cfg.scale);

    // Subtle floating
    this._group.position.y += Math.sin(time * 0.2) * 0.0005;
  }

  addGUI(folder) {
    const c = this.cfg;
    folder.add(c, "scale", 0.1, 3, 0.01).name("Size");
    folder
      .add(c, "rotSpeed", 0, 2, 0.01)
      .name("Rot Speed")
      .onChange((v) => {
        this._diskU.uRotSpeed.value = v;
      });
    folder.add(c, "bassAmt", 0, 3, 0.01).name("Bass → Disk");
    folder.add(c, "midAmt", 0, 3, 0.01).name("Mid → Jets");
    folder.add(c, "energyAmt", 0, 3, 0.01).name("Energy → Glow");
    folder
      .add(this, "_enabled")
      .name("Enabled")
      .onChange((v) => (v ? this.enable() : this.disable()));
    return this;
  }

  destroy() {
    this._disk.geometry.dispose();
    this._disk.material.dispose();
    this._jets.geometry.dispose();
    this._jets.material.dispose();
    this._horizon.geometry.dispose();
    this._horizon.material.dispose();
    this._halo.geometry.dispose();
    this._halo.material.dispose();
    this._core.geometry.dispose();
    this._core.material.dispose();
    this._scene.remove(this._group);
  }
}
