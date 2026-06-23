/**
 * Nikola real-voice clip registry.
 *
 * Drop pre-recorded MP3/WAV files into `src/assets/voice/` (or any CDN-hosted
 * Lovable asset) and register them here. When a clip exists for a given
 * (course, variation, move), the MasterCourse player will use the real human
 * voice instead of TTS.
 *
 * Lookup is most-specific-wins:
 *   1. course + variation + moveIndex + san
 *   2. course + variation + moveIndex
 *   3. course + variation                  (intro/summary)
 *   4. course                              (course-level intro)
 */

export interface VoiceClipKey {
  courseId: string;
  variationId?: string;
  moveIndex?: number;
  san?: string;
}

/**
 * Build a stable string key from a VoiceClipKey, used as a manifest lookup.
 * Format: `course[__variation][__moveIndex[-san]]`
 */
export function buildClipKey(k: VoiceClipKey): string {
  let key = k.courseId;
  if (k.variationId != null) key += `__${k.variationId}`;
  if (k.moveIndex != null) {
    key += `__${k.moveIndex}`;
    if (k.san) key += `-${k.san.replace(/[^a-zA-Z0-9]/g, "")}`;
  }
  return key;
}

/**
 * Manifest of registered voice clips: { key → CDN URL }.
 * Add new clips by importing the `.asset.json` pointer and calling
 * `registerClip` below, OR by appending an entry directly:
 *
 *   import myClip from "@/assets/voice/of-1__intro.mp3.asset.json";
 *   registerClip({ courseId: "of-1" }, myClip.url);
 */
export const voiceClipManifest: Record<string, string> = {
  // Populated as you upload recordings. Keep entries grouped by courseId.
};

/** Register (or override) a clip for a given key. Safe to call at import time. */
export function registerClip(k: VoiceClipKey, url: string): void {
  voiceClipManifest[buildClipKey(k)] = url;
}

/**
 * Resolve the best-matching clip URL for the given key, falling back from
 * most-specific to least-specific. Returns null if nothing matches.
 */
export function resolveVoiceClip(k: VoiceClipKey): string | null {
  const tries: VoiceClipKey[] = [];
  if (k.variationId != null && k.moveIndex != null && k.san) {
    tries.push({ courseId: k.courseId, variationId: k.variationId, moveIndex: k.moveIndex, san: k.san });
  }
  if (k.variationId != null && k.moveIndex != null) {
    tries.push({ courseId: k.courseId, variationId: k.variationId, moveIndex: k.moveIndex });
  }
  if (k.variationId != null) {
    tries.push({ courseId: k.courseId, variationId: k.variationId });
  }
  tries.push({ courseId: k.courseId });
  for (const t of tries) {
    const url = voiceClipManifest[buildClipKey(t)];
    if (url) return url;
  }
  return null;
}

/** User toggle for using real voice when available. Default ON. */
const STORAGE_REAL_VOICE = "nikola_real_voice_enabled";
export function isRealVoiceEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = localStorage.getItem(STORAGE_REAL_VOICE);
  return v === null ? true : v === "1";
}
export function setRealVoiceEnabled(on: boolean): void {
  try { localStorage.setItem(STORAGE_REAL_VOICE, on ? "1" : "0"); } catch { /* ignore */ }
}
