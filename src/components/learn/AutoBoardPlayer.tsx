import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePieceGlyphs } from "@/lib/piece-glyphs";
import type { MoveStep } from "./InteractiveBoard";

interface Props {
  startFen?: string;
  moves: MoveStep[];
  orientation?: "white" | "black";
  title?: string;
  onTryIt?: () => void;
}

const SPEEDS = [0.75, 1, 1.5] as const;
const BASE_MS = 2600;
const FILES = "abcdefgh";

/** "Video" lesson: the board plays the line by itself with captions and player controls. */
export default function AutoBoardPlayer({ startFen, moves, orientation = "white", title, onTryIt }: Props) {
  const { get: getGlyph } = usePieceGlyphs();
  const [idx, setIdx] = useState(0); // number of moves played
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const timer = useRef<number>();

  // Precompute every frame (fen + last move squares)
  const frames = useMemo(() => {
    let chess: Chess;
    try { chess = new Chess(startFen); } catch { chess = new Chess(); }
    const out: { fen: string; from?: string; to?: string; san?: string; text?: string; capture?: boolean }[] = [{ fen: chess.fen() }];
    for (const m of moves) {
      try {
        const r = chess.move(m.san);
        if (!r) break;
        out.push({ fen: chess.fen(), from: r.from, to: r.to, san: r.san, text: m.explanation, capture: !!r.captured });
      } catch { break; }
    }
    return out;
  }, [startFen, moves]);

  const total = frames.length - 1;

  useEffect(() => { setIdx(0); setPlaying(false); }, [frames]);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!playing) return;
    if (idx >= total) { setPlaying(false); return; }
    timer.current = window.setTimeout(() => setIdx((i) => Math.min(total, i + 1)), BASE_MS / speed);
    return () => window.clearTimeout(timer.current);
  }, [playing, idx, total, speed]);

  // Move sound
  useEffect(() => {
    if (idx === 0) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = frames[idx].capture ? 220 : 440;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.12);
      setTimeout(() => ctx.close(), 300);
    } catch { /* no audio */ }
  }, [idx, frames]);

  const frame = frames[idx];
  const board = useMemo(() => new Chess(frame.fen).board(), [frame.fen]);
  const rows = orientation === "white" ? board : [...board].reverse().map((r) => [...r].reverse());
  const seconds = Math.round((total * BASE_MS) / speed / 1000);

  if (total === 0) return null;

  const toggle = () => {
    if (idx >= total) { setIdx(0); setPlaying(true); } else setPlaying((p) => !p);
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-primary/5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">▶ Video lesson{title ? ` · ${title}` : ""}</span>
        <span className="text-[11px] text-muted-foreground font-mono">~{seconds}s · {total} moves</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-4 p-4">
        <button type="button" onClick={toggle} className="relative w-full aspect-square rounded-lg overflow-hidden border border-border/50 grid grid-cols-8" aria-label={playing ? "Pause video" : "Play video"}>
          {rows.map((row, r) => row.map((sq, c) => {
            const fileIdx = orientation === "white" ? c : 7 - c;
            const rank = orientation === "white" ? 8 - r : r + 1;
            const name = `${FILES[fileIdx]}${rank}`;
            const light = (fileIdx + rank) % 2 === 1;
            const hl = name === frame.from || name === frame.to;
            const art = sq ? getGlyph(`${sq.color}${sq.type}`) : null;
            return (
              <div key={name} className={`relative flex items-center justify-center ${light ? "bg-secondary" : "bg-muted"}`}>
                {hl && <div className="absolute inset-0 bg-primary/40" />}
                {art && (art.svgUrl
                  ? <img src={art.svgUrl} alt="" className="relative w-[88%] h-[88%] transition-transform duration-300" draggable={false} />
                  : <span className="relative text-3xl leading-none">{art.symbol}</span>)}
              </div>
            );
          }))}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/30">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                {idx >= total ? <RotateCcw className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </div>
            </div>
          )}
        </button>

        <div className="flex flex-col gap-3 min-w-0">
          <div className="rounded-lg border border-border/50 bg-background/40 p-4 min-h-[120px]">
            <p className="text-xs text-muted-foreground mb-1">
              {idx === 0 ? "Starting position" : `Move ${idx} / ${total}`}
            </p>
            {frame.san && <p className="font-display text-2xl font-bold text-primary mb-1">{frame.san}</p>}
            <p className="text-sm text-foreground leading-relaxed">
              {idx === 0 ? "Press play — watch the line, then try it yourself." : frame.text}
            </p>
          </div>

          {/* timeline */}
          <div className="flex gap-1">
            {frames.map((_, i) => (
              <button key={i} type="button" aria-label={`Jump to move ${i}`} onClick={() => { setPlaying(false); setIdx(i); }}
                className={`h-2 flex-1 rounded-full transition-colors ${i <= idx ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button size="icon" variant="outline" aria-label="Previous move" onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}><SkipBack className="w-4 h-4" /></Button>
            <Button size="icon" aria-label={playing ? "Pause" : "Play"} onClick={toggle}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</Button>
            <Button size="icon" variant="outline" aria-label="Next move" onClick={() => { setPlaying(false); setIdx((i) => Math.min(total, i + 1)); }}><SkipForward className="w-4 h-4" /></Button>
            <Button size="icon" variant="outline" aria-label="Replay" onClick={() => { setIdx(0); setPlaying(true); }}><RotateCcw className="w-4 h-4" /></Button>
            <div className="flex gap-1 ml-auto">
              {SPEEDS.map((s) => (
                <Button key={s} size="sm" variant={speed === s ? "default" : "outline"} onClick={() => setSpeed(s)} className="px-2 font-mono text-xs">{s}x</Button>
              ))}
            </div>
          </div>

          {onTryIt && (
            <Button variant="outline" onClick={onTryIt} className="border-primary/40">
              <Target className="w-4 h-4 mr-2" /> Try it yourself
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
