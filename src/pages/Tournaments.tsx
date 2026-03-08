import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Clock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const tournaments = [
  { name: "Daily Blitz Arena", time: "3+0", players: 128, status: "Live", icon: Zap },
  { name: "Weekend Rapid Open", time: "10+5", players: 256, status: "Registering", icon: Clock },
  { name: "Monthly Classical", time: "30+15", players: 64, status: "Upcoming", icon: Trophy },
  { name: "Bullet Brawl", time: "1+0", players: 512, status: "Live", icon: Zap },
];

const statusColors: Record<string, string> = {
  Live: "bg-accent text-accent-foreground",
  Registering: "bg-primary/10 text-primary",
  Upcoming: "bg-muted text-muted-foreground",
};

const Tournaments = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
        <span className="text-gradient-gold">Tournaments</span>
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Compete in live tournaments and climb the leaderboard.
      </p>

      <div className="mx-auto max-w-2xl space-y-4" role="list" aria-label="Tournament list">
        {tournaments.map((t) => (
          <article
            key={t.name}
            className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-glow"
            role="listitem"
          >
            <div className="hidden sm:flex rounded-lg bg-primary/10 p-3">
              <t.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-base font-semibold text-foreground truncate">{t.name}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{t.time}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" aria-hidden="true" />{t.players} players</span>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[t.status]}`}>
              {t.status}
            </span>
            <Button size="sm" variant={t.status === "Live" ? "default" : "outline"} aria-label={`Join ${t.name}`}>
              {t.status === "Live" ? "Join" : "Register"}
            </Button>
          </article>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Tournaments;
