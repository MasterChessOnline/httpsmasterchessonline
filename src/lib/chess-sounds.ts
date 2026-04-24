// Realistic chess board sounds — using actual recorded wooden piece samples.
// Loaded from /public/sounds and routed through a Web Audio graph that adds
// low-end body, gentle saturation and a soft compressor so every hit feels
// warm, weighty and emotionally present (not a dry click).

const SAMPLE_PATHS: Record<SampleKey, string> = {
  move: "/sounds/move-self.mp3",
  capture: "/sounds/capture.mp3",
  check: "/sounds/move-check.mp3",
  gameOver: "/sounds/game-end.mp3",
  start: "/sounds/game-start.mp3",
};

type SampleKey = "move" | "capture" | "check" | "gameOver" | "start";

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
  bassShelf.gain.setValueAtTime(7.5, ctx.currentTime);

  // Warmth filter — gently rolls off harsh digital highs for an analog vibe.
  warmthFilter = ctx.createBiquadFilter();
  warmthFilter.type = "highshelf";
  warmthFilter.frequency.setValueAtTime(7500, ctx.currentTime);
  warmthFilter.gain.setValueAtTime(-2.5, ctx.currentTime);

  // Compressor — keeps peaks polite while the body breathes and feels louder.
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-16, ctx.currentTime);
  compressor.knee.setValueAtTime(10, ctx.currentTime);
  compressor.ratio.setValueAtTime(3, ctx.currentTime);
  compressor.attack.setValueAtTime(0.002, ctx.currentTime);
  compressor.release.setValueAtTime(0.18, ctx.currentTime);

  masterBus = ctx.createGain();
  masterBus.gain.setValueAtTime(1.15, ctx.currentTime);

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
  source.playbackRate.setValueAtTime(options.rate ?? 1, startAt);

  // Per-hit warm body — duplicates the lowest band slightly delayed for a
  // subtle thump that makes the impact feel like real wood, not a click.
  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(options.gain ?? 1, startAt);

  const bodyFilter = ctx.createBiquadFilter();
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(280, startAt);
  bodyFilter.Q.setValueAtTime(0.8, startAt);

  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime((options.gain ?? 1) * 0.55 * (1 + (options.bassBoost ?? 0) * 0.08), startAt);

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

export type MoveSound = "move" | "capture" | "check" | "gameOver" | "start";

export function playChessSound(type: MoveSound) {
  switch (type) {
    case "move": return playMoveSound();
    case "capture": return playCaptureSound();
    case "check": return playCheckSound();
    case "gameOver": return playGameOverSound();
    case "start": return playGameStartSound();
  }
}
