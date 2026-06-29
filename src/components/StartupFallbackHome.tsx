import { Link } from "react-router-dom";
import { AlertTriangle, Crown, RotateCw, Trophy, Play } from "lucide-react";

export default function StartupFallbackHome({ reason = "safe-entry" }: { reason?: string }) {
  const retry = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
      data-entry-ready="fallback-home"
      data-entry-reason={reason}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 520px at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%), radial-gradient(680px 520px at 100% 100%, hsl(var(--accent) / 0.12), transparent 72%)",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-2xl border border-primary/35 bg-primary/10 shadow-[0_0_60px_hsl(var(--primary)/0.22)]">
          <Crown className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>

        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Safe entry mode
        </p>

        <h1 className="font-display text-5xl font-black uppercase leading-none tracking-normal sm:text-7xl">
          Master<span className="text-primary">Chess</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          The full homepage took too long to start, so MasterChess opened the safe home screen instead.
        </p>

        <div className="mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/play-guest"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-primary/60 bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_0_28px_hsl(var(--primary)/0.22)] transition hover:bg-primary/90 sm:w-auto"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Play now
          </Link>
          <Link
            to="/dragan-brakus/register"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:border-primary/50 hover:text-primary sm:w-auto"
          >
            <Trophy className="h-4 w-4" aria-hidden="true" /> Register DB Cup
          </Link>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-muted/40 px-5 text-sm font-bold text-foreground transition hover:bg-muted sm:w-auto"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" /> Retry
          </button>
        </div>
      </main>
    </div>
  );
}