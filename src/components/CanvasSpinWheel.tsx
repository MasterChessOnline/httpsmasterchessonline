import { useEffect, useRef } from "react";

export type WheelSegment = {
  label: string;       // "+500 Coins"
  sub?: string;        // "Coins" — small
  piece: string;       // glyph e.g. "♖"
  color: string;       // hex/hsl base
  text?: string;       // text color, default white
};

interface Props {
  segments: WheelSegment[];
  /** Final rotation in degrees (cumulative). Component animates from previous value. */
  targetAngle: number;
  /** Duration of spin animation in ms. */
  duration?: number;
  /** Called when spin animation ends. */
  onSpinEnd?: () => void;
  /** Visual size in px (canvas backing scales with DPR). */
  size?: number;
  /** Winning segment index, used to highlight after stop. */
  winnerIdx?: number | null;
}

/**
 * Canvas-rendered chess wheel. RAF-driven, 60fps target.
 * - Hardware-accelerated, no DOM nodes per segment.
 * - Smooth ease-out cubic spin physics.
 * - Highlights the winning segment with a pulsing glow after stop.
 */
export default function CanvasSpinWheel({
  segments,
  targetAngle,
  duration = 4200,
  onSpinEnd,
  size = 320,
  winnerIdx = null,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null);
  const onEndRef = useRef(onSpinEnd);
  onEndRef.current = onSpinEnd;
  const segsRef = useRef(segments);
  segsRef.current = segments;
  const winnerRef = useRef(winnerIdx);
  winnerRef.current = winnerIdx;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const idleStartRef = useRef<number>(performance.now());

  // Draw a single frame
  const draw = (rotationDeg: number, time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const segs = segsRef.current;
    const n = segs.length;
    const px = sizeRef.current;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== px * dpr) {
      canvas.width = px * dpr;
      canvas.height = px * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, px, px);

    const cx = px / 2;
    const cy = px / 2;
    const r = px / 2 - 6;
    const segAngle = (Math.PI * 2) / n;
    const rot = (rotationDeg * Math.PI) / 180;

    // Outer ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    for (let i = 0; i < n; i++) {
      const start = i * segAngle - Math.PI / 2;
      const end = start + segAngle;
      const seg = segs[i];

      // Wedge
      const grad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
      grad.addColorStop(0, shade(seg.color, 0.25));
      grad.addColorStop(1, shade(seg.color, -0.15));

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Divider
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Winning glow
      if (winnerRef.current === i) {
        const pulse = 0.5 + 0.5 * Math.sin(time / 220);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, start, end);
        ctx.closePath();
        ctx.fillStyle = `rgba(252, 211, 77, ${0.18 + pulse * 0.28})`;
        ctx.fill();
        ctx.restore();
      }

      // Text along the wedge bisector
      ctx.save();
      const mid = (start + end) / 2;
      ctx.rotate(mid);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = seg.text ?? "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;

      // Piece glyph
      ctx.font = `bold ${Math.round(px * 0.085)}px "Inter", system-ui, sans-serif`;
      ctx.fillText(seg.piece, r - 14, -px * 0.055);

      // Label
      ctx.font = `900 ${Math.round(px * 0.052)}px "Inter", system-ui, sans-serif`;
      ctx.fillText(seg.label, r - 14, px * 0.018);

      if (seg.sub) {
        ctx.font = `600 ${Math.round(px * 0.028)}px "Inter", system-ui, sans-serif`;
        ctx.globalAlpha = 0.85;
        ctx.fillText(seg.sub, r - 14, px * 0.06);
        ctx.globalAlpha = 1;
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Inner hub
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    const hub = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 0.22);
    hub.addColorStop(0, "#fde68a");
    hub.addColorStop(1, "#92400e");
    ctx.fillStyle = hub;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.stroke();

    ctx.restore();

    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(252,211,77,0.7)";
    ctx.shadowColor = "rgba(252,211,77,0.7)";
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Idle pulse animation (very slow rotation when not spinning, drives winner pulse)
  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      // Slow drift while idle to keep wheel feeling alive
      const drift = ((ts - idleStartRef.current) / 1000) * 6; // 6deg/sec
      const a = startTsRef.current == null ? currentAngleRef.current + drift * 0 + (winnerRef.current == null ? drift * 0.02 : 0) : currentAngleRef.current;
      draw(a, ts);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spin when targetAngle changes
  useEffect(() => {
    if (targetAngle === prevAngleRef.current) return;
    const from = currentAngleRef.current;
    const to = targetAngle;
    const dur = duration;
    const start = performance.now();
    startTsRef.current = start;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      currentAngleRef.current = from + (to - from) * eased;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        currentAngleRef.current = to;
        prevAngleRef.current = to;
        startTsRef.current = null;
        rafRef.current = null;
        onEndRef.current?.();
        // haptic
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try { (navigator as any).vibrate?.([30, 40, 80]); } catch {}
        }
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetAngle, duration]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: "block", willChange: "transform" }}
        aria-label="Reward wheel"
        role="img"
      />
      {/* Pointer */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: -6 }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "20px solid hsl(45,90%,58%)",
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.55))",
          }}
        />
      </div>
    </div>
  );
}

function shade(hex: string, percent: number): string {
  // accepts #rgb / #rrggbb; returns rgba string
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * percent)));
  r = adj(r); g = adj(g); b = adj(b);
  return `rgb(${r}, ${g}, ${b})`;
}
