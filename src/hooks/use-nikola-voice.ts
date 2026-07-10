import { useCallback, useEffect, useRef, useState } from "react";
import { resolveVoiceClip, isRealVoiceEnabled, type VoiceClipKey } from "@/lib/nikola-voice-clips";
import { supabase } from "@/integrations/supabase/client";


/**
 * Streams Nikola coach voice via /functions/v1/nikola-tts (SSE PCM).
 * - Pure browser playback (Web Audio API, no <audio> element).
 * - Returns an AnalyserNode that NikolaCoachAvatar uses for lip-sync.
 * - Cancels any in-flight playback when a new speak() is called.
 * - Honors a "muted" toggle persisted in localStorage.
 */
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nikola-tts`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const STORAGE_MUTE = "nikola_voice_muted_v2";
const DEFAULT_VOICE = "ash";
const SPEAK_DEBOUNCE_MS = 220;

export function useNikolaVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [muted, setMutedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_MUTE) === "1";
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playheadRef = useRef<number>(0);
  const endTimerRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingTextRef = useRef<string | null>(null);
  const pendingVoiceRef = useRef<string>(DEFAULT_VOICE);
  const speakTimerRef = useRef<number | null>(null);
  const activeRequestIdRef = useRef(0);

  const setMuted = useCallback((v: boolean) => {
    setMutedState(v);
    try { localStorage.setItem(STORAGE_MUTE, v ? "1" : "0"); } catch { /* ignore */ }
    if (v) stopInternal();
  }, []);

  const ensureCtx = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctx({ sampleRate: 24000 });
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 2.2;
      analyser.connect(gain);
      gain.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      gainRef.current = gain;
    }
    if (ctxRef.current.state === "suspended") {
      try { await ctxRef.current.resume(); } catch { /* ignore */ }
    }
    if (ctxRef.current.state === "running") setUnlocked(true);
    return { ctx: ctxRef.current!, analyser: analyserRef.current! };
  }, []);

  const stopInternal = () => {
    activeRequestIdRef.current += 1;
    if (speakTimerRef.current !== null) {
      clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch { /* ignore */ }
      abortRef.current = null;
    }
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    if (utteranceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      utteranceRef.current = null;
    }
    playheadRef.current = 0;
    setSpeaking(false);
  };

  const stop = useCallback(() => stopInternal(), []);

  const speakFallback = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1.03;
      utterance.pitch = 1.25;
      utterance.volume = 1.0;
      utterance.onend = () => { utteranceRef.current = null; setSpeaking(false); };
      utterance.onerror = () => { utteranceRef.current = null; setSpeaking(false); };
      utteranceRef.current = utterance;
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  }, []);

  const speakNow = useCallback(async (text: string, voice = DEFAULT_VOICE) => {
    if (!text || !text.trim()) return;
    if (muted) return;

    // If audio is not unlocked yet (browser autoplay policy), queue this text
    // and play it on the first user gesture instead of silently failing.
    if (typeof window !== "undefined") {
      // Try to resume — works if we're already inside a user-gesture stack.
      // If still suspended afterwards, queue and bail.
      const probe = ctxRef.current;
      if (probe && probe.state === "suspended") {
        try { await probe.resume(); } catch { /* ignore */ }
      }
    }

    // cancel previous
    stopInternal();

    const { ctx, analyser } = await ensureCtx();

    if (ctx.state !== "running") {
      // Still locked → queue and return; gesture listener will replay.
      pendingTextRef.current = text;
      pendingVoiceRef.current = voice;
      setSpeaking(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = activeRequestIdRef.current;
    setSpeaking(true);
    playheadRef.current = 0;
    let pending = new Uint8Array(0);
    let lastEndTime = ctx.currentTime;

    const playChunk = (incoming: Uint8Array) => {
      const bytes = new Uint8Array(pending.length + incoming.length);
      bytes.set(pending);
      bytes.set(incoming, pending.length);
      const usable = bytes.length - (bytes.length % 2);
      pending = bytes.slice(usable);
      if (usable === 0) return;
      const samples = new Int16Array(bytes.buffer, 0, usable / 2);
      const floats = Float32Array.from(samples, (s) => s / 32768);
      const buffer = ctx.createBuffer(1, floats.length, 24000);
      buffer.copyToChannel(floats, 0);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      if (playheadRef.current === 0) {
        playheadRef.current = ctx.currentTime + 0.05;
      } else {
        playheadRef.current = Math.max(playheadRef.current, ctx.currentTime);
      }
      source.start(playheadRef.current);
      playheadRef.current += buffer.duration;
      lastEndTime = playheadRef.current;
    };

    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        speakFallback(text);
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const event = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          if (requestId !== activeRequestIdRef.current) return;
          const dataLine = event.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          const data = dataLine.slice(5).trim();
          if (data === "[DONE]" || !data) continue;
          try {
            const payload = JSON.parse(data);
            if (payload.type === "speech.audio.delta" && typeof payload.audio === "string") {
              const bin = atob(payload.audio);
              const bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              playChunk(bytes);
            }
          } catch { /* ignore parse errors */ }
        }
      }
      const msLeft = Math.max(0, (lastEndTime - ctx.currentTime) * 1000 + 80);
      endTimerRef.current = window.setTimeout(() => {
        if (requestId !== activeRequestIdRef.current) return;
        endTimerRef.current = null;
        setSpeaking(false);
      }, msLeft);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") setSpeaking(false);
      else speakFallback(text);
    }
  }, [muted, ensureCtx, speakFallback]);

  const speak = useCallback(async (text: string, voice = DEFAULT_VOICE) => {
    if (!text || !text.trim() || muted) return;

    pendingTextRef.current = text;
    pendingVoiceRef.current = voice;

    if (speakTimerRef.current !== null) clearTimeout(speakTimerRef.current);

    speakTimerRef.current = window.setTimeout(() => {
      speakTimerRef.current = null;
      const queued = pendingTextRef.current;
      const queuedVoice = pendingVoiceRef.current;
      pendingTextRef.current = null;
      if (queued && !muted) {
        speakNow(queued, queuedVoice).catch(() => { /* ignore */ });
      }
    }, SPEAK_DEBOUNCE_MS);
  }, [muted, speakNow]);

  /**
   * Play a real-voice clip if one is registered for `key`; otherwise fall back
   * to TTS with `text`. Routes through the same AnalyserNode so lip-sync /
   * VU meter visuals keep working.
   */
  const speakClipOrText = useCallback(async (text: string, key: VoiceClipKey, voice = DEFAULT_VOICE) => {
    if (!text || muted) return;
    const clipUrl = isRealVoiceEnabled() ? resolveVoiceClip(key) : null;
    if (!clipUrl) { return speak(text, voice); }

    stopInternal();
    try {
      const { ctx, analyser } = await ensureCtx();
      const res = await fetch(clipUrl);
      if (!res.ok) { return speak(text, voice); }
      const arr = await res.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arr.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      setSpeaking(true);
      source.onended = () => setSpeaking(false);
      source.start(ctx.currentTime + 0.02);
    } catch {
      return speak(text, voice);
    }
  }, [muted, ensureCtx, speak]);

  // Manual unlock (call from a button click). Resumes context + replays queued text.
  const unlock = useCallback(async () => {
    await ensureCtx();
    const queued = pendingTextRef.current;
    pendingTextRef.current = null;
    if (queued && !muted) {
      // Slight defer so AudioContext fully transitions to "running".
      window.setTimeout(() => speak(queued, pendingVoiceRef.current), 50);
    }
  }, [ensureCtx, muted, speak]);

  // Global one-shot gesture unlock: first pointerdown/keydown anywhere unlocks audio.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unlocked) return;
    const handler = () => { unlock(); };
    window.addEventListener("pointerdown", handler, { once: true, passive: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [unlocked, unlock]);

  // Cleanup on unmount
  useEffect(() => () => {
    stopInternal();
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch { /* ignore */ }
      ctxRef.current = null;
    }
  }, []);

  return {
    speak,
    speakClipOrText,
    stop,
    speaking,
    muted,
    setMuted,
    unlock,
    unlocked,
    analyser: analyserRef,
  };
}

export type UseNikolaVoice = ReturnType<typeof useNikolaVoice>;
