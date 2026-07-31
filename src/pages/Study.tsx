import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Chess } from "chess.js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaticBoard from "@/components/chess/StaticBoard";
import { BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Share2, Copy, Check, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DynamicBackground from "@/components/DynamicBackground";

const SAMPLE_PGN = `[Event "Immortal Game"]
[Site "London"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5
8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3
Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2
Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;

function encodePgn(pgn: string): string {
  try {
    return btoa(unescape(encodeURIComponent(pgn.trim())));
  } catch {
    return "";
  }
}

function decodePgn(hash: string): string {
  try {
    return decodeURIComponent(escape(atob(hash)));
  } catch {
    return "";
  }
}

function parsePgn(pgn: string): { game: Chess | null; error: string } {
  const trimmed = pgn.trim();
  if (!trimmed) return { game: null, error: "" };
  try {
    const g = new Chess();
    g.loadPgn(trimmed);
    return { game: g, error: "" };
  } catch {
    return { game: null, error: "Could not parse PGN. Check moves and tags." };
  }
}

export default function Study() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const initialPgn = useMemo(() => {
    if (id) return decodePgn(id);
    const p = searchParams.get("pgn");
    return p ? decodePgn(p) : "";
  }, [id, searchParams]);

  const [pgnInput, setPgnInput] = useState(initialPgn || SAMPLE_PGN);
  const [pgn, setPgn] = useState(initialPgn || SAMPLE_PGN);
  const [viewIndex, setViewIndex] = useState(-1);
  const [copied, setCopied] = useState(false);

  const { game, error } = useMemo(() => parsePgn(pgn), [pgn]);
  const history = useMemo(() => (game ? game.history({ verbose: true }) : []), [game]);
  const displayGame = useMemo(() => {
    if (!game) return null;
    const g = new Chess();
    if (viewIndex < 0) return g;
    for (let i = 0; i <= Math.min(viewIndex, history.length - 1); i++) {
      const m = history[i];
      g.move({ from: m.from, to: m.to, promotion: m.promotion });
    }
    return g;
  }, [game, history, viewIndex]);

  const lastMove = useMemo(() => {
    if (!history.length || viewIndex < 0) return null;
    const m = history[Math.min(viewIndex, history.length - 1)];
    return { from: m.from, to: m.to };
  }, [history, viewIndex]);

  useEffect(() => {
    setViewIndex(history.length - 1);
  }, [history.length]);

  const handleLoad = () => {
    setPgn(pgnInput);
    setViewIndex(-1);
  };

  const shareUrl = useMemo(() => {
    const encoded = encodePgn(pgn);
    if (!encoded) return "";
    return `${window.location.origin}/study/${encoded}`;
  }, [pgn]);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Share this study board anywhere." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Chess Study — Shareable Annotated Boards | MasterChess</title>
        <meta name="description" content="Paste a PGN and get a shareable chess study board with move-by-move navigation. Free on MasterChess." />
        <link rel="canonical" href="https://masterchess.live/study" />
        <meta property="og:title" content="Chess Study — MasterChess" />
        <meta property="og:description" content="Shareable annotated chess board. Paste PGN, navigate moves, share the link." />
        <meta property="og:url" content="https://masterchess.live/study" />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <DynamicBackground />
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">
              <BookOpen className="w-3 h-3 mr-1" /> Study
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
              Chess <span className="text-gradient-gold">Study</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste a PGN, navigate the moves, share the board with anyone.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 shadow-2xl">
              {displayGame ? (
                <>
                  <div className="flex justify-center mb-4">
                    <StaticBoard
                      fen={displayGame.fen()}
                      flipped={displayGame.turn() === "b"}
                      lastMove={lastMove}
                      size="lg"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" onClick={() => setViewIndex(-1)} disabled={viewIndex < 0}>
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setViewIndex((i) => Math.max(-1, i - 1))} disabled={viewIndex < 0}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setViewIndex((i) => Math.min(history.length - 1, i + 1))} disabled={viewIndex >= history.length - 1}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setViewIndex(history.length - 1)} disabled={viewIndex >= history.length - 1}>
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Move {viewIndex + 1} / {history.length}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Paste a valid PGN to see the board.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2 block">
                  PGN Input
                </label>
                <Textarea
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  rows={10}
                  className="font-mono text-xs bg-background/50"
                  placeholder="Paste PGN here..."
                />
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleLoad} size="sm">
                    <Wand2 className="w-4 h-4 mr-2" /> Load PGN
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPgnInput(SAMPLE_PGN); setPgn(SAMPLE_PGN); }}>
                    Load sample
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2 block">
                  Share this study
                </label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs bg-background/50" />
                  <Button variant="outline" size="icon" onClick={copyLink} disabled={!shareUrl}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Anyone with the link can view this board and replay the moves.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-2">Why Study boards matter</h3>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Embed lessons in blogs and forums.</li>
                  <li>Share analysis after a tournament game.</li>
                  <li>Build a library of annotated openings.</li>
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/analysis">
                    <Share2 className="w-4 h-4 mr-2" /> Open in Analysis
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
