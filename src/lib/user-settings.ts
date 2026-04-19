// Centralized user-settings helpers for localStorage persistence.
// Used across Settings, AntiTilt, Coach, Training, and gameplay pages.

export type CoachStyle = "simple" | "detailed";
export type AnalysisDepth = "fast" | "deep";
export type FocusArea = "openings" | "tactics" | "endgames" | "balanced";
export type DefaultTimeControl = "bullet" | "blitz" | "rapid";

export interface ChessSettings {
  // Training
  coachStyle?: CoachStyle;
  analysisDepth?: AnalysisDepth;
  autoAnalyze?: boolean;
  // Improvement
  focusArea?: FocusArea;
  weaknessTracking?: boolean;
  dailyGoalGames?: number;
  dailyGoalTrainings?: number;
  // Notifications
  notifTilt?: boolean;
  notifDaily?: boolean;
  notifGameReminder?: boolean;
  // Play
  defaultTimeControl?: DefaultTimeControl;
  // Rating display
  showRatingChange?: boolean;
  showExpectedScore?: boolean;
  ratingAnimation?: boolean;
  // existing keys also live here (premoves, boardTheme, etc.)
  premoves?: boolean;
  boardTheme?: string;
  pieceSet?: string;
  [key: string]: any;
}

const KEY = "chess-settings";

export function getSettings(): ChessSettings {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

export function saveSetting<K extends keyof ChessSettings>(key: K, value: ChessSettings[K]) {
  const s = getSettings();
  s[key as string] = value;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getSetting<K extends keyof ChessSettings>(key: K, fallback: ChessSettings[K]): ChessSettings[K] {
  const s = getSettings();
  return (s[key as string] ?? fallback) as ChessSettings[K];
}
