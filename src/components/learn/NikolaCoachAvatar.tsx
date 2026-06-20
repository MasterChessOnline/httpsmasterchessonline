import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Pause, RotateCcw } from "lucide-react";
import nikolaAvatar from "@/assets/nikola-coach-avatar.png";
import type { UseNikolaVoice } from "@/hooks/use-nikola-voice";

interface Props {
  voice: UseNikolaVoice;
  /** Text Nikola is currently saying or just said — shown as transcript bubble. */
  transcript?: string;
  /** Re-speak the last line. */
  onReplay?: () => void;
  size?: number; // px
}

/**
 * Animated Nikola coach avatar.
 * - Glow ring pulses while speaking.
 * - Mouth overlay opens/closes by live audio amplitude (lip-sync feel).
 * - Eyes blink every 4-6 seconds.
 */
export default function NikolaCoachAvatar({ voice, transcript, onReplay, size = 112 }: Props) {
  const mouthRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [blink, setBlink] = useState(false);

  // Speaking pulse (scales the overlay slightly with audio amplitude)
  useEffect(() => {
    if (!voice.speaking) {
      if (mouthRef.current) mouthRef.current.style.transform = "scale(1)";
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const data = new Uint8Array(voice.analyser.current?.frequencyBinCount || 128);
    const tick = () => {
      const analyser = voice.analyser.current;
      if (analyser) {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        const end = Math.min(data.length, 40);
        for (let i = 0; i < end; i++) sum += data[i];
        const avg = sum / end / 255;
        const scale = 1 + Math.min(1, avg * 2.2) * 0.04;
        if (mouthRef.current) mouthRef.current.style.transform = `scale(${scale})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [voice.speaking, voice.analyser]);

  // Blink loop
  useEffect(() => {
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const wait = 3000 + Math.random() * 3000;
      window.setTimeout(() => {
        if (cancelled) return;
        setBlink(true);
        window.setTimeout(() => { if (!cancelled) setBlink(false); }, 140);
        loop();
      }, wait);
    };
    loop();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar disc */}
      <div
        className="relative rounded-full overflow-hidden border-2 border-primary/40 bg-card"
        style={{
          width: size,
          height: size,
          boxShadow: voice.speaking
            ? "0 0 0 4px hsl(var(--primary) / 0.18), 0 0 28px hsl(var(--primary) / 0.55)"
            : "0 0 0 1px hsl(var(--border)), 0 4px 12px rgba(0,0,0,0.25)",
          transition: "box-shadow 220ms ease",
        }}
      >
        <img
          src={nikolaAvatar}
          alt="Nikola — your chess coach"
          width={size}
          height={size}
          loading="lazy"
          className="w-full h-full object-cover object-center select-none pointer-events-none"
          draggable={false}
        />
        {/* Subtle speaking pulse overlay */}
        {voice.speaking && (
          <div
            aria-hidden
            ref={mouthRef}
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow: "inset 0 0 24px hsl(var(--primary) / 0.35)",
              transformOrigin: "center",
              transform: "scale(1)",
              transition: "transform 60ms linear",
            }}
          />
        )}
        {/* Blink overlay — soft dim flash */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none bg-black"
          style={{ opacity: blink ? 0.18 : 0, transition: "opacity 80ms" }}
        />
        {/* Live dot */}
        {voice.speaking && (
          <div className="absolute top-1 right-1 flex items-center gap-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Nikola</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your coach</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
            title="Replay"
          >
            <RotateCcw className="w-3 h-3" /> Replay
          </button>
        )}
        {voice.speaking && (
          <button
            type="button"
            onClick={voice.stop}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
            title="Pause"
          >
            <Pause className="w-3 h-3" /> Pause
          </button>
        )}
        <button
          type="button"
          onClick={() => voice.setMuted(!voice.muted)}
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
            voice.muted
              ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
              : "border-border/60 bg-card text-foreground hover:bg-muted"
          }`}
          title={voice.muted ? "Unmute" : "Mute"}
        >
          {voice.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          {voice.muted ? "Muted" : "On"}
        </button>
      </div>

      {/* Transcript bubble */}
      {transcript && (
        <div className="relative w-full max-w-[260px] rounded-xl border border-primary/25 bg-primary/5 p-3 text-center">
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-l border-t border-primary/25 bg-primary/5" />
          <p className="text-xs leading-relaxed text-foreground">{transcript}</p>
        </div>
      )}
    </div>
  );
}
