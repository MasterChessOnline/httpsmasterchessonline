// Realistic chess board sounds — using actual recorded wooden piece samples.
// Loaded from /public/sounds and routed through a Web Audio graph that adds
// low-end body, gentle saturation and a soft compressor so every hit feels
// warm, weighty and emotionally present (not a dry click).
//
// Sound packs colour-shift the same source samples via per-pack pitch + filter
// + body settings so users can pick "Wood", "Marble", "Neon" etc. without
// shipping eight copies of every sample.

type SampleKey = "move" | "capture" | "check" | "gameOver" | "start";

const SAMPLE_PATHS: Record<SampleKey, string> = {
  move: "/sounds/move-self.mp3",
  capture: "/sounds/capture.mp3",
  check: "/sounds/move-check.mp3",
  gameOver: "/sounds/game-end.mp3",
  start: "/sounds/game-start.mp3",
};

// --- Sound pack registry ------------------------------------------------

export interface SoundPack {
  key: string;
  label: string;
  description: string;
  // Multiplier applied to playback rate (1 = original, >1 = brighter/sharper)
  pitch: number;
  // Bass-shelf gain (dB) on master bus — higher = warmer / chunkier
  bassDb: number;
  // High-shelf gain (dB) — negative softens, positive sharpens
  trebleDb: number;
  // Per-hit body gain (the low thump duplicate)
  bodyMix: number;
  // Master bus gain
  masterGain: number;
  // Compressor threshold (dB)
  threshold: number;
}

export const SOUND_PACKS: SoundPack[] = [
  { key: "wood",    label: "Wood (Default)",  description: "Warm tournament walnut",       pitch: 1.0,  bassDb: 7.5, trebleDb: -2.5, bodyMix: 0.55, masterGain: 1.15, threshold: -16 },
  { key: "marble",  label: "Marble",          description: "Bright crisp polished stone",  pitch: 1.18, bassDb: 2.0, trebleDb:  3.5, bodyMix: 0.25, masterGain: 1.05, threshold: -14 },
  { key: "neon",    label: "Neon Digital",    description: "Modern UI blip",               pitch: 1.32, bassDb: 1.0, trebleDb:  5.0, bodyMix: 0.15, masterGain: 1.00, threshold: -12 },
  { key: "soft",    label: "Soft Felt",       description: "Hushed, library-quiet click",  pitch: 0.92, bassDb: 4.0, trebleDb: -6.0, bodyMix: 0.40, masterGain: 0.80, threshold: -18 },
  { key: "metal",   label: "Metal",           description: "Sharp metallic chime",         pitch: 1.45, bassDb: 0.0, trebleDb:  6.5, bodyMix: 0.10, masterGain: 1.00, threshold: -12 },
  { key: "glass",   label: "Glass",           description: "Light glassy ping",            pitch: 1.55, bassDb: -2.0, trebleDb: 5.5, bodyMix: 0.08, masterGain: 0.95, threshold: -14 },
  { key: "retro",   label: "Retro 8-bit",     description: "Pixel-game blip",              pitch: 1.65, bassDb: 3.0, trebleDb:  2.0, bodyMix: 0.20, masterGain: 1.00, threshold: -12 },
  { key: "silk",    label: "Silk",            description: "Velvety whisper",              pitch: 0.85, bassDb: 6.5, trebleDb: -8.0, bodyMix: 0.50, masterGain: 0.70, threshold: -20 },
];

let activePack: SoundPack = SOUND_PACKS[0];

export function getActiveSoundPack(): SoundPack {
  return activePack;
}

export function applySoundPack(packKey: string) {
  const pack = SOUND_PACKS.find(p => p.key === packKey) || SOUND_PACKS[0];
  activePack = pack;
  // Rebuild the bus on next play so new EQ values apply.
  if (audioCtx) {
    try { masterBus?.disconnect(); } catch {}
    masterBus = null;
    bassShelf = null;
    warmthFilter = null;
    compressor = null;
  }
}

export function bootstrapSoundPack() {
  if (typeof window === "undefined") return;
  try {
    const s = JSON.parse(localStorage.getItem("chess-settings") || "{}");
    if (s.soundPack) applySoundPack(s.soundPack);
  } catch {}
}

let audioCtx: AudioContext | null = null;
let masterBus: GainNode | null = null;
let warmthFilter: BiquadFilterNode | null = null;
let bassShelf: BiquadFilterNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
const bufferCache = new Map<SampleKey, AudioBuffer>();
const inFlight = new Map<SampleKey, Promise<AudioBuffer | null>>();

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext({ latencyHint: "interactive" });
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => undefined);
  }
  return audioCtx;
}

function getBus(ctx: AudioContext): GainNode {
  if (masterBus && bassShelf && warmthFilter && compressor) return masterBus;

  // Bass shelf — boosts the wooden body of the impact for a richer, deeper feel.
  bassShelf = ctx.createBiquadFilter();
  bassShelf.type = "lowshelf";
  bassShelf.frequency.setValueAtTime(220, ctx.currentTime);
  bassShelf.gain.setValueAtTime(activePack.bassDb, ctx.currentTime);

  // Warmth/treble filter — pack-controlled.
  warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = "highshelf";
  warmthFilter.frequency.setValueAtTime(7500, ctx.currentTime);
  warmthFilter.gain.setValueAtTime(activePack.trebleDb, ctx.currentTime);

  // Compressor — keeps peaks polite while the body breathes and feels louder.
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(activePack.threshold, ctx.currentTime);
  compressor.knee.setValueAtTime(10, ctx.currentTime);
  compressor.ratio.setValueAtTime(3, ctx.currentTime);
  compressor.attack.setValueAtTime(0.002, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  masterBus = ctx.createGain();
  masterBus.gain.setValueAtTime(activePack.masterGain, ctx.currentTime);

  bassShelf.connect(warmthFilter);
  warmthFilter.connect(compressor);
  compressor.connect(masterBus);
  masterBus.connect(ctx.destination);

  return masterBus;
}

async function loadSample(key: SampleKey): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(key);
  if (cached) return cached;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const ctx = getCtx();
  const promise = (async () => {
    try {
      const res = await fetch(SAMPLE_PATHS[key]);
      if (!res.ok) return null;
      const data = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(data);
      bufferCache.set(key, buffer);
      return buffer;
    } catch {
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

type PlayOptions = {
  gain?: number;
  rate?: number;
  bassBoost?: number; // extra dB on the low shelf for this hit
  delay?: number;     // seconds from now
};

function playBuffer(buffer: AudioBuffer, options: PlayOptions = {}) {
  const ctx = getCtx();
  const bus = getBus(ctx);
  const startAt = ctx.currentTime + (options.delay ?? 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  // Combine per-hit rate with the active sound-pack pitch shift.
  source.playbackRate.setValueAtTime((options.rate ?? 1) * activePack.pitch, startAt);

  // Per-hit warm body — duplicates the lowest band slightly delayed for a
  // subtle thump that makes the impact feel like real wood, not a click.
  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(options.gain ?? 1, startAt);

  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(280, startAt);
  bodyFilter.Q.setValueAtTime(0.8, startAt);

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime((options.gain ?? 1) * activePack.bodyMix * (1 + (options.bassBoost ?? 0) * 0.08), startAt);

  source.connect(dryGain);
  dryGain.connect(bus);

  source.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(bus);

  source.start(startAt);
}

async function play(key: SampleKey, options: PlayOptions = {}) {
  try {
    const buffer = await loadSample(key);
    if (!buffer) return;
    playBuffer(buffer, options);
  } catch {
    // ignore — never block gameplay on audio
  }
}

// --- Synthesized end-of-game melodies ---------------------------------
// Short, warm, "wooden" mini-cadences played through the same master bus
// so they share the EQ + compressor character of the move samples
// (no arcade beeps, no synth pads — just soft sine bells with a bit of body).

function playToneSequence(notes: Array<{ freq: number; start: number; dur: number; gain?: number }>) {
  try {
    const ctx = getCtx();
    const bus = getBus(ctx);
    const t0 = ctx.currentTime + 0.02;
    for (const n of notes) {
      const start = t0 + n.start;
      const end = start + n.dur;

      // Fundamental — soft sine bell.
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, start);

      // Gentle wooden body — a quieter triangle one octave below.
      const body = ctx.createOscillator();
      body.type = "triangle";
      body.frequency.setValueAtTime(n.freq / 2, start);

      const g = ctx.createGain();
      const peak = (n.gain ?? 0.18) * activePack.masterGain;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(peak, start + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, end);

      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(0.0001, start);
      bodyGain.gain.exponentialRampToValueAtTime(peak * 0.45, start + 0.04);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, end);

      osc.connect(g); g.connect(bus);
      body.connect(bodyGain); bodyGain.connect(bus);

      osc.start(start); osc.stop(end + 0.02);
      body.start(start); body.stop(end + 0.02);
    }
  } catch {
    // never block gameplay on audio
  }
}

// Soft rising arpeggio — C major triad, gentle and triumphant, no fanfare.
export function playVictoryMelody() {
  playToneSequence([
    { freq: 523.25, start: 0.00, dur: 0.32, gain: 0.20 }, // C5
    { freq: 659.25, start: 0.16, dur: 0.32, gain: 0.20 }, // E5
    { freq: 783.99, start: 0.32, dur: 0.55, gain: 0.22 }, // G5
  ]);
}

// Calm two-note resolution for draws — equal, peaceful.
export function playDrawMelody() {
  playToneSequence([
    { freq: 587.33, start: 0.00, dur: 0.40, gain: 0.16 }, // D5
    { freq: 587.33, start: 0.22, dur: 0.55, gain: 0.16 }, // D5 (echo)
  ]);
}

// --- Public API ---------------------------------------------------------

export function playMoveSound() {
  void play("move", { gain: 1.05, rate: 0.96, bassBoost: 1.2 });
}

export function playCaptureSound() {
  void play("capture", { gain: 1.18, rate: 0.94, bassBoost: 1.6 });
}

export function playCheckSound() {
  void play("check", { gain: 1.22, rate: 0.95, bassBoost: 1.4 });
}

export function playGameOverSound() {
  void play("gameOver", { gain: 1.15, rate: 0.92, bassBoost: 1.8 });
}

export function playGameStartSound() {
  void play("start", { gain: 1.1, rate: 0.96, bassBoost: 1.2 });
}

// Preload samples once the user has interacted (needed by browser autoplay rules).
export function preloadChessSounds() {
  (Object.keys(SAMPLE_PATHS) as SampleKey[]).forEach((k) => void loadSample(k));
}

export type MoveSound = "move" | "capture" | "check" | "gameOver" | "start" | "victory" | "drawMelody";

export function playChessSound(type: MoveSound) {
  switch (type) {
    case "move": return playMoveSound();
    case "capture": return playCaptureSound();
    case "check": return playCheckSound();
    case "gameOver": return playGameOverSound();
    case "start": return playGameStartSound();
    case "victory": return playVictoryMelody();
    case "drawMelody": return playDrawMelody();
  }
}
