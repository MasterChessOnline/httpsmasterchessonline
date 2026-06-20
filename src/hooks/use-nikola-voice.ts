import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Streams Nikola coach voice via /functions/v1/nikola-tts (SSE PCM).
 * - Pure browser playback (Web Audio API, no <audio> element).
 * - Returns an AnalyserNode that NikolaCoachAvatar uses for lip-sync.
 * - Cancels any in-flight playback when a new speak() is called.
 * - Honors a "muted" toggle persisted in localStorage.
 */
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nikola-tts`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const STORAGE_MUTE = "nikola_voice_muted";

export function useNikolaVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMutedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_MUTE) === "1";
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const playheadRef = useRef<number>(0);
  const endTimerRef = useRef<number | null>(null);

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
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (ctxRef.current.state === "suspended") {
      try { await ctxRef.current.resume(); } catch { /* ignore */ }
    }
    return { ctx: ctxRef.current!, analyser: analyserRef.current! };
  }, []);

  const stopInternal = () => {
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch { /* ignore */ }
      abortRef.current = null;
    }
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
    playheadRef.current = 0;
    setSpeaking(false);
  };

  const stop = useCallback(() => stopInternal(), []);

  const speak = useCallback(async (text: string, voice = "verse") => {
    if (!text || !text.trim()) return;
    if (muted) return;

    // cancel previous
    stopInternal();

    const { ctx, analyser } = await ensureCtx();
    const controller = new AbortController();
    abortRef.current = controller;
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
        setSpeaking(false);
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
      // Schedule "stopped speaking" right after playback finishes
      const msLeft = Math.max(0, (lastEndTime - ctx.currentTime) * 1000 + 80);
      endTimerRef.current = window.setTimeout(() => {
        endTimerRef.current = null;
        setSpeaking(false);
      }, msLeft);
    } catch {
      setSpeaking(false);
    }
  }, [muted, ensureCtx]);

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
    stop,
    speaking,
    muted,
    setMuted,
    analyser: analyserRef,
  };
}

export type UseNikolaVoice = ReturnType<typeof useNikolaVoice>;
