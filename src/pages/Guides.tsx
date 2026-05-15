import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Target, Crown, Sparkles } from "lucide-react";

const OPENINGS = [
  ["italian-game", "Italian Game"],
  ["ruy-lopez", "Ruy Lopez"],
  ["sicilian-defense", "Sicilian Defense"],
  ["french-defense", "French Defense"],
  ["caro-kann", "Caro-Kann Defense"],
  ["queens-gambit", "Queen's Gambit"],
  ["kings-indian", "King's Indian Defense"],
  ["nimzo-indian", "Nimzo-Indian Defense"],
  ["english-opening", "English Opening"],
  ["london-system", "London System"],
  ["scandinavian", "Scandinavian Defense"],
  ["pirc-defense", "Pirc Defense"],
  ["alekhine-defense", "Alekhine Defense"],
  ["scotch-game", "Scotch Game"],
  ["vienna-game", "Vienna Game"],
];

const RATINGS = [
  ["beginner-800", "How to Reach 800 ELO"],
  ["1000-elo", "How to Reach 1000 ELO"],
  ["1200-elo", "How to Reach 1200 ELO"],
  ["1400-elo", "How to Reach 1400 ELO"],
  ["1600-elo", "How to Reach 1600 ELO"],
  ["1800-elo", "How to Reach 1800 ELO"],
  ["2000-elo", "How to Reach 2000 ELO"],
  ["2200-elo", "How to Reach Master Level"],
];

const SKILLS = [
  ["endgame-king-pawn", "King & Pawn Endgames"],
  ["endgame-rook", "Rook Endgames Made Simple"],
  ["middlegame-plans", "Middlegame Planning"],
  ["pawn-structures", "Pawn Structures Guide"],
  ["tactical-patterns", "10 Tactical Patterns"],
  ["calculation-training", "Calculation Without Puzzles"],
  ["time-management", "Time Management in Blitz"],
  ["mental-game", "The Mental Game of Chess"],
];

export default function Guides() {
  const all = [...OPENINGS, ...RATINGS, ...SKILLS];
  return (
    <>
      <Helmet>
        <title>Chess Guides — Openings, Ratings, Endgames | MasterChess</title>
        <meta
          name="description"
          content="Free in-depth chess guides: openings, rating climbs from 800 to 2200 ELO, endgames, middlegame plans, and tactical training. No puzzles — real chess."
        />
        <link rel="canonical" href="https://masterchess.live/guides" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "MasterChess Chess Guides",
          url: "https://masterchess.live/guides",
          hasPart: all.map(([slug, title]) => ({
            "@type": "Article",
            name: title,
            url: `https://masterchess.live/guide/${slug}`,
          })),
        })}</script>
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs uppercase tracking-widest mb-4">
              <Sparkles className="h-3 w-3" /> Knowledge Library
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              Chess Guides
            </h1>
            <p className="text-zinc-400 mt-4 max-w-2xl mx-auto">
              Deep, practical articles to climb from beginner to master — with no fake puzzles.
            </p>
          </motion.div>

          <Section icon={<BookOpen />} title="Opening Repertoire" items={OPENINGS} color="amber" />
          <Section icon={<Trophy />} title="Climb the Ratings" items={RATINGS} color="emerald" />
          <Section icon={<Target />} title="Skills & Endgames" items={SKILLS} color="sky" />

          <div className="mt-16 text-center">
            <Link
              to="/play/online"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold hover:scale-105 transition-transform"
            >
              <Crown className="h-5 w-5" /> Apply It — Play Now
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({
  icon,
  title,
  items,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[][];
  color: "amber" | "emerald" | "sky";
}) {
  const ring = {
    amber: "hover:border-amber-400/40 hover:bg-amber-400/5",
    emerald: "hover:border-emerald-400/40 hover:bg-emerald-400/5",
    sky: "hover:border-sky-400/40 hover:bg-sky-400/5",
  }[color];
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="text-amber-300">{icon}</div>
        <h2 className="text-2xl font-semibold text-zinc-100">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(([slug, label]) => (
          <Link
            key={slug}
            to={`/guide/${slug}`}
            className={`block rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 transition ${ring}`}
          >
            <div className="text-zinc-100 font-medium">{label}</div>
            <div className="text-xs text-zinc-500 mt-1">Read guide →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
