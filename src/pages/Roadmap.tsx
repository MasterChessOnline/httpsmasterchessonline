import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import EmailCaptureSection from "@/components/EmailCaptureSection";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ROADMAP_ITEMS, CHANGELOG, type RoadmapStatus } from "@/lib/roadmap-data";
import { ChevronUp, Rocket, Hammer, CheckCircle2, History, MessageSquare } from "lucide-react";

const COLUMNS: { status: RoadmapStatus; label: string; icon: typeof Rocket }[] = [
  { status: "planned", label: "Planned", icon: Rocket },
  { status: "in_progress", label: "In progress", icon: Hammer },
  { status: "released", label: "Released", icon: CheckCircle2 },
];

export default function Roadmap() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setCounts({});
      setMine(new Set());
      return;
    }
    const { data } = await supabase.from("feature_votes").select("feature_key, user_id");
    const next: Record<string, number> = {};
    const own = new Set<string>();
    (data || []).forEach((row: any) => {
      next[row.feature_key] = (next[row.feature_key] || 0) + 1;
      if (row.user_id === user.id) own.add(row.feature_key);
    });
    setCounts(next);
    setMine(own);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleVote = async (key: string) => {
    if (!user) {
      toast({ title: "Sign in to vote", description: "Votes are one per account." });
      return;
    }
    setBusy(key);
    if (mine.has(key)) {
      await supabase.from("feature_votes").delete().eq("user_id", user.id).eq("feature_key", key);
    } else {
      await supabase.from("feature_votes").insert({ user_id: user.id, feature_key: key });
    }
    await load();
    setBusy(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="MasterChess Roadmap — vote on what we build next"
        description="See what is planned, in progress and already shipped on MasterChess, vote for the features you want most and read the full changelog."
        path="/roadmap"
      />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <header className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-widest text-primary mb-3">
            Public roadmap
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            You decide what we build next
          </h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Every feature below is real work on our board. One vote per account — the most wanted
            ideas move up first.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
          {COLUMNS.map((col) => (
            <section key={col.status} aria-labelledby={`col-${col.status}`}>
              <h2
                id={`col-${col.status}`}
                className="flex items-center gap-2 font-display text-lg font-semibold text-foreground mb-3"
              >
                <col.icon className="h-4 w-4 text-primary" /> {col.label}
              </h2>
              <div className="space-y-3">
                {ROADMAP_ITEMS.filter((i) => i.status === col.status).map((item) => {
                  const voted = mine.has(item.key);
                  return (
                    <article
                      key={item.key}
                      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 flex gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleVote(item.key)}
                        disabled={busy === item.key}
                        aria-pressed={voted}
                        aria-label={`Vote for ${item.title}`}
                        className={`shrink-0 flex flex-col items-center justify-center w-12 rounded-lg border px-1 py-1.5 transition-colors ${
                          voted
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}
                      >
                        <ChevronUp className="h-4 w-4" />
                        <span className="font-mono text-xs font-bold">{counts[item.key] || 0}</span>
                      </button>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        {item.eta && (
                          <p className="text-[10px] uppercase tracking-wider text-primary mt-2">
                            {item.eta}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {!user && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to vote and see live vote counts.
          </p>
        )}

        <div className="max-w-2xl mx-auto mt-10 rounded-xl border border-border/50 bg-card/60 p-5 text-center">
          <MessageSquare className="h-5 w-5 text-primary mx-auto mb-2" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Missing an idea, or found a bug?
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Send it over and it can land on this board.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link to="/contact">
              <Button size="sm">Send feedback</Button>
            </Link>
            <Link to="/discord">
              <Button size="sm" variant="outline">
                Join the community
              </Button>
            </Link>
          </div>
        </div>

        <section className="max-w-3xl mx-auto mt-14" aria-labelledby="changelog-heading">
          <h2
            id="changelog-heading"
            className="flex items-center gap-2 font-display text-2xl font-bold text-foreground mb-5"
          >
            <History className="h-5 w-5 text-primary" /> Changelog
          </h2>
          <div className="space-y-4">
            {CHANGELOG.map((entry) => (
              <article
                key={entry.date}
                className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{entry.version}</h3>
                  <time className="text-[11px] text-muted-foreground" dateTime={entry.date}>
                    {new Date(entry.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <ul className="space-y-1.5">
                  {entry.items.map((line) => (
                    <li key={line} className="flex gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <EmailCaptureSection
          heading="Get shipped-feature alerts"
          subheading="We email when a roadmap item goes live, plus the daily puzzle."
          source="roadmap"
        />
      </main>
      <Footer />
    </div>
  );
}
