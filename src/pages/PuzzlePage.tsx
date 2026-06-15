import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess, type Square } from "chess.js";
import { ArrowLeft, Lightbulb, RotateCcw, Sparkles, Swords, Target, Trophy, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ShareBar from "@/components/ShareBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivePieceStyle } from "@/lib/board-themes";
import { loadPuzzles, type PuzzlePosition } from "@/lib/masterchess-puzzles";
import { puzzleIdToSlug, slugMatchesPuzzleId } from "@/lib/puzzle-routes";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

function fenToBoard(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) => {
    const out: (string | null)[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push((ch === ch.toUpperCase() ? "w" : "b") + ch.toLowerCase());
    }
    return out;
  });
}

function themeNice(themes: string): string[] {
  const map: Record<string, string> = {
    matein1: "Mate in 1", matein2: "Mate in 2", matein3: "Mate in 3", matein4: "Mate in 4", matein5: "Mate in 5",
    fork: "Fork", pin: "Pin", skewer: "Skewer", sacrifice: "Sacrifice",
    discoveredattack: "Discovered Attack", endgame: "Endgame", middlegame: "Middlegame",
    opening: "Opening", crushing: "Crushing", advantage: "Advantage", promotion: "Promotion",
    kingsideattack: "Kingside Attack", queensideattack: "Queenside Attack",
    deflection: "Deflection", attraction: "Attraction", clearance: "Clearance",
    backRankMate: "Back-rank Mate", arabianMate: "Arabian Mate", hookMate: "Hook Mate",
  };
  const tokens = themes.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (map[lower]) out.push(map[lower]);
    else if (lower.length > 3 && !lower.includes("long") && !lower.includes("short") && !lower.includes("oneMove".toLowerCase()))
      out.push(t.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim());
  }
  return Array.from(new Set(out)).slice(0, 6);
}

function difficultyColor(d: string) {
  if (d === "beginner") return "from-emerald-500/20 to-emerald-400/5 text-emerald-300 border-emerald-500/30";
  if (d === "intermediate") return "from-amber-500/20 to-amber-400/5 text-amber-300 border-amber-500/30";
  return "from-rose-500/20 to-rose-400/5 text-rose-300 border-rose-500/30";
}

export default function PuzzlePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<PuzzlePosition | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [chess, setChess] = useState<Chess | null>(null);
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [solutionIdx, setSolutionIdx] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [status, setStatus] = useState<"playing" | "solved" | "wrong">("playing");
  const [hint, setHint] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const style = useMemo(() => getActivePieceStyle(), []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load puzzle by slug
  useEffect(() => {
    let mounted = true;
    (async () => {
      const all = await loadPuzzles();
      if (!mounted) return;
      const found = all.find((p) => slugMatchesPuzzleId(slug, p.id));
      if (!found) {
        setNotFound(true);
        return;
      }
      setPuzzle(found);
      const g = new Chess(found.fen);
      setChess(g);
      setOrientation(g.turn());
      setStatus("playing");
      setSolutionIdx(0);
      setSelected(null);
      setLegal([]);
      setHint(false);
      setLastMove(null);
    })();
    return () => { mounted = false; };
  }, [slug]);

  const reset = () => {
    if (!puzzle) return;
    const g = new Chess(puzzle.fen);
    setChess(g);
    setSolutionIdx(0);
    setStatus("playing");
    setSelected(null);
    setLegal([]);
    setHint(false);
    setLastMove(null);
  };

  const tryAnother = async () => {
    const all = await loadPuzzles();
    const pool = all.filter((p) => p.id !== puzzle?.id);
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) navigate(`/puzzle/${puzzleIdToSlug(next.id)}`);
  };

  const onSquare = (sq: Square) => {
    if (!chess || !puzzle || status !== "playing") return;
    if (selected && legal.includes(sq)) {
      const expected = puzzle.solutionUci[solutionIdx];
      const from = selected;
      const to = sq;
      const userUci = `${from}${to}`;
      // Allow promotion to queen by default
      const move = chess.move({ from, to, promotion: "q" });
      if (!move) { setSelected(null); setLegal([]); return; }
      if (userUci !== expected && userUci + "q" !== expected) {
        setStatus("wrong");
        setLastMove({ from, to });
        return;
      }
      setLastMove({ from, to });
      const nextIdx = solutionIdx + 1;
      if (nextIdx >= puzzle.solutionUci.length) {
        setStatus("solved");
        setSolutionIdx(nextIdx);
        setSelected(null);
        setLegal([]);
        return;
      }
      // Auto-play opponent reply
      const reply = puzzle.solutionUci[nextIdx];
      setTimeout(() => {
        const r = chess.move({ from: reply.slice(0, 2) as Square, to: reply.slice(2, 4) as Square, promotion: "q" });
        if (r) setLastMove({ from: r.from, to: r.to });
        setSolutionIdx(nextIdx + 1);
      }, 350);
      setSelected(null);
      setLegal([]);
      return;
    }
    const piece = chess.get(sq);
    if (piece && piece.color === chess.turn()) {
      setSelected(sq);
      setLegal(chess.moves({ square: sq, verbose: true }).map((m: any) => m.to as Square));
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container max-w-3xl mx-auto px-4 py-20 text-center">
          <Seo title="Puzzle not found — MasterChess" description="This puzzle does not exist or has been removed." path={`/puzzle/${slug}`} />
          <h1 className="text-3xl font-bold mb-4">Puzzle not found</h1>
          <p className="text-muted-foreground mb-6">It might have been retired from the pool.</p>
          <Button asChild><Link to="/puzzles">See today's puzzle →</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!puzzle || !chess) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading puzzle…</main>
        <Footer />
      </div>
    );
  }

  const board = fenToBoard(chess.fen());
  const displayFiles = orientation === "w" ? FILES : [...FILES].reverse();
  const displayRanks = orientation === "w" ? RANKS : [...RANKS].reverse();
  const themes = themeNice(puzzle.themes);
  const sideToMove = chess.turn() === "w" ? "White" : "Black";
  const seoTitle = `${themes[0] ?? "Tactical"} Puzzle (${puzzle.rating}) — MasterChess`;
  const seoDesc = `${sideToMove} to move. Solve this ${puzzle.difficulty} ${themes.slice(0, 2).join(" / ").toLowerCase() || "tactical"} chess puzzle interactively. Free, no signup.`;
  const url = `/puzzle/${slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: seoTitle,
      about: "Chess tactical puzzle",
      educationalLevel: puzzle.difficulty,
      learningResourceType: "Puzzle",
      url: `https://masterchess.live${url}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
        { "@type": "ListItem", position: 2, name: "Puzzles", item: "https://masterchess.live/puzzles" },
        { "@type": "ListItem", position: 3, name: seoTitle, item: `https://masterchess.live${url}` },
      ],
    },
  ];

  const hintMove = puzzle.solutionUci[solutionIdx];
  const hintFromSq = hintMove?.slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={seoTitle} description={seoDesc} path={url} type="article" jsonLd={jsonLd} />
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 pt-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/puzzles" className="hover:text-foreground">Puzzles</Link>
          <span>›</span>
          <span className="text-foreground">#{slug}</span>
        </div>

        <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start" ref={containerRef}>
          {/* Board */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-zinc-950/90 via-black/95 to-zinc-900/90 p-3 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <h1 className="text-sm font-semibold tracking-wide">{sideToMove} to move</h1>
              </div>
              <div className="flex gap-1.5">
                {themes.slice(0, 2).map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 bg-amber-500/5">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-lg overflow-hidden border border-amber-500/20 select-none">
              <div className="grid grid-cols-8 grid-rows-8 absolute inset-0">
                {board.map((row, rIdx) =>
                  row.map((piece, cIdx) => {
                    const fileIdx = orientation === "w" ? cIdx : 7 - cIdx;
                    const rankIdx = orientation === "w" ? rIdx : 7 - rIdx;
                    const sq = (FILES[fileIdx] + RANKS[rankIdx]) as Square;
                    const isDark = (rIdx + cIdx) % 2 === 1;
                    const isSel = selected === sq;
                    const isLegal = legal.includes(sq);
                    const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
                    const isHint = hint && hintFromSq === sq;
                    const px = board[orientation === "w" ? rIdx : 7 - rIdx][orientation === "w" ? cIdx : 7 - cIdx];
                    return (
                      <button
                        key={sq}
                        onClick={() => onSquare(sq)}
                        className={`relative flex items-center justify-center transition-colors ${
                          isDark ? "bg-[hsl(35_24%_38%)]" : "bg-[hsl(45_45%_85%)]"
                        } ${isSel ? "ring-2 ring-amber-400/80 ring-inset" : ""} ${
                          isLast ? "bg-amber-300/30" : ""
                        } ${isHint ? "ring-2 ring-cyan-400/70 ring-inset" : ""}`}
                        aria-label={`Square ${sq}`}
                      >
                        {px && (
                          <img
                            src={`${style.basePath}/${px}.${style.ext}`}
                            alt={px}
                            className="w-[88%] h-[88%] object-contain pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
                          />
                        )}
                        {isLegal && (
                          <span className={`absolute ${px ? "inset-1 border-2 border-amber-500/70 rounded-full bg-transparent" : "h-3 w-3 rounded-full bg-amber-500/70"}`} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-3 w-3 mr-1" />Reset</Button>
              <Button size="sm" variant="outline" onClick={() => setHint(true)} disabled={hint || status !== "playing"}><Lightbulb className="h-3 w-3 mr-1" />Hint</Button>
              <Button size="sm" variant="outline" onClick={tryAnother}><Sparkles className="h-3 w-3 mr-1" />Random puzzle</Button>
              <div className="flex-1" />
              <span className="text-[10px] text-muted-foreground">Rating {puzzle.rating}</span>
            </div>

            {/* Status banner */}
            {status === "solved" && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-200">Solved!</p>
                  <p className="text-[11px] text-emerald-300/80">Nice tactic. Try another or save your streak by signing up.</p>
                </div>
                <Button size="sm" onClick={tryAnother} className="bg-emerald-500/80 hover:bg-emerald-500">Next →</Button>
              </motion.div>
            )}
            {status === "wrong" && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-center gap-3">
                <Swords className="h-5 w-5 text-rose-300" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-200">Not the best move.</p>
                  <p className="text-[11px] text-rose-300/80">Reset and try again — the position has a forced answer.</p>
                </div>
                <Button size="sm" variant="outline" onClick={reset}>Try again</Button>
              </motion.div>
            )}
          </motion.div>

          {/* Side panel */}
          <aside className="space-y-4">
            <div className={`rounded-2xl border bg-gradient-to-br p-5 ${difficultyColor(puzzle.difficulty)}`}>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Difficulty</p>
              <p className="text-xl font-bold capitalize">{puzzle.difficulty}</p>
              <p className="text-xs opacity-80 mt-1">Rated {puzzle.rating}</p>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 p-5">
              <h2 className="text-sm font-semibold mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" />Motifs</h2>
              <div className="flex flex-wrap gap-1.5">
                {themes.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 p-5 space-y-3">
              <h2 className="text-sm font-semibold">Next steps</h2>
              <Button asChild className="w-full justify-start" size="sm">
                <Link to="/play"><Swords className="h-3.5 w-3.5 mr-2" />Play vs a bot</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link to="/puzzles"><Target className="h-3.5 w-3.5 mr-2" />Today's puzzle</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link to="/training"><Sparkles className="h-3.5 w-3.5 mr-2" />Tactics training</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card/40 p-5">
              <h2 className="text-sm font-semibold mb-2">Share this puzzle</h2>
              <ShareBar
                url={`https://masterchess.live${url}`}
                title={`Can you solve this ${themes[0] ?? "tactic"}? ${sideToMove} to move.`}
                compact
              />
            </div>

            <Link to="/puzzles" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3" /> All puzzles
            </Link>
          </aside>
        </div>

        {/* SEO content block */}
        <article className="prose prose-invert prose-sm max-w-3xl mx-auto mt-12 px-2">
          <h2 className="text-lg font-bold mb-2">About this puzzle</h2>
          <p className="text-sm text-muted-foreground">
            This is a {puzzle.difficulty} chess puzzle rated {puzzle.rating}.
            {sideToMove} is to move and must find the forcing sequence. Themes include {themes.slice(0, 3).map((t) => t.toLowerCase()).join(", ") || "a tactical motif"}.
            Solve more on the <Link to="/puzzles" className="text-amber-400 underline">daily puzzle page</Link> or <Link to="/training" className="text-amber-400 underline">tactics trainer</Link>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
