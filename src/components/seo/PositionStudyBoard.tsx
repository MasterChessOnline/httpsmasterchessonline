/**
 * Interactive study board for content pages (mate patterns, famous games,
 * glossary terms).
 *
 * Until now these pages showed a static brand image instead of the position
 * they describe — nothing to do, so visitors bounced in seconds. Here the
 * position is real: step through the forced sequence, or switch to "your move"
 * and push the pieces around yourself. That is the difference between a text
 * page and a page people stay on.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, Square } from "chess.js";
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Hand } from "lucide-react";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { playChessSound } from "@/lib/chess-sounds";

interface Props {
  /** Starting position. Defaults to the standard opening position. */
  fen?: string;
  /** Move sequence: SAN with or without move numbers ("1. Ra8#"), or a full PGN. */
  moves?: string;
  /** Full PGN game (used instead of `moves` when present). */
  pgn?: string;
  label?: string;
  /** Flip the board when the interesting side plays from the top. */
  flipped?: boolean;
  className?: string;
}

interface Step {
  san: string;
  fen: string;
  from: string;
  to: string;
  /** 1-based full-move number, for the move list. */
  moveNo: number;
  color: "w" | "b";
}

/** Build the step list once: every half-move with its resulting FEN. */
function buildSteps(startFen: string | undefined, moves?: string, pgn?: string): Step[] {
  const out: Step[] = [];
  try {
    if (pgn) {
      const g = new Chess();
      g.loadPgn(pgn);
      const verbose = g.history({ verbose: true }) as any[];
      const replay = new Chess();
      verbose.forEach((mv, i) => {
        replay.move(mv.san);
        out.push({
          san: mv.san,
          fen: replay.fen(),
          from: mv.from,
          to: mv.to,
          moveNo: Math.floor(i / 2) + 1,
          color: mv.color,
        });
      });
      return out;
    }
    const g = startFen ? new Chess(startFen) : new Chess();
    const tokens = (moves || "")
      .replace(/\d+\.(\.\.)?/g, " ")
      .replace(/\b(1-0|0-1|1\/2-1\/2|\*)\b/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    let index = 0;
    for (const san of tokens) {
      const mv = g.move(san) as any;
      if (!mv) break;
      out.push({
        san: mv.san,
        fen: g.fen(),
        from: mv.from,
        to: mv.to,
        moveNo: Math.floor(index / 2) + 1,
        color: mv.color,
      });
      index += 1;
    }
  } catch {
    /* malformed data must never break the page — fall back to what parsed */
  }
  return out;
}

export default function PositionStudyBoard({
  fen,
  moves,
  pgn,
  label = "Position",
  flipped = false,
  className = "",
}: Props) {
  const steps = useMemo(() => buildSteps(fen, moves, pgn), [fen, moves, pgn]);
  const startFen = useMemo(() => {
    if (pgn) return new Chess().fen();
    try {
      return fen ? new Chess(fen).fen() : new Chess().fen();
    } catch {
      return new Chess().fen();
    }
  }, [fen, pgn]);

  // -1 = starting position, otherwise index into `steps`.
  const [cursor, setCursor] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [freePlay, setFreePlay] = useState(false);
  const [freeGame, setFreeGame] = useState<Chess | null>(null);
  const [selected, setSelected] = useState<Square | null>(null);
  const timer = useRef<number | null>(null);

  const currentFen = cursor < 0 ? startFen : steps[cursor].fen;
  const lastMove = cursor >= 0 ? { from: steps[cursor].from, to: steps[cursor].to } : null;

  // Auto-advance through the sequence.
  useEffect(() => {
    if (!playing || freePlay) return;
    if (cursor >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setCursor((c) => c + 1), 900);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, cursor, steps.length, freePlay]);

  const displayGame = useMemo(() => {
    if (freePlay && freeGame) return freeGame;
    try {
      return new Chess(currentFen);
    } catch {
      return new Chess();
    }
  }, [currentFen, freePlay, freeGame]);

  const legalMoves = useMemo(() => {
    if (!freePlay || !selected) return [];
    try {
      return (displayGame.moves({ square: selected, verbose: true }) as any[]).map((m) => m.to as Square);
    } catch {
      return [];
    }
  }, [freePlay, selected, displayGame]);

  const enterFreePlay = useCallback(() => {
    try {
      setFreeGame(new Chess(currentFen));
    } catch {
      setFreeGame(new Chess());
    }
    setPlaying(false);
    setFreePlay(true);
    setSelected(null);
  }, [currentFen]);

  const onSquareClick = useCallback(
    (square: Square) => {
      if (!freePlay || !freeGame) return;
      const next = new Chess(freeGame.fen());
      if (selected) {
        try {
          const mv = next.move({ from: selected, to: square, promotion: "q" });
          if (mv) {
            setFreeGame(next);
            setSelected(null);
            playChessSound(next.isGameOver() ? "gameOver" : "move");
            return;
          }
        } catch {
          /* illegal move — treat the click as a new selection */
        }
      }
      const piece = next.get(square);
      setSelected(piece && piece.color === next.turn() ? square : null);
    },
    [freePlay, freeGame, selected],
  );

  const reset = useCallback(() => {
    setPlaying(false);
    setFreePlay(false);
    setFreeGame(null);
    setSelected(null);
    setCursor(-1);
  }, []);

  const hasSequence = steps.length > 0;

  return (
    <div className={`rounded-xl border border-border/30 glass-4d p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        {freePlay && (
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Your move</span>
        )}
      </div>

      <div className="mx-auto w-full max-w-[380px]">
        <ChessBoard
          game={displayGame}
          flipped={flipped}
          selectedSquare={selected}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isGameOver={displayGame.isGameOver()}
          isPlayerTurn={freePlay}
          onSquareClick={onSquareClick}
        />
      </div>

      {hasSequence && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            aria-label="Previous move"
            disabled={freePlay || cursor < 0}
            onClick={() => setCursor((c) => Math.max(-1, c - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={freePlay || cursor >= steps.length - 1}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            <span className="ml-1.5 text-xs">{playing ? "Pause" : "Play"}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-label="Next move"
            disabled={freePlay || cursor >= steps.length - 1}
            onClick={() => setCursor((c) => Math.min(steps.length - 1, c + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            <span className="ml-1.5 text-xs">Reset</span>
          </Button>
          {!freePlay && (
            <Button size="sm" onClick={enterFreePlay}>
              <Hand className="h-4 w-4" />
              <span className="ml-1.5 text-xs">Try it yourself</span>
            </Button>
          )}
        </div>
      )}

      {hasSequence && !freePlay && (
        <div className="mt-3 max-h-24 overflow-y-auto text-center font-mono text-xs leading-relaxed">
          {steps.map((s, i) => (
            <button
              key={`${s.san}-${i}`}
              onClick={() => {
                setPlaying(false);
                setCursor(i);
              }}
              className={`px-1 rounded transition-colors ${
                i === cursor ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {s.color === "w" ? `${s.moveNo}. ` : ""}
              {s.san}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
