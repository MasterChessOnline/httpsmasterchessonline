import { useMemo } from "react";

/**
 * Lightweight "Chess Universe" cosmic background.
 * - Pure CSS, no Framer Motion (no per-frame React updates → no flicker).
 * - Static gradient nebula + two layers of stars animated via CSS keyframes.
 * - Fixed, behind everything, pointer-events-none, GPU-only transforms.
 * - Respects prefers-reduced-motion automatically (animation pauses).
 */
export default function ChessUniverseBackground() {
  // Stable star fields (memoized once per mount — no re-renders).
  const starsSmall = useMemo(() => generateStars(70, 1, 1.6), []);
  const starsBig = useMemo(() => generateStars(22, 1.8, 2.6), []);

  return (
    <>
      <style>{`
        @keyframes mc-twinkle { 0%,100% { opacity:.35 } 50% { opacity:1 } }
        @keyframes mc-drift   { from { transform: translate3d(0,0,0) } to { transform: translate3d(0,-40px,0) } }
        @media (prefers-reduced-motion: reduce) {
          .mc-stars, .mc-stars-big { animation: none !important }
        }
      `}</style>
      <div
        aria-hidden
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 20% 15%, hsl(260 60% 18% / .55), transparent 55%)," +
            "radial-gradient(ellipse at 80% 85%, hsl(280 70% 22% / .45), transparent 55%)," +
            "radial-gradient(ellipse at 50% 50%, hsl(220 50% 10% / .9), hsl(240 60% 4%) 70%)," +
            "linear-gradient(to bottom, #05060d, #0a0712)",
        }}
      >
        {/* Soft nebula glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[60vh] w-[120vw] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(45 90% 55% / .12), transparent 60%)",
            filter: "blur(40px)",
          }}
        />

        {/* Tiny stars layer */}
        <div
          className="mc-stars absolute inset-0 will-change-transform"
          style={{
            backgroundImage: starsSmall,
            backgroundRepeat: "repeat",
            backgroundSize: "600px 600px",
            animation: "mc-drift 60s linear infinite, mc-twinkle 4s ease-in-out infinite",
          }}
        />
        {/* Bigger stars layer */}
        <div
          className="mc-stars-big absolute inset-0 will-change-transform"
          style={{
            backgroundImage: starsBig,
            backgroundRepeat: "repeat",
            backgroundSize: "900px 900px",
            animation: "mc-drift 110s linear infinite, mc-twinkle 6s ease-in-out infinite",
            opacity: 0.8,
          }}
        />

        {/* Faint chess piece silhouettes — static, no animation */}
        <div className="absolute inset-0 select-none" style={{ opacity: 0.04 }}>
          <span className="absolute" style={{ left: "8%",  top: "18%", fontSize: 90 }}>♛</span>
          <span className="absolute" style={{ left: "82%", top: "12%", fontSize: 70 }}>♞</span>
          <span className="absolute" style={{ left: "75%", top: "72%", fontSize: 110 }}>♚</span>
          <span className="absolute" style={{ left: "12%", top: "78%", fontSize: 80 }}>♜</span>
        </div>
      </div>
    </>
  );
}

function generateStars(count: number, minR: number, maxR: number): string {
  // Build a single CSS multi-radial-gradient with deterministic-ish placement.
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 12345.6789) % 1;
    const px = Math.abs(x) * 600;
    const py = Math.abs(y) * 600;
    const r = minR + Math.abs(Math.sin(i * 3.14)) * (maxR - minR);
    parts.push(
      `radial-gradient(${r.toFixed(1)}px ${r.toFixed(1)}px at ${px.toFixed(1)}px ${py.toFixed(1)}px, #ffffffcc, transparent 60%)`
    );
  }
  return parts.join(", ");
}
