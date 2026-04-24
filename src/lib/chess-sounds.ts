// Chess sound effects using Web Audio API — premium wooden board feel.
// The goal is dry, weighty, realistic contact: lacquered wooden pieces
// landing on a hardwood board with felt underneath. No arcade beeps,
// no synthetic melodic cues.
let audioCtx: AudioContext | null = null;
let outputBus: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
const noiseBufferCache = new Map<number, AudioBuffer>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitter(value: number, amount = 0.04) {
  return value * (1 + (Math.random() * 2 - 1) * amount);
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext({ latencyHint: "interactive" });
  }

  if (audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => undefined);
  }

  return audioCtx;
}

function getOutputBus(ctx: AudioContext) {
  if (!outputBus || !compressor) {
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(2.5, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.12, ctx.currentTime);

    outputBus = ctx.createGain();
    outputBus.gain.setValueAtTime(0.92, ctx.currentTime);

    outputBus.connect(compressor);
    compressor.connect(ctx.destination);
  }

  return outputBus;
}

function getNoiseBuffer(ctx: AudioContext, duration: number) {
  const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const cached = noiseBufferCache.get(size);
  if (cached) return cached;

  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;

  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.045 * white) / 1.045;
    const t = i / size;
    const envelope = Math.pow(1 - t, 1.7);
    data[i] = clamp((white * 0.42 + brown * 1.15) * envelope, -1, 1);
  }

  noiseBufferCache.set(size, buffer);
  return buffer;
}

type BoardImpactOptions = {
  time?: number;
  strength?: number;
  weight?: number;
  hardness?: number;
  resonance?: number;
  damp?: number;
};

function playBoardImpact(options: BoardImpactOptions = {}) {
  const ctx = getCtx();
  const bus = getOutputBus(ctx);
  const time = options.time ?? ctx.currentTime;
  const strength = clamp(options.strength ?? 1, 0.4, 1.7);
  const weight = clamp(options.weight ?? 1, 0.65, 1.5);
  const hardness = clamp(options.hardness ?? 1, 0.6, 1.5);
  const resonance = clamp(options.resonance ?? 1, 0.55, 1.5);
  const damp = clamp(options.damp ?? 1, 0.75, 1.5);

  const noiseDuration = 0.035 + damp * 0.028;
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx, noiseDuration);

  const master = ctx.createGain();
  master.gain.setValueAtTime(strength, time);
  master.connect(bus);

  const transientFilter = ctx.createBiquadFilter();
  transientFilter.type = "bandpass";
  transientFilter.frequency.setValueAtTime(jitter(2150 * hardness, 0.08), time);
  transientFilter.Q.setValueAtTime(1.1 + hardness * 0.9, time);

  const transientHighpass = ctx.createBiquadFilter();
  transientHighpass.type = "highpass";
  transientHighpass.frequency.setValueAtTime(700 + hardness * 180, time);

  const transientGain = ctx.createGain();
  transientGain.gain.setValueAtTime(0.0001, time);
  transientGain.gain.exponentialRampToValueAtTime(0.06 * hardness * strength, time + 0.0025);
  transientGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.028 + damp * 0.01);

  source.connect(transientHighpass);
  transientHighpass.connect(transientFilter);
  transientFilter.connect(transientGain);
  transientGain.connect(master);

  const modeDefinitions = [
    { freq: 180, q: 6.2, gain: 0.23, decay: 0.16 },
    { freq: 360, q: 7.5, gain: 0.18, decay: 0.19 },
    { freq: 720, q: 8.8, gain: 0.11, decay: 0.17 },
    { freq: 1180, q: 9.6, gain: 0.07, decay: 0.13 },
  ];

  for (const mode of modeDefinitions) {
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(jitter(mode.freq * (0.94 + weight * 0.06), 0.035), time);
    filter.Q.setValueAtTime(mode.q, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(mode.gain * resonance * strength, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + mode.decay * damp);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
  }

  const bodyOsc = ctx.createOscillator();
  bodyOsc.type = "sine";
  bodyOsc.frequency.setValueAtTime(jitter(132 / weight, 0.025), time);
  bodyOsc.frequency.exponentialRampToValueAtTime(jitter(92 / weight, 0.02), time + 0.075);

  const bodyLowpass = ctx.createBiquadFilter();
  bodyLowpass.type = "lowpass";
  bodyLowpass.frequency.setValueAtTime(240, time);

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.0001, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.034 * weight * strength, time + 0.006);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.085 + damp * 0.01);

  bodyOsc.connect(bodyLowpass);
  bodyLowpass.connect(bodyGain);
  bodyGain.connect(master);

  source.start(time);
  source.stop(time + noiseDuration + 0.03);
  bodyOsc.start(time);
  bodyOsc.stop(time + 0.11 + damp * 0.02);
}

export function playMoveSound() {
  playBoardImpact({
    strength: 0.95,
    weight: 0.96,
    hardness: 0.92,
    resonance: 0.88,
    damp: 0.95,
  });
}

export function playCaptureSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  playBoardImpact({
    time: now,
    strength: 1.08,
    weight: 1.15,
    hardness: 0.88,
    resonance: 1.02,
    damp: 1.02,
  });

  playBoardImpact({
    time: now + 0.052,
    strength: 0.86,
    weight: 0.92,
    hardness: 0.96,
    resonance: 0.82,
    damp: 0.9,
  });
}

export function playCheckSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  playBoardImpact({
    time: now,
    strength: 1.12,
    weight: 1.08,
    hardness: 1.08,
    resonance: 1.06,
    damp: 1,
  });

  playBoardImpact({
    time: now + 0.09,
    strength: 0.68,
    weight: 1.2,
    hardness: 0.72,
    resonance: 1.15,
    damp: 1.2,
  });
}

export function playGameOverSound() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  playBoardImpact({
    time: now,
    strength: 1.18,
    weight: 1.22,
    hardness: 0.92,
    resonance: 1.18,
    damp: 1.24,
  });

  playBoardImpact({
    time: now + 0.15,
    strength: 0.92,
    weight: 1.1,
    hardness: 0.82,
    resonance: 1.08,
    damp: 1.26,
  });

  playBoardImpact({
    time: now + 0.34,
    strength: 1.06,
    weight: 1.28,
    hardness: 0.74,
    resonance: 1.22,
    damp: 1.38,
  });
}

export function playGameStartSound() {
  playBoardImpact({
    strength: 1,
    weight: 1.04,
    hardness: 0.98,
    resonance: 0.94,
    damp: 1,
  });
}

export type MoveSound = "move" | "capture" | "check" | "gameOver" | "start";

export function playChessSound(type: MoveSound) {
  try {
    switch (type) {
      case "move":
        playMoveSound();
        break;
      case "capture":
        playCaptureSound();
        break;
      case "check":
        playCheckSound();
        break;
      case "gameOver":
        playGameOverSound();
        break;
      case "start":
        playGameStartSound();
        break;
    }
  } catch {
    // Audio not available — fail silently
  }
}
