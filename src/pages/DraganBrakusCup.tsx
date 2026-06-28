// /dragan-brakus — Dragan Brakus Cup landing page.
// Full tournament info + Event JSON-LD so Google Search / Maps / GBP can pick
// it up as a structured event tied to the MasterChess organization.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Clock, Users, ShieldCheck, MapPin, Calendar,
  Zap, Target, Award, ChevronRight,
} from "lucide-react";

const EVENT_NAME = "Dragan Brakus Cup";
const EVENT_START = "2026-06-30T16:00:00+02:00"; // 16:00 CET
const EVENT_END = "2026-06-30T19:30:00+02:00";
const SITE = "https://masterchess.live";
const URL = `${SITE}/dragan-brakus`;

export default function DraganBrakusCup() {
  const [lobbyId, setLobbyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("id")
        .ilike("name", "%Dragan Brakus%")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) setLobbyId(data.id);
    })();
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": ["Event", "SportsEvent"],
      name: EVENT_NAME,
      description:
        "Dragan Brakus Cup — official MasterChess Blitz tournament. 7-round Swiss, 3+2 time control, live leaderboard, fair-play monitored.",
      startDate: EVENT_START,
      endDate: EVENT_END,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      sport: "Chess",
      url: URL,
      image: `${SITE}/og-image.jpg`,
      maximumAttendeeCapacity: 256,
      location: [
        { "@type": "VirtualLocation", url: URL },
        {
          "@type": "Place",
          name: "MasterChess",
          url: SITE,
          address: { "@type": "PostalAddress", addressCountry: "RS" },
        },
      ],
      organizer: {
        "@type": "Organization",
        name: "MasterChess",
        url: SITE,
        logo: `${SITE}/og-image.jpg`,
      },
      performer: { "@type": "Organization", name: "MasterChess Community" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: URL,
        validFrom: "2026-06-01T00:00:00+02:00",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Tournaments", item: `${SITE}/tournaments` },
        { "@type": "ListItem", position: 3, name: EVENT_NAME, item: URL },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Dragan Brakus Cup — Official MasterChess Blitz Tournament"
        description="Dragan Brakus Cup — 30 June 2026, 16:00 CET. 7-round Swiss Blitz (3+2), live leaderboard, fair-play monitored. Register on MasterChess."
        path="/dragan-brakus"
        type="event"
        jsonLd={jsonLd}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <section className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 md:p-12 mb-10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 mb-3">
            MasterChess Official Event
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Dragan Brakus Cup
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            A competitive Blitz tournament series organized by MasterChess and
            published as an official Google Maps event.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Calendar className="h-4 w-4 text-yellow-400" /> 30 June 2026 · 16:00 CET
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock className="h-4 w-4 text-yellow-400" /> Blitz 3+2
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Users className="h-4 w-4 text-yellow-400" /> 10–256 players
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Target className="h-4 w-4 text-yellow-400" /> 7-round Swiss
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <MapPin className="h-4 w-4 text-yellow-400" /> Online · MasterChess.live
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
              <Link to={lobbyId ? `/tournaments/${lobbyId}/register` : "/tournaments"}>
                Register now <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            {lobbyId && (
              <Button asChild size="lg" variant="outline">
                <Link to={`/tournaments/${lobbyId}`}>Open lobby</Link>
              </Button>
            )}
          </div>
        </section>

        {/* Format grid */}
        <section className="grid md:grid-cols-2 gap-4 mb-10">
          <InfoCard icon={<Zap className="h-5 w-5" />} title="Format">
            Blitz 3 min + 2 sec increment · 7-round Swiss · no elimination ·
            every player plays every round.
          </InfoCard>
          <InfoCard icon={<Target className="h-5 w-5" />} title="Pairing (Swiss)">
            Equal-points pairing, performance-aware, repeat opponents avoided,
            balanced color distribution.
          </InfoCard>
          <InfoCard icon={<Trophy className="h-5 w-5" />} title="Scoring">
            Win 1.0 · Draw 0.5 · Loss 0.0. Final ranking = total points after 7
            rounds.
          </InfoCard>
          <InfoCard icon={<Award className="h-5 w-5" />} title="Tie-breaks">
            1) Buchholz · 2) Direct encounter · 3) Number of wins.
          </InfoCard>
          <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Fair play">
            Engine assistance strictly forbidden. Anti-cheat is live every round;
            suspicious games are reviewed and may be voided.
          </InfoCard>
          <InfoCard icon={<Clock className="h-5 w-5" />} title="Check-in">
            Check-in opens 30 min before R1 and closes at 16:00 CET. Late
            check-in may miss the first pairing.
          </InfoCard>
        </section>

        {/* Schedule */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Round schedule</h2>
          <Card className="divide-y divide-white/5">
            {[
              ["Round 1", "16:00 CET", "Initial pairings"],
              ["Round 2", "after R1", "Swiss pairing on results"],
              ["Round 3", "after R2", "Updated standings"],
              ["Round 4", "after R3", "Mid-tournament separation"],
              ["Round 5", "after R4", "Top group forms"],
              ["Round 6", "after R5", "Final ranking battles"],
              ["Round 7", "after R6", "Decisive final round"],
            ].map(([r, t, d]) => (
              <div key={r} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-semibold text-yellow-300 w-24">{r}</span>
                <span className="text-muted-foreground w-32">{t}</span>
                <span className="flex-1 text-right md:text-left md:pl-6">{d}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Awards */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Awards</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ["🏆", "Champion Trophy", "Dragan Brakus Cup winner"],
              ["🥈", "Silver Medal", "2nd place"],
              ["🥉", "Bronze Medal", "3rd place"],
              ["🤝", "Fair Play Award", "Cleanest play"],
              ["⭐", "Best Junior", "Top U18 finisher"],
              ["🎖️", "Special Honor", "Organizer's pick"],
            ].map(([e, t, d]) => (
              <Card key={t} className="p-4">
                <div className="text-2xl">{e}</div>
                <div className="font-semibold mt-1">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Series */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h2 className="text-xl font-bold mb-2">Series structure</h2>
          <p className="text-sm text-muted-foreground">
            The Dragan Brakus Cup is a continuous series: Cup #1 → #2 → #3 →
            ongoing weekly editions. Subscribe to MasterChess updates to be
            notified when the next edition opens for registration.
          </p>
        </section>

        <div className="text-center">
          <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
            <Link to={lobbyId ? `/tournaments/${lobbyId}/register` : "/tournaments"}>
              Register for the Dragan Brakus Cup
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-yellow-400">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{children}</p>
    </Card>
  );
}
