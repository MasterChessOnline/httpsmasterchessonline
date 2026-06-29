import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Trophy, Shield, Clock, Users, Scale, Wifi, Heart, Gavel, Award, Megaphone, CheckCircle2, AlertTriangle } from "lucide-react";

const sections = [
  {
    icon: Trophy,
    title: "1. Organizer",
    body: "The DB Chess Cup is organized by the DB Chess Cup team in cooperation with the MasterChess platform.",
  },
  {
    icon: Users,
    title: "2. Tournament Format",
    bullets: [
      "Competition system: Swiss System",
      "Number of rounds: 9",
      "Time control: Blitz 3+2 (3 minutes per player + 2 seconds increment per move)",
      "The tournament is played in a single day, according to the organizer's schedule.",
    ],
  },
  {
    icon: CheckCircle2,
    title: "3. Eligibility",
    body: "All duly registered players who accept the tournament rules are eligible to participate.",
  },
  {
    icon: Scale,
    title: "4. Pairings",
    bullets: [
      "Pairings are generated automatically by Swiss System rules.",
      "Players cannot meet twice in the same tournament.",
      "After each round, players with the same or similar points play each other.",
      "Colors are assigned by the system.",
    ],
  },
  {
    icon: Award,
    title: "5. Scoring",
    bullets: [
      "Win — 1 point",
      "Draw — 0.5 points",
      "Loss — 0 points",
      "Bye (when an odd number of players is present) is awarded per system rules.",
    ],
  },
  {
    icon: Clock,
    title: "6. Game Time",
    body: "Each game is played at 3 minutes + 2 seconds per move. A game ends by checkmate, resignation, time-out, draw, or any other condition in accordance with the rules of chess.",
  },
  {
    icon: Shield,
    title: "7. Fair Play",
    body: "Strictly forbidden: chess engines (Stockfish, Leela, Komodo, etc.), AI tools, position analysis during play, third-party help, secondary devices for assistance, and any form of cheating. Penalties include: warning, loss of game, disqualification, result annulment, ban from future DB Chess Cup events.",
  },
  {
    icon: AlertTriangle,
    title: "8. Late Arrival",
    body: "A player must start their game immediately once pairings are published. Failure to appear or running out of time before the first move is registered as a loss.",
  },
  {
    icon: Wifi,
    title: "9. Internet Issues",
    body: "Each player is responsible for a stable internet connection. Issues with internet, device, or power are not grounds for a replay, unless the organizer decides otherwise due to a system-side technical issue.",
  },
  {
    icon: Heart,
    title: "10. Sporting Conduct",
    body: "All participants are expected to respect opponents and organizers, communicate politely, and act in a sporting manner. Insults, profanity, threats, discrimination, harassment, and spam are not allowed.",
  },
  {
    icon: Scale,
    title: "11. Tiebreaks",
    bullets: [
      "Buchholz",
      "Buchholz Cut 1",
      "Sonneborn-Berger",
      "Progressive Score",
      "Direct encounter (if applicable)",
      "Greater number of wins",
    ],
  },
  {
    icon: Gavel,
    title: "12. Protests",
    body: "Appeals must be submitted to the organizer immediately after the game with a clear explanation and, if possible, evidence (screenshot or game record). The decision of the organizer or chief arbiter is final.",
  },
  {
    icon: Trophy,
    title: "13. Prizes",
    body: "The type and number of prizes are determined by the organizer and announced before the tournament begins.",
  },
  {
    icon: Megaphone,
    title: "14. Publication of Results",
    body: "Results, standings, pairings, and games may be published on MasterChess, Chess-Results, social media, and official DB Chess Cup channels.",
  },
  {
    icon: CheckCircle2,
    title: "15. Acceptance of Rules",
    body: "By registering for the DB Chess Cup, each participant confirms that they accept all tournament rules, play fairly, will not use forbidden means, and accept the decisions of the organizer and arbiter as final.",
  },
];

export default function DraganBrakusRules() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/90">
      <Helmet>
        <title>DB Chess Cup — Official Rules & Regulations</title>
        <meta
          name="description"
          content="Official rules of the DB Chess Cup: 9-round Swiss, Blitz 3+2, fair play, tiebreaks, prizes, and conduct."
        />
        <link rel="canonical" href="https://masterchess.live/dragan-brakus/rules" />
      </Helmet>

      <header className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.18),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Official Regulations
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            DB Chess Cup — Rulebook
          </h1>
          <p className="mt-3 text-muted-foreground">
            Fair Play • Respect • Competition • Excellence
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              to="/dragan-brakus/register"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:opacity-90"
            >
              Register Now
            </Link>
            <Link
              to="/dragan-brakus"
              className="px-5 py-2.5 rounded-lg border border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
            >
              Tournament Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <section
              key={i}
              className="rounded-2xl border border-amber-500/15 bg-white/[0.02] backdrop-blur p-6 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-amber-100">{s.title}</h2>
                  {s.body && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>}
                  {s.bullets && (
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {s.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-amber-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300/70">DB Chess Cup Motto</p>
          <p className="mt-2 text-xl md:text-2xl font-semibold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Fair Play • Respect • Competition • Excellence
          </p>
        </div>
      </main>
    </div>
  );
}
