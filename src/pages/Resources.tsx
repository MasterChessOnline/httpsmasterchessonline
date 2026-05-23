import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ExternalLink, BookOpen, Trophy, Brain, Youtube, Library, Globe, Zap, Users, FileText, Award, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Link = { name: string; url: string; note?: string };
type Section = { title: string; icon: any; color: string; blurb: string; links: Link[] };

const SECTIONS: Section[] = [
  {
    title: "Official Federations & Governing Bodies",
    icon: Trophy,
    color: "from-amber-500/20 to-yellow-500/10",
    blurb: "Where the rules, ratings and titles actually come from.",
    links: [
      { name: "FIDE — World Chess Federation", url: "https://www.fide.com/", note: "Official body, FIDE handbook & laws of chess" },
      { name: "FIDE Ratings Database", url: "https://ratings.fide.com/", note: "Search any titled player's live rating" },
      { name: "FIDE Handbook (Laws of Chess)", url: "https://handbook.fide.com/", note: "The actual rulebook" },
      { name: "FIDE Online Arena", url: "https://arena.myfide.net/", note: "Official online rated play" },
      { name: "US Chess Federation", url: "https://new.uschess.org/" },
      { name: "English Chess Federation", url: "https://www.englishchess.org.uk/" },
      { name: "Deutscher Schachbund (Germany)", url: "https://www.schachbund.de/" },
      { name: "French Chess Federation", url: "https://www.echecs.asso.fr/" },
      { name: "Russian Chess Federation", url: "https://ruchess.ru/en/" },
      { name: "Indian Chess Federation (AICF)", url: "https://aicf.in/" },
      { name: "Chess Federation of Canada", url: "https://chess.ca/" },
      { name: "European Chess Union", url: "https://www.europechess.org/" },
    ],
  },
  {
    title: "Opening Theory & Repertoire",
    icon: BookOpen,
    color: "from-blue-500/20 to-indigo-500/10",
    blurb: "Every opening, every variation, every move-order trick.",
    links: [
      { name: "Lichess Opening Explorer", url: "https://lichess.org/analysis#explorer", note: "Master & player DB combined, free" },
      { name: "Chessable", url: "https://www.chessable.com/", note: "Spaced-repetition opening trainer" },
      { name: "365Chess Opening Explorer", url: "https://www.365chess.com/opening.php" },
      { name: "ChessTempo Opening Database", url: "https://chesstempo.com/opening-database/" },
      { name: "Chess Opening Wizard", url: "https://www.chessopeningwizard.com/" },
      { name: "ECO Codes (Wikipedia)", url: "https://en.wikipedia.org/wiki/Encyclopaedia_of_Chess_Openings" },
      { name: "Hanging Pawns Opening Series (YouTube)", url: "https://www.youtube.com/@HangingPawns", note: "Deep-dive openings from a club player's view" },
      { name: "Modern Chess Openings (book reference)", url: "https://en.wikipedia.org/wiki/Modern_Chess_Openings" },
      { name: "Chessbase Opening Encyclopedia", url: "https://shop.chessbase.com/en/categories/opening-encyclopaedia" },
      { name: "Lichess Studies (community openings)", url: "https://lichess.org/study" },
      { name: "Chesspublishing.com", url: "https://www.chesspublishing.com/", note: "Subscription-grade opening reports" },
      { name: "Caro-Kann Defense — comprehensive guide", url: "https://www.chess.com/openings/Caro-Kann-Defense" },
      { name: "Sicilian Defense — every variation", url: "https://www.chess.com/openings/Sicilian-Defense" },
      { name: "Queen's Gambit — full theory", url: "https://www.chess.com/openings/Queens-Gambit" },
      { name: "King's Indian Defense — modern lines", url: "https://www.chess.com/openings/Kings-Indian-Defense" },
    ],
  },
  {
    title: "Game Databases & Master Games",
    icon: Library,
    color: "from-emerald-500/20 to-teal-500/10",
    blurb: "Millions of historical and modern grandmaster games.",
    links: [
      { name: "ChessGames.com", url: "https://www.chessgames.com/", note: "1M+ games, searchable by player/opening" },
      { name: "Lichess Masters DB", url: "https://lichess.org/analysis#explorer", note: "OTB master DB built-in" },
      { name: "TWIC — The Week In Chess", url: "https://theweekinchess.com/", note: "Mark Crowther's weekly PGN archive since 1994" },
      { name: "PGN Mentor Game Collections", url: "https://www.pgnmentor.com/" },
      { name: "Caissabase (free PGN DB)", url: "http://caissabase.co.uk/" },
      { name: "Chess.com Master Games", url: "https://www.chess.com/games" },
      { name: "ChessTempo Game DB", url: "https://chesstempo.com/game-database/" },
      { name: "Bill Wall's Chess Page", url: "https://www.chessmaniac.com/wp/" },
      { name: "ICOfY Database (correspondence)", url: "https://www.iccf.com/" },
    ],
  },
  {
    title: "Analysis, Engines & Evaluation Tools",
    icon: Brain,
    color: "from-purple-500/20 to-fuchsia-500/10",
    blurb: "Stockfish, Lc0, neural nets and cloud eval.",
    links: [
      { name: "Stockfish — official", url: "https://stockfishchess.org/", note: "World's strongest open-source engine" },
      { name: "Leela Chess Zero (Lc0)", url: "https://lczero.org/", note: "Neural-net engine" },
      { name: "Komodo Dragon", url: "https://komodochess.com/" },
      { name: "Lichess Cloud Eval", url: "https://lichess.org/analysis" },
      { name: "ChessBase Online", url: "https://play.chessbase.com/" },
      { name: "DecodeChess", url: "https://decodechess.com/", note: "Explains engine evaluations in plain English" },
      { name: "Aimchess Analysis", url: "https://aimchess.com/" },
      { name: "Chess.com Game Review", url: "https://www.chess.com/analysis" },
      { name: "CCRL Engine Ratings", url: "https://www.computerchess.org.uk/ccrl/4040/" },
      { name: "TCEC — Top Chess Engine Championship", url: "https://tcec-chess.com/" },
      { name: "Fishtest (Stockfish testing)", url: "https://tests.stockfishchess.org/tests" },
    ],
  },
  {
    title: "Puzzles, Tactics & Training",
    icon: Zap,
    color: "from-rose-500/20 to-pink-500/10",
    blurb: "Sharpen calculation outside MasterChess too.",
    links: [
      { name: "Lichess Puzzles", url: "https://lichess.org/training", note: "Free, rated, 3M+ positions" },
      { name: "ChessTempo Tactics", url: "https://chesstempo.com/chess-tactics/" },
      { name: "Chess.com Puzzles", url: "https://www.chess.com/puzzles" },
      { name: "Listudy", url: "https://listudy.org/", note: "Spaced-repetition for Lichess studies" },
      { name: "Chess Puzzle Rush (rules)", url: "https://www.chess.com/news/view/puzzle-rush-explained" },
      { name: "Woodpecker Method (book)", url: "https://www.qualitychess.co.uk/products/3/258/the_woodpecker_method_by_axel_smith_and_hans_tikkanen/" },
      { name: "Polgar 5334 Problems", url: "https://www.amazon.com/Chess-5334-Problems-Combinations-Games/dp/1579125549" },
      { name: "Chess Endgame Trainer (Lichess)", url: "https://lichess.org/practice" },
    ],
  },
  {
    title: "Endgame Theory & Tablebases",
    icon: Award,
    color: "from-orange-500/20 to-amber-500/10",
    blurb: "Perfect play with ≤7 pieces, plus the classic manuals.",
    links: [
      { name: "Syzygy Tablebases (Lichess)", url: "https://syzygy-tables.info/", note: "Perfect play up to 7 pieces" },
      { name: "Nalimov Tablebases (ChessOK)", url: "https://www.chessok.com/?page_id=27966" },
      { name: "Dvoretsky's Endgame Manual (book)", url: "https://www.amazon.com/Dvoretskys-Endgame-Manual-Mark-Dvoretsky/dp/1949859193", note: "The bible of endgames" },
      { name: "Silman's Complete Endgame Course", url: "https://www.amazon.com/Silmans-Complete-Endgame-Course-Beginner/dp/1890085103" },
      { name: "100 Endgames You Must Know — Jesus de la Villa", url: "https://www.newinchess.com/100-endgames-you-must-know" },
      { name: "Lichess Endgame Practice", url: "https://lichess.org/practice/basic-tactics" },
    ],
  },
  {
    title: "YouTube — Lessons & Streamers",
    icon: Youtube,
    color: "from-red-500/20 to-rose-500/10",
    blurb: "The best free chess teachers on the planet.",
    links: [
      { name: "DailyChess_12 (our channel)", url: "https://www.youtube.com/@DailyChess_12", note: "The channel this site is built around" },
      { name: "GothamChess (Levy Rozman)", url: "https://www.youtube.com/@GothamChess" },
      { name: "Hikaru Nakamura", url: "https://www.youtube.com/@GMHikaru" },
      { name: "Daniel Naroditsky", url: "https://www.youtube.com/@DanielNaroditskyGM", note: "GM speedrun = best free improvement series" },
      { name: "agadmator's Chess Channel", url: "https://www.youtube.com/@agadmator" },
      { name: "Eric Rosen", url: "https://www.youtube.com/@EricRosen" },
      { name: "Chessbrah", url: "https://www.youtube.com/@chessbrah" },
      { name: "Anna Cramling", url: "https://www.youtube.com/@AnnaCramling" },
      { name: "Saint Louis Chess Club", url: "https://www.youtube.com/@STLChessClub", note: "Lectures from Yasser Seirawan, Ben Finegold, etc." },
      { name: "ChessNetwork (Jerry)", url: "https://www.youtube.com/@ChessNetwork" },
      { name: "John Bartholomew", url: "https://www.youtube.com/@JohnBartholomew" },
      { name: "Hanging Pawns", url: "https://www.youtube.com/@HangingPawns" },
      { name: "PowerPlayChess (Daniel King)", url: "https://www.youtube.com/@PowerPlayChess" },
      { name: "Chess Vibes (Nelson Lopez)", url: "https://www.youtube.com/@ChessVibesOfficial" },
      { name: "ChessDojo", url: "https://www.youtube.com/@ChessDojo" },
    ],
  },
  {
    title: "Tournaments, News & Live Coverage",
    icon: Tv,
    color: "from-cyan-500/20 to-sky-500/10",
    blurb: "Where to follow super-tournaments in real time.",
    links: [
      { name: "Chess.com News", url: "https://www.chess.com/news" },
      { name: "ChessBase News", url: "https://en.chessbase.com/" },
      { name: "Chess24 News", url: "https://chess24.com/en/read/news" },
      { name: "The Week in Chess", url: "https://theweekinchess.com/" },
      { name: "FIDE News", url: "https://www.fide.com/news" },
      { name: "Norway Chess (super-tournament)", url: "https://norwaychess.no/en/" },
      { name: "Tata Steel Chess (Wijk aan Zee)", url: "https://tatasteelchess.com/" },
      { name: "Sinquefield Cup", url: "https://uschesschamps.com/" },
      { name: "Grand Chess Tour", url: "https://grandchesstour.org/" },
      { name: "Candidates Tournament (Wikipedia)", url: "https://en.wikipedia.org/wiki/Candidates_Tournament" },
      { name: "ChessResults — pairings DB", url: "https://chess-results.com/" },
      { name: "Lichess Broadcasts", url: "https://lichess.org/broadcast" },
    ],
  },
  {
    title: "Communities, Forums & Reddit",
    icon: Users,
    color: "from-violet-500/20 to-purple-500/10",
    blurb: "Where chess players actually hang out and argue.",
    links: [
      { name: "r/chess", url: "https://www.reddit.com/r/chess/" },
      { name: "r/chessbeginners", url: "https://www.reddit.com/r/chessbeginners/" },
      { name: "r/AnarchyChess", url: "https://www.reddit.com/r/AnarchyChess/", note: "Memes & culture" },
      { name: "Chess.com Forums", url: "https://www.chess.com/forum" },
      { name: "Lichess Forum", url: "https://lichess.org/forum" },
      { name: "Reddit Chess Improvement Wiki", url: "https://www.reddit.com/r/chess/wiki/index/" },
      { name: "Chess Stack Exchange", url: "https://chess.stackexchange.com/" },
      { name: "Chess Discord servers (Disboard)", url: "https://disboard.org/servers/tag/chess" },
    ],
  },
  {
    title: "Reference, History & Reading",
    icon: FileText,
    color: "from-stone-500/20 to-zinc-500/10",
    blurb: "Encyclopedic stuff for when you want to go deep.",
    links: [
      { name: "Wikipedia — Chess", url: "https://en.wikipedia.org/wiki/Chess" },
      { name: "Wikipedia — Glossary of Chess", url: "https://en.wikipedia.org/wiki/Glossary_of_chess" },
      { name: "Edward Winter's Chess Notes", url: "https://www.chesshistory.com/winter/" },
      { name: "Britannica — Chess", url: "https://www.britannica.com/topic/chess" },
      { name: "Chess Programming Wiki", url: "https://www.chessprogramming.org/Main_Page", note: "How engines actually work" },
      { name: "World Chess Hall of Fame", url: "https://worldchesshof.org/" },
      { name: "John Watson — Secrets of Modern Chess Strategy", url: "https://www.gambitbooks.com/books/Secrets_Modern_Chess_Strategy.html" },
      { name: "Jeremy Silman — How to Reassess Your Chess", url: "https://www.amazon.com/How-Reassess-Your-Chess-Jeremy/dp/1890085138" },
      { name: "My System — Aron Nimzowitsch", url: "https://en.wikipedia.org/wiki/My_System" },
      { name: "Think Like a Grandmaster — Kotov", url: "https://en.wikipedia.org/wiki/Think_Like_a_Grandmaster" },
    ],
  },
  {
    title: "Tools, Utilities & Developer Resources",
    icon: Globe,
    color: "from-lime-500/20 to-green-500/10",
    blurb: "Build, embed, convert, automate chess content.",
    links: [
      { name: "chess.js (JS rules engine)", url: "https://github.com/jhlywa/chess.js" },
      { name: "Stockfish.js / Stockfish WASM", url: "https://github.com/nmrugg/stockfish.js" },
      { name: "chessboard.js", url: "https://chessboardjs.com/" },
      { name: "react-chessboard", url: "https://www.npmjs.com/package/react-chessboard" },
      { name: "PGN Viewer (CM)", url: "https://chessmonitor.com/pgn-viewer" },
      { name: "FEN to PNG generator", url: "https://fen2png.com/" },
      { name: "Lichess API docs", url: "https://lichess.org/api" },
      { name: "Chess.com Published-Data API", url: "https://www.chess.com/news/view/published-data-api" },
      { name: "PGN-Extract (Norman Pollock)", url: "https://www.cs.kent.ac.uk/people/staff/djb/pgn-extract/" },
      { name: "SCID vs. PC (free DB tool)", url: "https://scidvspc.sourceforge.net/" },
      { name: "ChessTempo API", url: "https://chesstempo.com/api-doc" },
    ],
  },
  {
    title: "Online Play (other sites worth knowing)",
    icon: Globe,
    color: "from-indigo-500/20 to-blue-500/10",
    blurb: "We focus on MasterChess. These exist for context.",
    links: [
      { name: "Lichess.org", url: "https://lichess.org/", note: "100% free, open-source" },
      { name: "Chess.com", url: "https://www.chess.com/" },
      { name: "Internet Chess Club (ICC)", url: "https://www.chessclub.com/" },
      { name: "Chess24", url: "https://chess24.com/" },
      { name: "Playchess (ChessBase)", url: "https://play.chessbase.com/" },
      { name: "FICS — Free Internet Chess Server", url: "https://www.freechess.org/" },
      { name: "ChessKid (for kids)", url: "https://www.chesskid.com/" },
    ],
  },
];

export default function Resources() {
  const url = "https://masterchess.live/resources";
  const totalLinks = SECTIONS.reduce((a, s) => a + s.links.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chess Resources Hub — {totalLinks}+ Hand-Picked Links | MasterChess</title>
        <meta name="description" content={`The biggest curated index of chess on the internet — ${totalLinks}+ links across openings, engines, puzzles, FIDE, YouTube teachers, databases and tools. Updated by humans.`} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`Chess Resources Hub — ${totalLinks}+ links`} />
        <meta property="og:description" content="Every great chess resource on the open internet, in one place." />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Chess Resources Hub",
          url,
          description: `${totalLinks}+ curated chess links across openings, training, FIDE, YouTube, and tools.`,
        })}</script>
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
            <Library className="h-3.5 w-3.5" />
            {totalLinks}+ hand-picked resources
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 tracking-tight">
            The Chess Resources Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every great chess site, engine, YouTube teacher, FIDE database and training tool — curated by hand, organized so you can actually find what you need.
          </p>
        </motion.header>

        <div className="space-y-10">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: idx * 0.03 }}
                className={`relative rounded-2xl border border-border/50 bg-gradient-to-br ${section.color} backdrop-blur-sm p-6 md:p-8`}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-background/60 border border-border/50 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                      {section.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{section.blurb}</p>
                  </div>
                  <span className="hidden md:inline-flex flex-shrink-0 px-2.5 py-1 rounded-md bg-background/60 border border-border/50 text-xs text-muted-foreground font-mono">
                    {section.links.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {section.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="group flex items-start gap-3 p-3 rounded-lg bg-background/60 hover:bg-background border border-border/40 hover:border-primary/40 transition-all"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {link.name}
                        </div>
                        {link.note && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {link.note}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Missing a great resource? Email <a className="underline hover:text-primary" href="mailto:checkmatebros44@gmail.com">checkmatebros44@gmail.com</a> and we'll add it.</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
