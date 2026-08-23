// /open — the honest numbers page.
//
// Trust is the hardest thing for a new chess site to earn, and the cheapest way
// to earn it is to publish the truth before anyone asks: exactly how many
// players there are, how many games get played, and what is still missing.
// Nothing here is estimated or inflated; every figure is read live from the
// database via the public get_open_stats() aggregate.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Swords, Radio, CalendarClock, ArrowRight, ShieldCheck } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OpenStats {
  players_total: number;
  players_30d: number;
  online_games_total: number;
  online_games_30d: number;
  bot_games_30d: number;
  live_games_now: number;
  rsvp_today: number;
}

export default function Open() {
  const [stats, setStats] = useState<OpenStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase.rpc as any)("get_open_stats");
      if (error || !data) {
        setFailed(true);
        return;
      }
      setStats(data as OpenStats);
    })();
  }, []);

  const n = (v?: number) => (typeof v === "number" ? v.toLocaleString() : "—");

  const cards = [
    { icon: Users, label: "Registered players", value: n(stats?.players_total), sub: `${n(stats?.players_30d)} joined in the last 30 days` },
    { icon: Swords, label: "Online games played", value: n(stats?.online_games_total), sub: `${n(stats?.online_games_30d)} in the last 30 days` },
    { icon: Radio, label: "Live games right now", value: n(stats?.live_games_now), sub: "Human vs human only — bots never counted" },
    { icon: CalendarClock, label: "Signed up for tonight", value: n(stats?.rsvp_today), sub: "Prime Time is every day at 20:00" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Open Numbers — How Big Is MasterChess Really?"
        description="Live, unedited MasterChess numbers: registered players, games played, live games right now. No inflated stats, no fake players."
        path="/open"
        type="website"
      />
      <Navbar />

      <main className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Radical transparency</p>
        <h1 className="mt-2 font-display text-3xl sm:text-5xl font-black">
          Our real numbers, unedited
        </h1>
        <p className="mt-4 text-sm sm:text-base text-muted-foreground">
          Most chess sites hide how small they are. We publish it live. MasterChess is young, and
          every figure below is read straight from our database the second you open this page — no
          rounding up, no bot games mixed into human counts, no invented "players online".
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-display text-3xl font-black leading-none">{c.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground/80 leading-snug">{c.sub}</p>
            </div>
          ))}
        </div>

        {failed && (
          <p className="mt-4 text-xs text-muted-foreground">
            Live figures are temporarily unavailable — the numbers above will fill in as soon as the
            backend answers again.
          </p>
        )}

        <section className="mt-12">
          <h2 className="font-display text-xl sm:text-2xl font-bold">What this means for you</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">You will meet real people, not bots.</span>{" "}
              Every bot on MasterChess is labelled a bot. We never fill a matchmaking queue with
              software pretending to be human.
            </li>
            <li>
              <span className="font-semibold text-foreground">Small has an upside.</span> At this size
              you can land on the leaderboard in a week, and a message to us gets answered the same
              day — by the person who builds the site.
            </li>
            <li>
              <span className="font-semibold text-foreground">Prime Time solves the empty queue.</span>{" "}
              Instead of pretending players are always online, we pick one hour — 20:00 every day —
              and everyone queues together.
            </li>
            <li>
              <span className="font-semibold text-foreground">Free, with no ads and no subscription.</span>{" "}
              Nothing on this page is behind a paywall, now or later.
            </li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
            <ShieldCheck className="h-4 w-4" /> Be part of the number above
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold">Join tonight's Prime Time</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a free account, tap "I'll play tonight", and show up at 20:00. That is how a small
            board fills up.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-emerald-500 text-black hover:bg-emerald-400">
              <Link to="/signup?from=open_stats">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/play/online">
                Go to Prime Time <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
