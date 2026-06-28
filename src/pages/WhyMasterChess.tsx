// /why-masterchess — partner / sponsor / investor pitch page.
// Designed for the IT-creator meeting Nikola has lined up: a single URL that
// answers "why should I back / cover / partner with MasterChess?".
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, Crown, Globe2, Trophy, Sparkles, Users, Code2, ShieldCheck,
} from "lucide-react";

const URL = "https://masterchess.live/why-masterchess";

export default function WhyMasterChess() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Why MasterChess",
    url: URL,
    about: {
      "@type": "Organization",
      name: "MasterChess",
      url: "https://masterchess.live",
      founder: { "@type": "Person", name: "Nikola Sakotić" },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Why MasterChess — Partner, Sponsor & Press Pitch"
        description="MasterChess is a chess platform built by a 13-year-old founder in Belgrade. Real tournaments, real arbiters, Chess-Results integration, full SEO + News stack. Here's why partners are paying attention."
        path="/why-masterchess"
        jsonLd={[jsonLd]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <section className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 md:p-12 mb-10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 mb-3">
            Partner / Sponsor / Press
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Why <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">MasterChess</span>?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A chess platform built from scratch by a 13-year-old founder in
            Belgrade. Real tournaments, real arbiters, Chess-Results Serbia
            integration, full SEO + News stack — and a story people actually
            want to read.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
              <a href="mailto:nikola@masterchess.live?subject=MasterChess%20partnership">
                Talk to Nikola
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/nikola">Founder story</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dragan-brakus/press">Press kit</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-3 mb-10">
          {[
            ["1 100+", "indexable pages live on Google"],
            ["131", "cities covered by local-business schema"],
            ["9-round", "official Swiss tournaments with FIDE-style tiebreaks"],
            ["RSS + News-Sitemap", "Google News-ready feed"],
            ["GBP verified", "Google Business Profile + Maps event"],
            ["100% in-house", "engine, pairings, UI, AI coach, SEO stack"],
          ].map(([k, v]) => (
            <Card key={k} className="p-5">
              <div className="text-2xl font-bold text-yellow-300">{k}</div>
              <div className="text-sm text-muted-foreground">{v}</div>
            </Card>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-4 mb-10">
          <Pitch icon={<Crown />} title="The story is the asset">
            "A 13-year-old in Belgrade shipped his own chess platform, ran a
            real tournament, and got it onto Chess-Results Serbia." That's the
            headline editors don't have to invent.
          </Pitch>
          <Pitch icon={<Trophy />} title="Real tournaments, not just a play button">
            Dragan Brakus Cup runs as a 9-round Swiss with check-in window,
            anti-cheat, Buchholz / Sonneborn / Performance tiebreaks, TRF16 +
            Swiss-Manager exports, and a public live leaderboard.
          </Pitch>
          <Pitch icon={<Globe2 />} title="Built for Google, not just for chess">
            Sitemap shards, IndexNow pings, JSON-LD on every page, GBP posts,
            News-sitemap, RSS auto-discovery, per-city LocalBusiness markup.
            Discovery is engineered, not hoped for.
          </Pitch>
          <Pitch icon={<Sparkles />} title="MasterChess loot economy">
            No cash gambling. Tournament prizes are Master Coins, unique
            badges, and cosmetics — a clean, kid-safe reward loop that brands
            and parents are comfortable with.
          </Pitch>
          <Pitch icon={<Users />} title="Affiliate / creator program">
            Every partner gets a tracked link (`/r/your-code`) with per-signup
            and per-tournament-join attribution and a public dashboard.
          </Pitch>
          <Pitch icon={<ShieldCheck />} title="Safety + privacy by default">
            PII (birth year, location) is gated behind owner-only RPCs. Contact
            form is rate-limited. Anti-cheat runs every round.
          </Pitch>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-yellow-400" /> What we ask of a partner
          </h2>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>One social post or short video using your `/r/your-code` link.</li>
            <li>Optional: logo placement on `/dragan-brakus` as a Gold / Silver sponsor.</li>
            <li>Optional: co-branded round on the Dragan Brakus Cup ("Round 5 powered by …").</li>
            <li>That's it. No exclusivity, no lock-in, transparent metrics.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 mb-10">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-yellow-400" /> Next step
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Email <a className="underline" href="mailto:nikola@masterchess.live">nikola@masterchess.live</a>
            {" "}or open the founder page to get the full story, contact info,
            and partner deck links.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-400">
              <Link to="/nikola">Meet the founder</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dragan-brakus">See the cup</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Pitch({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-yellow-400">
        <span className="h-5 w-5">{icon}</span>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{children}</p>
    </Card>
  );
}
