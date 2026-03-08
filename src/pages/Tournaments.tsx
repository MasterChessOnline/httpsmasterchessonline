import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, Zap, Swords, BookOpen, Timer } from "lucide-react";
import { TOURNAMENTS, Tournament } from "@/lib/tournaments-data";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All", icon: Trophy },
  { value: "blitz", label: "Blitz", icon: Zap },
  { value: "rapid", label: "Rapid", icon: Timer },
  { value: "classical", label: "Classical", icon: Clock },
  { value: "themed", label: "Themed", icon: BookOpen },
];

const statusStyles: Record<string, { bg: string; label: string }> = {
  live: { bg: "bg-accent text-accent-foreground", label: "🔴 Live" },
  registering: { bg: "bg-primary/10 text-primary", label: "Open" },
  upcoming: { bg: "bg-muted text-muted-foreground", label: "Upcoming" },
  completed: { bg: "bg-muted text-muted-foreground", label: "Completed" },
};

const Tournaments = () => {
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = TOURNAMENTS.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Tournaments</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Compete in live tournaments and climb the leaderboard.
        </p>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                category === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex justify-center gap-2 mb-8">
          {["all", "live", "registering", "upcoming"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                statusFilter === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-2xl space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No tournaments match your filters.</p>
          )}
          {filtered.map((t) => {
            const style = statusStyles[t.status];
            return (
              <article
                key={t.id}
                className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex rounded-lg bg-primary/10 p-3 shrink-0">
                    <Swords className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-semibold text-foreground">{t.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.topic}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.timeControl}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.currentPlayers}/{t.maxPlayers}</span>
                      <span>{t.startDate}</span>
                      <span className="text-primary font-medium">🏆 {t.prize}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={t.status === "live" ? "default" : "outline"}
                    className="shrink-0"
                    disabled={t.status === "upcoming" || t.status === "completed"}
                  >
                    {t.status === "live" ? "Join Now" : t.status === "registering" ? "Register" : t.status === "upcoming" ? "Coming Soon" : "View"}
                  </Button>
                </div>

                {/* Player bar */}
                {t.currentPlayers > 0 && (
                  <div className="mt-3">
                    <div className="w-full h-1 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${(t.currentPlayers / t.maxPlayers) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
