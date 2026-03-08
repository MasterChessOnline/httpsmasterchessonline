// Chess sound effects using Web Audio API — no external dependencies
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, gain = 0.08) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  // Bandpass for a wooden thud
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.Q.setValueAtTime(1, ctx.currentTime);
  source.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

export function playMoveSound() {
  playNoise(0.08, 0.12);
  playTone(600, 0.06, "sine", 0.06);
}

export function playCaptureSound() {
  playNoise(0.12, 0.18);
  playTone(400, 0.1, "triangle", 0.1);
  setTimeout(() => playTone(300, 0.08, "triangle", 0.06), 40);
}

export function playCheckSound() {
  playTone(880, 0.12, "square", 0.1);
  setTimeout(() => playTone(1100, 0.15, "square", 0.08), 80);
}

export function playGameOverSound() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.1), i * 120);
  });
}

export function playGameStartSound() {
  playTone(440, 0.15, "sine", 0.08);
  setTimeout(() => playTone(660, 0.2, "sine", 0.08), 100);
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
