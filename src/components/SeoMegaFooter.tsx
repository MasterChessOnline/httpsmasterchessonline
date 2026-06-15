// SEO-focused internal-links mega footer. Rendered on every SEO landing
// page (EN + SR) so Google crawls all our long-tail pages from any entry.
// Visual style stays light to not steal attention from the page's CTAs.
import { Link } from "react-router-dom";

interface Group {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const GROUPS: Group[] = [
  {
    title: "Play",
    links: [
      { label: "Play online", href: "/play/online" },
      { label: "Play as guest", href: "/play-guest" },
      { label: "Play vs computer", href: "/play" },
      { label: "Play vs friend", href: "/viral" },
      { label: "Daily puzzle", href: "/daily-puzzle" },
      { label: "Puzzles", href: "/puzzles" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Battle Royale", href: "/battle-royale" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Lessons", href: "/learn" },
      { label: "How to play chess", href: "/learn/how-to-play-chess" },
      { label: "Best openings for beginners", href: "/learn/best-chess-openings-for-beginners" },
      { label: "Chess piece values", href: "/piece-values" },
      { label: "Checkmate patterns", href: "/learn/checkmate-patterns" },
      { label: "Glossary", href: "/learn/glossary" },
      { label: "Strategy for beginners", href: "/learn/chess-strategy-for-beginners" },
      { label: "How to improve", href: "/learn/how-to-improve-at-chess" },
    ],
  },
  {
    title: "Openings",
    links: [
      { label: "Opening trainer", href: "/openings" },
      { label: "Sicilian Defense", href: "/openings/sicilian-defense" },
      { label: "Italian Game", href: "/openings/italian-game" },
      { label: "Queen's Gambit", href: "/openings/queens-gambit" },
      { label: "Ruy López", href: "/openings/ruy-lopez" },
      { label: "Caro-Kann", href: "/openings/caro-kann" },
      { label: "French Defense", href: "/openings/french-defense" },
      { label: "King's Indian", href: "/openings/kings-indian" },
    ],
  },
  {
    title: "Bots",
    links: [
      { label: "All bots", href: "/play" },
      { label: "Beat Marcus (400)", href: "/beat/marcus" },
      { label: "Beat Sofia (800)", href: "/beat/sofia" },
      { label: "Beat Viktor (1200)", href: "/beat/viktor" },
      { label: "Beat Elena (1600)", href: "/beat/elena" },
      { label: "Beat Magnus-bot (2000)", href: "/beat/magnus-bot" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Rating calculator", href: "/rating-calculator" },
      { label: "All chess tools", href: "/tools" },
      { label: "Game analysis", href: "/analysis" },
      { label: "ELO tiers", href: "/elo" },
      { label: "Famous games", href: "/famous-games" },
      { label: "Grandmasters", href: "/players" },
      { label: "❤ Support the project", href: "/supporter" },
    ],
  },
  {
    title: "Regions (Srpski)",
    links: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šah protiv prijatelja", href: "/sr/sah-protiv-prijatelja" },
      { label: "Šah bez registracije", href: "/sr/sah-bez-registracije" },
      { label: "Šah protiv kompjutera", href: "/sr/sah-protiv-kompjutera" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
      { label: "Šahovska otvaranja", href: "/sr/sah-otvaranja" },
      { label: "Šahovske zagonetke", href: "/sr/sahovske-zagonetke" },
    ],
  },
];

export default function SeoMegaFooter() {
  return (
    <footer className="mt-16 border-t border-border/40 pt-10 pb-12 px-4 bg-background/60">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <h3 className="font-display text-xs uppercase tracking-widest text-amber-300/90 mb-3">
                {g.title}
              </h3>
              <ul className="space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors leading-snug"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <Link to="/" className="font-display text-base font-bold tracking-tight text-foreground">
            MasterChess
          </Link>
          <p>Free chess online — no ads, no paywall, real humans.</p>
        </div>
      </div>
    </footer>
  );
}
