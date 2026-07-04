import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Clean Entry v6.
 *
 * This component is deliberately dumb: no auth, no database, no profile, no
 * session restore, no realtime subscriptions. It is only a visual overlay over
 * the already-mounted homepage, so registered users can never be blocked here.
 */
const SPLASH_MS = 3000;
const FADE_MS = 320;
const FAILSAFE_MS = 5000;

declare global {
  interface Window {
    __mcEntryReleased?: boolean;
  }
}

function entryLog(label: string, payload?: unknown) {
  try {
    console.info(`[MasterChess Entry] ${label}`, payload ?? "");
  } catch {
    // Entry logging must never affect startup.
  }
}

export default function EntrySplash() {
  const navigate = useNavigate();
  const location = useLocation();
  const homeEntry = useMemo(
    () => location.pathname === "/" || location.pathname === "/home" || location.pathname === "/homepage",
    [location.pathname],
  );
  const finishedRef = useRef(false);
  const [show, setShow] = useState(homeEntry);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!homeEntry) {
      setShow(false);
      return;
    }

    if (window.__mcEntryReleased) {
      finishedRef.current = true;
      setShow(false);
      return;
    }

    finishedRef.current = false;
    setClosing(false);
    setShow(true);

    entryLog("Entry started", { path: location.pathname });
    try { window.dispatchEvent(new CustomEvent("mc:entry-started")); } catch { /* ignore */ }

    const release = (reason: "timer" | "failsafe") => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      window.__mcEntryReleased = true;
      entryLog(reason === "failsafe" ? "Entry failsafe released" : "Entry finished");
      try { window.dispatchEvent(new CustomEvent("mc:entry-finished")); } catch { /* ignore */ }
      setClosing(true);
      window.setTimeout(() => setShow(false), reason === "failsafe" ? 0 : FADE_MS);
    };

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const normalTimer = window.setTimeout(() => release("timer"), reducedMotion ? 250 : SPLASH_MS);
    const failsafeTimer = window.setTimeout(() => {
      const homeReady = !!document.querySelector('[data-entry-ready="home"]');
      if (!homeReady) {
        entryLog("ERROR_STATE", { step: "ENTRY_FAILSAFE", message: "Homepage not detected; forcing /homepage" });
        navigate("/homepage", { replace: true });
      }
      release("failsafe");
    }, FAILSAFE_MS);

    return () => {
      window.clearTimeout(normalTimer);
      window.clearTimeout(failsafeTimer);
    };
  }, [homeEntry, location.pathname, navigate]);

  if (!show) return null;

  return (
    <div
      data-entry-splash="active"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background transition-opacity duration-300 ease-out"
      style={{ pointerEvents: "none", opacity: closing ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 42%, hsl(var(--primary) / 0.24), transparent 68%), radial-gradient(100% 70% at 50% 100%, hsl(var(--accent) / 0.18), transparent 70%), linear-gradient(180deg, hsl(var(--background)), hsl(var(--background)))",
        }}
      />

      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/65"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animation: `mc-entry-drift ${3 + (i % 4)}s ease-in-out ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center px-6">
        <div className="relative animate-[mc-entry-pop_0.75s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div
            className="absolute -inset-10 rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.45), transparent 65%)", filter: "blur(20px)" }}
          />
          <div
            className="relative h-24 w-24 rounded-2xl border border-primary/40 bg-primary/15 shadow-[0_0_60px_hsl(var(--primary)/0.35)] flex items-center justify-center animate-[mc-entry-rotate_18s_linear_infinite]"
          >
            <span className="text-5xl font-black text-primary">♛</span>
          </div>
        </div>

        <h1
          className="mt-8 text-3xl font-bold tracking-[0.35em] text-primary sm:text-4xl animate-[mc-entry-rise_0.65s_ease-out_0.45s_both]"
        >
          MASTERCHESS
        </h1>

        <p
          className="mt-3 text-[11px] uppercase tracking-[0.35em] text-primary/80 animate-[mc-entry-rise_0.65s_ease-out_0.85s_both]"
        >
          DB Chess Cup · Play · Compete
        </p>

        <div
          className="mt-10 h-[2px] w-44 overflow-hidden rounded-full bg-primary/15 animate-[mc-entry-fade_0.4s_ease-out_1.15s_both]"
        >
          <div
            className="h-full w-1/2 bg-primary animate-[mc-entry-bar_1.4s_ease-in-out_infinite]"
          />
        </div>
      </div>

      <style>{`
        @keyframes mc-entry-pop { from { opacity: 0; transform: scale(0.72); filter: blur(8px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes mc-entry-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mc-entry-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mc-entry-rotate { to { transform: rotate(360deg); } }
        @keyframes mc-entry-bar { from { transform: translateX(-110%); } to { transform: translateX(230%); } }
        @keyframes mc-entry-drift { 0%,100% { opacity: 0; transform: translateY(0); } 45% { opacity: 1; transform: translateY(-14px); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001s !important; animation-iteration-count: 1 !important; } }
      `}</style>
    </div>
  );
}