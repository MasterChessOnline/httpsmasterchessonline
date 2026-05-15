// Accessibility & comfort preferences — applied as classes on <html>.
// Persisted in localStorage so they survive across sessions.

const STORAGE_KEY = "mc:a11y";

export interface A11ySettings {
  largePieces: boolean;
  dyslexiaFont: boolean;
  reduceMotion: boolean;
  focusMode: boolean;
  blindfold: boolean;
  colorBlindBoard: boolean;
}

const DEFAULTS: A11ySettings = {
  largePieces: false,
  dyslexiaFont: false,
  reduceMotion: false,
  focusMode: false,
  blindfold: false,
  colorBlindBoard: false,
};

export function readA11y(): A11ySettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function writeA11y(s: A11ySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
  applyA11y(s);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("masterchess:a11y-change", { detail: s }));
  }
}

export function applyA11y(s: A11ySettings = readA11y()) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-large-pieces", s.largePieces);
  root.classList.toggle("a11y-dyslexia", s.dyslexiaFont);
  root.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  root.classList.toggle("a11y-focus", s.focusMode);
  root.classList.toggle("a11y-blindfold", s.blindfold);
  root.classList.toggle("a11y-cb-board", s.colorBlindBoard);

  if (s.colorBlindBoard) {
    // Deuteranopia-safe pair: warm cream + deep slate-blue.
    root.style.setProperty("--board-light", "45 65% 86%");
    root.style.setProperty("--board-dark", "215 35% 28%");
  }
}

export function bootstrapA11y() {
  applyA11y(readA11y());
}
