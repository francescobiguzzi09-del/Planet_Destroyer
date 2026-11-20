/**
 * ============================================================================
 * VOID CURSOR - PIXEL PLANET DESTROYER
 * Motore arcade spaziale interamente pixel-art con:
 * - Pianeti generati proceduralmente con strati irregolari e distruzione pixel-per-pixel
 * - Nucleo circolare perfetto che si corrode dall'interno verso l'esterno fino alla detonazione
 * - Fisica particellare con attrazione gravitazionale curva verso il cursore
 * - Sentinelle orbitali sui pianeti giganti con pattern di attacco differenti
 * - Sistema di livelli, statistiche e abilità sbloccabili
 * - Sintetizzatore audio Web Audio API (ambiente vuoto cosmico + SFX pixelati)
 * ============================================================================
 */

// ============================================================================
// 1. MOTORE AUDIO PROCEDURALE (WEB AUDIO API - NESSUN FILE ESTERNO)
// ============================================================================
class VoidAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
    this.voidGain = null;
    this.initialized = false;
    this.lastDigTime = 0;
    this.lastPickupTime = 0;
    this.pickupPitchStep = 0;
    this.ambientTimer = null;
  }

  init() {
    if (this.initialized) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.enabled ? 0.38 : 0;
      this.masterGain.connect(this.ctx.destination);

      this.startVoidAmbience();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API non disponibile:', e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.38 : 0, this.ctx.currentTime, 0.05);
    }
    return this.enabled;
  }

  /**
   * Crea una colonna sonora atmosferica morbida che ricorda il vuoto dello spazio profondo:
   * pad sub-armonico caldo filtrato + rare risonanze cristalline lontane.
   */
  startVoidAmbience() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.voidGain = this.ctx.createGain();
    this.voidGain.gain.value = 0.22;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 210;
    filter.Q.value = 1.8;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55.0; // A1

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 82.41; // E2

    const subGain2 = this.ctx.createGain();
    subGain2.gain.value = 0.25;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.09;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 75;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(subGain2);
    subGain2.connect(filter);
    filter.connect(this.voidGain);
    this.voidGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);

    const spaceNotes = [220, 261.63, 329.63, 392.00, 493.88, 523.25];
    this.ambientTimer = setInterval(() => {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      if (Math.random() > 0.65) return;

      const t = this.ctx.currentTime;
      const note = spaceNotes[Math.floor(Math.random() * spaceNotes.length)];
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      const padFilter = this.ctx.createBiquadFilter();

      padOsc.type = 'sine';
      padOsc.frequency.setValueAtTime(note, t);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(480, t);

      padGain.gain.setValueAtTime(0.0001, t);
      padGain.gain.linearRampToValueAtTime(0.055, t + 1.4);
      padGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(this.masterGain);

      padOsc.start(t);
      padOsc.stop(t + 4.6);
    }, 2800);
  }

  playShoot() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const baseFreq = 520 + (Math.random() - 0.5) * 60;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.055);

    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playDig(layerRatio = 0.5) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (t - this.lastDigTime < 0.032) return;
    this.lastDigTime = t;

    const pitch = 190 + (1 - layerRatio) * 340 + (Math.random() - 0.5) * 45;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, t + 0.065);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  playPickup() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (t - this.lastPickupTime < 0.028) return;

    if (t - this.lastPickupTime > 0.25) {
      this.pickupPitchStep = 0;
    } else {
      this.pickupPitchStep = Math.min(this.pickupPitchStep + 1, 18);
    }
    this.lastPickupTime = t;

    const freq = 380 * Math.pow(1.045, this.pickupPitchStep);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + 0.045);

    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playPlanetDestroy() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.75);

    subGain.gain.setValueAtTime(0.45, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.78);

    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(t);
    sub.stop(t + 0.8);

    const bufferSize = this.ctx.sampleRate * 0.65;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    filter.Q.value = 1.2;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.32, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start(t);

    const chimeNotes = [523.25, 659.25, 783.99, 1046.5];
    chimeNotes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + 0.08 + idx * 0.045);
      g.gain.setValueAtTime(0.08, t + 0.08 + idx * 0.045);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55 + idx * 0.045);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + 0.08 + idx * 0.045);
      osc.stop(t + 0.6 + idx * 0.045);
    });
  }

  playSentinelHit() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.08);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playPlayerDamage() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.linearRampToValueAtTime(55, t + 0.22);
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  playLevelUp() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t + i * 0.07);
      g.gain.setValueAtTime(0.11, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.22);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.24);
    });
  }

  playNova() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.35);
    g.gain.setValueAtTime(0.24, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.37);
  }
}

const audio = new VoidAudioEngine();

