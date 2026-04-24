// Chess sound effects using Web Audio API — mature, wooden, tournament-board feel.
// No arcade tones, no synth beeps. Designed to evoke a real wooden piece
// landing on a felted board.
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/**
 * Wooden knock — short filtered noise burst with a low body thump.
 * Simulates a weighted piece landing on a felted wooden board.
 */
function playWoodenKnock(opts: {
  bodyFreq?: number;       // low thump pitch
  bodyGain?: number;
  noiseGain?: number;
  noiseDuration?: number;
  bandpassFreq?: number;   // character of the "click"
  bandpassQ?: number;
  highpassFreq?: number;
} = {}) {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const {
    bodyFreq = 140,
    bodyGain = 0.18,
    noiseGain = 0.09,
    noiseDuration = 0.06,
    bandpassFreq = 1800,
    bandpassQ = 1.4,
    highpassFreq = 280,
  } = opts;

  // --- Low body thump (the "weight" of the piece) ---
  const body = ctx.createOscillator();
  const bodyG = ctx.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(bodyFreq, now);
  body.frequency.exponentialRampToValueAtTime(bodyFreq * 0.55, now + 0.08);
  bodyG.gain.setValueAtTime(0.0001, now);
  bodyG.gain.exponentialRampToValueAtTime(bodyGain, now + 0.005);
  bodyG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  body.connect(bodyG);
  bodyG.connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.14);

  // --- Filtered noise click (the wood-on-wood contact) ---
  const bufferSize = Math.floor(ctx.sampleRate * noiseDuration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Slight decay envelope inside the buffer for a sharper attack
    const t = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * (1 - t * 0.5);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(highpassFreq, now);

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(bandpassFreq, now);
  bp.Q.setValueAtTime(bandpassQ, now);

  const noiseG = ctx.createGain();
  noiseG.gain.setValueAtTime(noiseGain, now);
  noiseG.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

  noise.connect(hp);
  hp.connect(bp);
  bp.connect(noiseG);
  noiseG.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + noiseDuration + 0.01);
}

export function playMoveSound() {
  // Standard wooden piece set down on the board
  playWoodenKnock({
    bodyFreq: 150,
    bodyGain: 0.16,
    noiseGain: 0.07,
    noiseDuration: 0.055,
    bandpassFreq: 1700,
    bandpassQ: 1.3,
  });
}

export function playCaptureSound() {
  // Heavier, two-stage knock — piece pushed aside, replacement set down
  playWoodenKnock({
    bodyFreq: 110,
    bodyGain: 0.2,
    noiseGain: 0.1,
    noiseDuration: 0.08,
    bandpassFreq: 1300,
    bandpassQ: 1.1,
  });
  setTimeout(() => {
    playWoodenKnock({
      bodyFreq: 95,
      bodyGain: 0.14,
      noiseGain: 0.08,
      noiseDuration: 0.07,
      bandpassFreq: 1500,
      bandpassQ: 1.2,
    });
  }, 55);
}

export function playCheckSound() {
  // Firm, deliberate piece-down, then a low warm cue (no square-wave beep)
  playWoodenKnock({
    bodyFreq: 130,
    bodyGain: 0.18,
    noiseGain: 0.09,
    noiseDuration: 0.07,
    bandpassFreq: 1600,
    bandpassQ: 1.2,
  });

  const ctx = getCtx();
  const now = ctx.currentTime + 0.05;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(900, now);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  osc.connect(lp);
  lp.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);
}

export function playGameOverSound() {
  // Slow, dignified low chord — no arcade arpeggio
  const ctx = getCtx();
  const now = ctx.currentTime;
  const freqs = [110, 146.83, 220]; // A2, D3, A3 — open, somber
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1200, now);
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, now);
    g.gain.setValueAtTime(0.0001, now + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.07, now + i * 0.05 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    osc.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    osc.start(now + i * 0.05);
    osc.stop(now + 1.5);
  });
}

export function playGameStartSound() {
  // A single confident wooden knock — like setting the king down to begin
  playWoodenKnock({
    bodyFreq: 160,
    bodyGain: 0.17,
    noiseGain: 0.08,
    noiseDuration: 0.06,
    bandpassFreq: 1800,
    bandpassQ: 1.3,
  });
}

export type MoveSound = "move" | "capture" | "check" | "gameOver" | "start";

export function playChessSound(type: MoveSound) {
  try {
    switch (type) {
      case "move": playMoveSound(); break;
      case "capture": playCaptureSound(); break;
      case "check": playCheckSound(); break;
      case "gameOver": playGameOverSound(); break;
      case "start": playGameStartSound(); break;
    }
  } catch {
    // Audio not available — fail silently
  }
}
