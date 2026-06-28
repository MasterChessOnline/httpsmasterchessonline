// /dragan-brakus — Dragan Brakus Cup landing page.
// Full tournament info + Event JSON-LD so Google Search / Maps / GBP can pick
// it up as a structured event tied to the MasterChess organization.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Trophy, Clock, Users, ShieldCheck, MapPin, Calendar,
  Zap, Target, Award, ChevronRight, Coins, Sparkles, ExternalLink, Loader2,
} from "lucide-react";

type Prize = {
  place_from: number; place_to: number; label: string;
  coins: number; badge_key: string | null; cosmetic_key: string | null;
  is_special: boolean; sort_order: number;
};
type Sponsor = {
  name: string; logo_url: string | null; website: string | null;
  tier: "title" | "gold" | "silver" | "community"; display_order: number;
};


const EVENT_NAME = "Dragan Brakus Cup";
const EVENT_START = "2026-06-30T17:00:00+02:00"; // 17:00 CEST / 15:00 UTC
const EVENT_END = "2026-06-30T20:30:00+02:00";
const SITE = "https://masterchess.live";
const URL = `${SITE}/dragan-brakus`;

export default function DraganBrakusCup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [maxPlayers, setMaxPlayers] = useState<number>(500);
  const [externalResultsUrl, setExternalResultsUrl] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [fideId, setFideId] = useState("");
  const [savingFide, setSavingFide] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("tournaments")
        .select("id, max_players, external_results_url")
        .ilike("name", "%Dragan Brakus%")
        .order("starts_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data?.id) return;
      setLobbyId(data.id);
      setMaxPlayers(data.max_players || 500);
      setExternalResultsUrl((data as any).external_results_url || null);
      const [{ count }, prizesRes, sponsorsRes] = await Promise.all([
        supabase.from("tournament_registrations")
          .select("user_id", { count: "exact", head: true })
          .eq("tournament_id", data.id),
        supabase.from("tournament_prizes")
          .select("place_from, place_to, label, coins, badge_key, cosmetic_key, is_special, sort_order")
          .eq("tournament_id", data.id)
          .order("sort_order"),
        supabase.from("tournament_sponsors")
          .select("name, logo_url, website, tier, display_order")
          .eq("tournament_id", data.id)
          .order("display_order"),
      ]);
      if (cancelled) return;
      setPlayerCount(count || 0);
      setPrizes((prizesRes.data as any) || []);
      setSponsors((sponsorsRes.data as any) || []);
    }
    load();
    const i = setInterval(load, 20000);
    return () => { cancelled = true; clearInterval(i); };
  }, []);

  const totalCoinPool = prizes.reduce((acc, p) => {
    const places = Math.max(1, p.place_to - p.place_from + 1);
    return acc + p.coins * (p.is_special ? 1 : places);
  }, 0);
  const nextMilestone = Math.min(maxPlayers, (Math.floor(playerCount / 100) + 1) * 100);

  const shareText = encodeURIComponent(
    `Dragan Brakus Cup — 9-round Swiss Blitz on MasterChess. Free entry, MasterChess loot prizes, live standings on Chess-Results. Register: ${URL}`
  );



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
        description="Dragan Brakus Cup — 30 June 2026, 17:00 CEST. 9-round Swiss Blitz (3+2), up to 500 players, live pairings, FIDE-style tie-breaks, Chess-Results export."
        path="/dragan-brakus"
        type="website"
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
            A professional online Blitz tournament organized by MasterChess.
            All games are played on MasterChess; final files are exported for
            publication on Chess-Results Serbia.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Calendar className="h-4 w-4 text-yellow-400" /> 30 June 2026 · 17:00 CEST
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Clock className="h-4 w-4 text-yellow-400" /> Blitz 3+2
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Users className="h-4 w-4 text-yellow-400" /> Up to 500 players
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Target className="h-4 w-4 text-yellow-400" /> 9-round Swiss
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
            <Button asChild size="lg" variant="outline">
              <Link to="/dragan-brakus/live">Live standings</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dragan-brakus/press">Press kit</Link>
            </Button>
            {lobbyId && (
              <Button asChild size="lg" variant="outline">
                <Link to={`/tournaments/${lobbyId}`}>Open lobby</Link>
              </Button>
            )}
          </div>

          {/* Live counter + prize escalator */}
          <div className="mt-8 grid sm:grid-cols-3 gap-3">
            <Card className="p-4 border-yellow-500/30">
              <div className="text-xs uppercase text-muted-foreground">Players registered</div>
              <div className="text-3xl font-bold text-yellow-300">{playerCount} <span className="text-base text-muted-foreground">/ {maxPlayers}</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500" style={{ width: `${Math.min(100, (playerCount / maxPlayers) * 100)}%` }} />
              </div>
            </Card>
            <Card className="p-4 border-yellow-500/30">
              <div className="text-xs uppercase text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" /> MasterChess loot pool</div>
              <div className="text-3xl font-bold text-yellow-300">{totalCoinPool.toLocaleString()} <span className="text-sm text-muted-foreground">coins</span></div>
              <div className="text-xs text-muted-foreground mt-1">+ exclusive badges & cosmetics. No cash — pure MasterChess rewards.</div>
            </Card>

            <Card className="p-4 border-yellow-500/30">
              <div className="text-xs uppercase text-muted-foreground">Share the cup</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <a className="rounded-md bg-green-600 text-white text-xs px-2.5 py-1.5" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${shareText}`}>WhatsApp</a>
                <a className="rounded-md bg-sky-500 text-white text-xs px-2.5 py-1.5" target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(URL)}&text=${shareText}`}>Telegram</a>
                <a className="rounded-md bg-black text-white text-xs px-2.5 py-1.5 border border-white/20" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${shareText}`}>X</a>
                <a className="rounded-md bg-blue-700 text-white text-xs px-2.5 py-1.5" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`}>Facebook</a>
              </div>
            </Card>
          </div>
        </section>


        {/* Format grid */}
        <section className="grid md:grid-cols-2 gap-4 mb-10">
          <InfoCard icon={<Zap className="h-5 w-5" />} title="Format">
            Blitz 3 min + 2 sec increment · 9-round Swiss · no elimination ·
            every player plays every round.
          </InfoCard>
          <InfoCard icon={<Target className="h-5 w-5" />} title="Pairing (Swiss)">
            Equal-points pairing, performance-aware, repeat opponents avoided,
            balanced color distribution.
          </InfoCard>
          <InfoCard icon={<Trophy className="h-5 w-5" />} title="Scoring">
            Win 1.0 · Draw 0.5 · Loss 0.0. Final ranking = total points after 9
            rounds.
          </InfoCard>
          <InfoCard icon={<Award className="h-5 w-5" />} title="Tie-breaks">
            Buchholz · Buchholz Cut 1 · Sonneborn-Berger · Progressive ·
            Performance Rating · Direct encounter · Wins.
          </InfoCard>
          <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Fair play">
            Engine assistance strictly forbidden. Anti-cheat is live every round;
            suspicious games are reviewed and may be voided.
          </InfoCard>
          <InfoCard icon={<Clock className="h-5 w-5" />} title="Check-in">
            Check-in 16:45–16:55 CEST. Roster locks at 16:57, pairings published
            16:59, Round 1 starts 17:00 sharp.
          </InfoCard>
        </section>

        {/* Schedule */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Full schedule (Europe/Belgrade, CEST)</h2>
          <Card className="divide-y divide-white/5">
            {[
              ["09:00", "Tournament & registration open"],
              ["16:30", "Registration closes"],
              ["16:45", "Check-in opens"],
              ["16:55", "Check-in closes"],
              ["16:57", "Final player list locked"],
              ["16:58", "Swiss pairings generated"],
              ["16:59", "Pairings published"],
              ["17:00", "Round 1"],
              ["17:12", "Round 2"],
              ["17:24", "Round 3"],
              ["17:36", "Round 4"],
              ["17:48", "Round 5"],
              ["18:00", "Round 6"],
              ["18:12", "Round 7"],
              ["18:24", "Round 8"],
              ["18:36", "Round 9"],
              ["18:48", "Final standings"],
              ["18:55", "Awards"],
              ["19:00", "Tournament ends"],
            ].map(([t, d]) => (
              <div key={t + d} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-semibold text-yellow-300 w-20">{t}</span>
                <span className="flex-1">{d}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* MasterChess loot ladder */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl font-bold">MasterChess Loot Ladder</h2>
            <div className="text-xs text-muted-foreground">No cash prizes — coins, badges & cosmetics only.</div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(prizes.length ? prizes : []).map((p) => {
              const placeLabel = p.is_special
                ? "Special"
                : p.place_from === p.place_to
                  ? `#${p.place_from}`
                  : `#${p.place_from}–${p.place_to}`;
              return (
                <Card key={`${p.sort_order}-${p.label}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{p.label}</div>
                    <Badge variant="outline" className="text-xs">{placeLabel}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-yellow-300">
                      <Coins className="h-3.5 w-3.5" /> {p.coins.toLocaleString()} coins
                    </span>
                    {p.badge_key && (
                      <span className="inline-flex items-center gap-1 text-fuchsia-300">
                        <Award className="h-3.5 w-3.5" /> badge
                      </span>
                    )}
                    {p.cosmetic_key && (
                      <span className="inline-flex items-center gap-1 text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5" /> cosmetic
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
            {prizes.length === 0 && (
              <Card className="p-4 col-span-full text-sm text-muted-foreground">
                Prize ladder loading…
              </Card>
            )}
          </div>
        </section>

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Powered by</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sponsors.map((s) => (
                <Card key={s.name} className="p-4 flex items-center gap-3">
                  {s.logo_url && (
                    <img src={s.logo_url} alt={s.name} className="h-10 w-10 rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs uppercase text-muted-foreground">{s.tier}</div>
                  </div>
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noreferrer" className="text-yellow-300 text-sm inline-flex items-center gap-1">
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Become a partner — write to <a className="underline" href="mailto:nikola@masterchess.live">nikola@masterchess.live</a>.
            </p>
          </section>
        )}

        {/* Chess-Results Serbia integration */}
        <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <h2 className="text-xl font-bold mb-1">Chess-Results Serbia</h2>
              <p className="text-sm text-muted-foreground">
                Listed on{" "}
                <a href="https://chess-results.com" className="underline" target="_blank" rel="noreferrer">chess-results.com</a>{" "}
                under the short name <strong className="text-yellow-300">DB Chess Cup</strong> (SRB federation).
              </p>
            </div>
            <Badge variant="outline" className={externalResultsUrl ? "border-green-500/40 text-green-300" : "border-yellow-500/40 text-yellow-300"}>
              {externalResultsUrl ? "Listed" : "Pending submission"}
            </Badge>
          </div>

          {externalResultsUrl ? (
            <a
              href={externalResultsUrl}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 text-black px-4 py-2 text-sm font-semibold"
            >
              Open on Chess-Results <ExternalLink className="h-4 w-4" />
            </a>
          ) : lobbyId ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Submission pack is auto-generated. Download the three files, then
                send them to <code className="text-yellow-300">chess-results@swiss-manager.at</code>.
                Chess-Results desk usually publishes within 24–48 hours.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  className="rounded-md bg-yellow-500 text-black px-3 py-2 font-semibold hover:bg-yellow-400"
                  href={`https://kicabdwgdyabibioycbq.supabase.co/functions/v1/tournament-export?tournament_id=${lobbyId}&format=announcement-trf`}
                  target="_blank" rel="noreferrer"
                >
                  1. Download announcement.trf
                </a>
                <a
                  className="rounded-md bg-yellow-500 text-black px-3 py-2 font-semibold hover:bg-yellow-400"
                  href={`https://kicabdwgdyabibioycbq.supabase.co/functions/v1/tournament-export?tournament_id=${lobbyId}&format=swiss-manager-tur`}
                  target="_blank" rel="noreferrer"
                >
                  2. Download .tur (Swiss-Manager)
                </a>
                <a
                  className="rounded-md bg-yellow-500 text-black px-3 py-2 font-semibold hover:bg-yellow-400"
                  href={`https://kicabdwgdyabibioycbq.supabase.co/functions/v1/tournament-export?tournament_id=${lobbyId}&format=submission-email`}
                  target="_blank" rel="noreferrer"
                >
                  3. Download email body
                </a>
                <a
                  className="rounded-md border border-yellow-500/40 px-3 py-2 hover:bg-yellow-500/10"
                  href={`mailto:chess-results@swiss-manager.at?subject=${encodeURIComponent("Tournament announcement — DB Chess Cup (SRB)")}&body=${encodeURIComponent("Dear Chess-Results desk,\n\nPlease publish the attached tournament on Chess-Results Serbia.\nShort name: DB Chess Cup\nFull name: Dragan Brakus Cup\nFederation: SRB\nStart: 2026-06-30 17:00 CEST\nFormat: 9-round Swiss Blitz 3+2\nWebsite: https://masterchess.live/dragan-brakus\n\nFiles attached.\n\nThank you,\nMasterChess.live\nnikola@masterchess.live")}`}
                >
                  4. Open mail client →
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Full guide: <Link className="underline" to="/docs/chess-results">submission workflow</Link>.
              </p>
            </div>
          ) : null}
        </section>


        {/* Exports for Chess-Results */}
        {lobbyId && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
            <h2 className="text-xl font-bold mb-2">Post-tournament exports</h2>
            <p className="text-sm text-muted-foreground mb-4">
              After the final round, download official tournament files (final TRF,
              PGN archive, crosstable, standings with all tie-breaks).
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {(["trf", "pgn", "json", "csv-standings", "csv-crosstable"] as const).map((fmt) => (
                <a
                  key={fmt}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  href={`https://kicabdwgdyabibioycbq.supabase.co/functions/v1/tournament-export?tournament_id=${lobbyId}&format=${fmt}`}
                  target="_blank" rel="noreferrer"
                >
                  Download {fmt.toUpperCase()}
                </a>
              ))}
            </div>
          </section>
        )}

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
