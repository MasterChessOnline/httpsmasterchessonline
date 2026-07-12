import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Crown, Play, Trophy } from "lucide-react";

const IndexFull = lazy(() => import("./IndexFull"));

function FastHomeShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-wide text-primary">
            <Crown className="h-5 w-5" /> MasterChess
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dragan-brakus/register" className="hidden rounded-lg border border-primary/40 px-3 py-2 text-sm font-semibold text-primary sm:inline-flex">
              DB Cup
            </Link>
            <Link to="/play-guest" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
              <Play className="h-4 w-4" /> Play
            </Link>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden pt-16">
        <section className="mx-3 mt-3 overflow-hidden rounded-2xl border border-primary/35 bg-primary/10 p-4 shadow-[0_24px_70px_-28px_hsl(var(--primary)/0.75)] sm:mx-6 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-primary">
                <Trophy className="h-4 w-4" /> Featured tournament
              </div>
              <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-5xl">DB Chess Cup</h2>
              <p className="mt-1 text-sm font-semibold text-muted-foreground sm:text-base">5 July 2026 · Register with FIDE ID or your name</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link to="/dragan-brakus/register" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                Register Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dragan-brakus" className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-semibold">
                Details
              </Link>
            </div>
          </div>
        </section>

        <section className="grid min-h-[58vh] place-items-center px-4 py-16 text-center">
          <div className="max-w-5xl">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl border border-primary/40 bg-primary/10 shadow-[0_24px_90px_-24px_hsl(var(--primary)/0.9)]">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-5xl font-black uppercase leading-none tracking-normal sm:text-7xl lg:text-8xl">
              <span className="text-primary">Master</span>Chess
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm uppercase tracking-[0.24em] text-muted-foreground sm:text-base">
              Play · Compete · Master
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/play-guest" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground">
                <Play className="h-5 w-5" /> Play Online
              </Link>
              <Link to="/tournaments" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-4 font-display text-sm font-bold uppercase tracking-widest">
                <Trophy className="h-5 w-5" /> Tournaments
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function IndexFast() {
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const start = () => setShowFull(true);
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 1800 });
      return () => window.cancelIdleCallback?.(idle);
    }
    const timer = globalThis.setTimeout(start, 1200);
    return () => globalThis.clearTimeout(timer);
  }, []);

  if (!showFull) return <FastHomeShell />;

  return (
    <Suspense fallback={<FastHomeShell />}>
      <IndexFull />
    </Suspense>
  );
}