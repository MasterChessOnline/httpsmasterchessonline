import { useState, useRef, useCallback, useEffect } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { SkipBack, SkipForward, ChevronLeft, ChevronRight, Upload, Eye, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CoachReviewPanel from "@/components/chess/CoachReviewPanel";
import { detectOpening } from "@/lib/openings-detector";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♔", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wq: { symbol: "♕", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wr: { symbol: "♖", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wb: { symbol: "♗", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wn: { symbol: "♘", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  wp: { symbol: "♙", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" },
  bk: { symbol: "♚", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bq: { symbol: "♛", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  br: { symbol: "♜", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bb: { symbol: "♝", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bn: { symbol: "♞", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bp: { symbol: "♟", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
};

interface GameMeta {
  id: string;
  pgn: string;
  result: string | null;
  end_reason: string | null;
  white_player_id: string;
  black_player_id: string;
}

const GameReview = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get("game");

  const [pgnInput, setPgnInput] = useState("");
  const [moves, setMoves] = useState<{ san: string; from: string; to: string }[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [loaded, setLoaded] = useState(false);
  const [meta, setMeta] = useState<GameMeta | null>(null);
  const [opponentRating, setOpponentRating] = useState<number | undefined>(undefined);
  const [myRating, setMyRating] = useState<number | undefined>(undefined);
  const [autoLoading, setAutoLoading] = useState(false);
  const gameRef = useRef(new Chess());
  const displayRef = useRef(new Chess());

  const loadFromPgn = useCallback((rawPgn: string) => {
    const game = new Chess();
    try {
      game.loadPgn(rawPgn.trim());
    } catch {
      const tokens = rawPgn.trim().split(/\s+/).filter(t => !t.match(/^\d+\./));
      const tempGame = new Chess();
      for (const token of tokens) {
        try { tempGame.move(token); } catch { break; }
      }
      if (tempGame.history().length === 0) return false;
      game.loadPgn(tempGame.pgn());
    }
    const history = game.history({ verbose: true });
    setMoves(history.map(m => ({ san: m.san, from: m.from, to: m.to })));
    gameRef.current = game;
    displayRef.current = new Chess();
    setCurrentMove(-1);
    setLoaded(true);
    return true;
  }, []);

  const loadPGN = useCallback(() => loadFromPgn(pgnInput), [pgnInput, loadFromPgn]);

  // Auto-load when arriving from "Coach Review" CTA on PlayOnline.
  useEffect(() => {
    if (!gameId || loaded) return;
    let cancelled = false;
    setAutoLoading(true);
    (async () => {
      const { data: g } = await supabase
        .from("online_games")
        .select("id, pgn, result, end_reason, white_player_id, black_player_id")
        .eq("id", gameId)
        .maybeSingle();
      if (cancelled || !g) { setAutoLoading(false); return; }
      setMeta(g as GameMeta);
      // Pull both player ratings to enrich the coach prompt
      const ids = [g.white_player_id, g.black_player_id].filter(Boolean) as string[];
      const { data: profs } = await supabase.from("profiles").select("user_id, rating").in("user_id", ids);
      if (profs && user) {
        const me = profs.find(p => p.user_id === user.id);
        const opp = profs.find(p => p.user_id !== user.id);
        if (me) setMyRating(me.rating);
        if (opp) setOpponentRating(opp.rating);
      }
      if (g.pgn) loadFromPgn(g.pgn);
      setAutoLoading(false);
    })();
    return () => { cancelled = true; };
  }, [gameId, loaded, user, loadFromPgn]);

  const goToMove = useCallback((idx: number) => {
    const clamped = Math.max(-1, Math.min(idx, moves.length - 1));
    const display = new Chess();
    for (let i = 0; i <= clamped; i++) {
      display.move(moves[i].san);
    }
    displayRef.current = display;
    setCurrentMove(clamped);
  }, [moves]);

  const board = displayRef.current.board();
  const lastMove = currentMove >= 0 ? moves[currentMove] : null;

  const myColor: "w" | "b" | null = meta && user
    ? (meta.white_player_id === user.id ? "w" : meta.black_player_id === user.id ? "b" : null)
    : null;

  const opening = detectOpening(moves.map(m => m.san));

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <Eye className="h-16 w-16 text-primary mx-auto" />
            <h1 className="font-display text-3xl font-bold text-foreground">Game Review</h1>
            <p className="text-muted-foreground">
              {autoLoading ? "Loading your game…" : "Paste a PGN or move list to review any game move by move."}
            </p>
            {autoLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <div className="space-y-3 text-left">
                <textarea
                  value={pgnInput}
                  onChange={e => setPgnInput(e.target.value)}
                  placeholder="Paste PGN here, e.g.:&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5 a6..."
                  className="w-full h-40 rounded-xl border border-border/40 bg-card/80 p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button onClick={loadPGN} className="w-full" size="lg" disabled={!pgnInput.trim()}>
                  <Upload className="mr-2 h-4 w-4" /> Load Game
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16">
        {/* Opening badge */}
        {opening && (
          <div className="max-w-5xl mx-auto mb-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs">
              <span className="font-mono text-primary opacity-80">{opening.eco}</span>
              <span className="text-foreground font-medium">{opening.name}</span>
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,320px)_minmax(0,420px)] gap-6 justify-center">
          {/* Board */}
          <div className="w-full max-w-[min(90vw,480px)] mx-auto space-y-3">
            <div className="rounded-xl overflow-hidden shadow-lg border border-border/30">
              {RANKS.map((rank, ri) => (
                <div key={rank} className="flex">
                  {FILES.map((file, fi) => {
                    const square = `${file}${rank}` as Square;
                    const isLight = (ri + fi) % 2 === 0;
                    const piece = board[ri][fi];
                    const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                    const pd = pieceKey ? PIECE_DISPLAY[pieceKey] : null;
                    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

                    return (
                      <div
                        key={square}
                        className={`aspect-square w-[12.5%] flex items-center justify-center ${
                          isLastMove
                            ? isLight ? "bg-primary/20" : "bg-primary/25"
                            : isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]"
                        }`}
                      >
                        {pd && <span className={`text-[min(7vw,3.2rem)] leading-none select-none ${pd.className}`}>{pd.symbol}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => goToMove(-1)} disabled={currentMove < 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => goToMove(currentMove - 1)} disabled={currentMove < 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => goToMove(currentMove + 1)} disabled={currentMove >= moves.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => goToMove(moves.length - 1)} disabled={currentMove >= moves.length - 1}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <Slider
              value={[currentMove + 1]}
              min={0}
              max={moves.length}
              step={1}
              onValueChange={([v]) => goToMove(v - 1)}
              className="mt-1"
            />
            <p className="text-center text-xs text-muted-foreground">
              Move {currentMove + 1} of {moves.length}
            </p>
          </div>

          {/* Move list */}
          <div className="w-full space-y-3">
            <div className="rounded-xl border border-border/40 bg-card/80 p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Moves</h3>
              <div className="max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                  {moves.map((move, i) => i % 2 === 0 ? (
                    <div key={i} className="contents">
                      <span className="text-muted-foreground/60 text-xs font-mono">{Math.floor(i / 2) + 1}.</span>
                      <button
                        onClick={() => goToMove(i)}
                        className={`text-left font-mono px-1 rounded ${currentMove === i ? "bg-primary/20 text-primary font-bold" : "text-foreground hover:bg-muted/30"}`}
                      >
                        {move.san}
                      </button>
                      <button
                        onClick={() => goToMove(i + 1)}
                        className={`text-left font-mono px-1 rounded ${currentMove === i + 1 ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted/30"}`}
                      >
                        {moves[i + 1]?.san || ""}
                      </button>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => { setLoaded(false); setPgnInput(""); setMoves([]); setCurrentMove(-1); setMeta(null); }}>
              Load New Game
            </Button>
          </div>

          {/* Coach Review (only when we have full context: a real game from DB) */}
          <div className="w-full">
            {meta && myColor && gameRef.current.pgn() ? (
              <CoachReviewPanel
                pgn={gameRef.current.pgn()}
                myColor={myColor}
                result={meta.result ?? "*"}
                endReason={meta.end_reason ?? undefined}
                opening={opening}
                myRating={myRating}
                opponentRating={opponentRating}
                sourceGameId={meta.id}
              />
            ) : user && gameRef.current.pgn() ? (
              <CoachReviewPanel
                pgn={gameRef.current.pgn()}
                myColor="w"
                result="*"
                opening={opening}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameReview;
