// Lightweight global reward FX dispatcher: floating toast + premium sound.
// No external assets — sounds synthesized via Web Audio API.

export type RewardKind = "coin" | "xp" | "level" | "rank" | "achievement" | "streak";

export interface RewardPayload {
  kind: RewardKind;
  title: string;
  subtitle?: string;
  amount?: number;
  rare?: boolean;
}

const EVENT = "masterchess:reward-fx";

export function emitReward(p: RewardPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: p }));
}

export function onReward(fn: (p: RewardPayload) => void) {
  if (typeof window === "undefined") return () => {};
  const h = (e: Event) => fn((e as CustomEvent<RewardPayload>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

// --- premium synth sounds ---
let _ctx: AudioContext | null = null;
function ctx() {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  try {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
  return _ctx;
}

function soundEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("chess-sound") !== "off";
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.18, delay = 0) {
  const a = ctx();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playRewardSound(kind: RewardKind, rare = false) {
  if (!soundEnabled()) return;
  switch (kind) {
    case "coin":
      tone(880, 0.12, "triangle", 0.18);
      tone(1320, 0.16, "triangle", 0.14, 0.06);
      break;
    case "xp":
      tone(660, 0.1, "sine", 0.16);
      tone(990, 0.14, "sine", 0.12, 0.05);
      break;
    case "level":
      tone(523, 0.12, "triangle", 0.2);
      tone(659, 0.12, "triangle", 0.2, 0.1);
      tone(784, 0.18, "triangle", 0.2, 0.2);
      tone(1046, 0.25, "triangle", 0.18, 0.32);
      break;
    case "rank":
      tone(440, 0.18, "sawtooth", 0.12);
      tone(660, 0.22, "sawtooth", 0.12, 0.12);
      tone(880, 0.3, "sine", 0.2, 0.25);
      break;
    case "streak":
      tone(700, 0.08, "square", 0.1);
      tone(1000, 0.1, "square", 0.1, 0.05);
      tone(1400, 0.14, "sine", 0.14, 0.12);
      break;
    case "achievement":
      tone(523, 0.14, "triangle", 0.2);
      tone(784, 0.14, "triangle", 0.2, 0.1);
      tone(1046, 0.18, "triangle", 0.22, 0.22);
      tone(1318, 0.3, "sine", rare ? 0.28 : 0.2, 0.36);
      break;
  }
}
