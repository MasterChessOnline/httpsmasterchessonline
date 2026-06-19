import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  RotateCcw, Lightbulb, Play, Pause, Eye, Puzzle, CheckCircle2, XCircle, GitBranch, Cpu, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EngineAnalysis from "./EngineAnalysis";
import EvalBar from "./EvalBar";
import { useEngineEval } from "./useEngineEval";
import { usePieceGlyphs } from "@/lib/piece-glyphs";

/**
 * A single move in a guided sequence.
 *
 * `branches` lets a move offer alternative continuations (sub-variations)
 * that play instead of the main line at this point. ChessBase-style:
 *   1.e4 e5 2.Nf3 [main: 2...Nc6 ...] [branch: "Petroff" 2...Nf6 ...]
 * Each branch is a full named line that REPLACES the next moves of the
 * main line from the position BEFORE this move's SAN.
 */
export interface MoveBranch {
  name: string;
  /** Optional short summary shown in the branch picker. */
  summary?: string;
  moves: MoveStep[];
}

export interface MoveStep {
  san: string;
  explanation: string;
  /** Optional alternative lines branching at the position before this SAN. */
  branches?: MoveBranch[];
}

type BoardMode = "guided" | "practice" | "explore";

interface InteractiveBoardProps {
  startFen?: string;
  moves: MoveStep[];
  /** Initial board orientation. Defaults to "white". */
  orientation?: "white" | "black";
  /** Allow flipping the board with a button (defaults true). */
  allowFlip?: boolean;
  /** Optional override per-move explanations (e.g. AI-generated). Same index as `moves`. */
  moveExplanations?: string[];
  /** Fired whenever the user advances or rewinds in guided mode. moveIndex 0 = start, 1 = after move[0]. */
  onMoveIndexChange?: (
    moveIndex: number,
    info: { san: string | null; explanation: string | null; totalMoves: number }
  ) => void;
}

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♔", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  wq: { symbol: "♕", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  wr: { symbol: "♖", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  wb: { symbol: "♗", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  wn: { symbol: "♘", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  wp: { symbol: "♙", className: "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_2px_rgba(255,255,255,0.5)]" },
  bk: { symbol: "♚", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bq: { symbol: "♛", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  br: { symbol: "♜", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bb: { symbol: "♝", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bn: { symbol: "♞", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
  bp: { symbol: "♟", className: "text-[hsl(220,15%,8%)] drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]" },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function InteractiveBoard({ startFen, moves, orientation = "white", allowFlip = true, moveExplanations, onMoveIndexChange }: InteractiveBoardProps) {
  const { get: getGlyph } = usePieceGlyphs();
  const baseFen = startFen || DEFAULT_FEN;
  const hasMoves = moves.length > 0;
  const [flipped, setFlipped] = useState(orientation === "black");
  // Reset flipped when orientation prop changes (lesson navigation)
  useEffect(() => { setFlipped(orientation === "black"); }, [orientation]);
  const displayFiles = useMemo(() => flipped ? [...FILES].reverse() : FILES, [flipped]);
  const displayRanks = useMemo(() => flipped ? [...RANKS].reverse() : RANKS, [flipped]);

  // Active branch: when set, the line "switches" to a branch at branchAt
  // (index of the move in the main line where the branch starts INSTEAD of).
  // Up to one level of branching is supported.
  const [branchAt, setBranchAt] = useState<number | null>(null);
  const [branchIdx, setBranchIdx] = useState<number>(0);

  // Active "effective" sequence of moves = main line up to branchAt, then branch moves
  const effectiveMoves = useMemo<MoveStep[]>(() => {
    if (branchAt === null) return moves;
    const branch = moves[branchAt]?.branches?.[branchIdx];
    if (!branch) return moves;
    return [...moves.slice(0, branchAt), ...branch.moves];
  }, [moves, branchAt, branchIdx]);

  // Pre-compute all FEN positions for the effective sequence
  const positions = useMemo(() => {
    const fens: string[] = [baseFen];
    const chess = new Chess(baseFen);
    for (const step of effectiveMoves) {
      try {
        chess.move(step.san);
        fens.push(chess.fen());
      } catch {
        break;
      }
    }
    return fens;
  }, [baseFen, effectiveMoves]);

  const [mode, setMode] = useState<BoardMode>("guided");
  const [moveIndex, setMoveIndex] = useState(0);
  const totalMoves = positions.length - 1;

  // Engine toggle (eval bar + best-move arrow)
  const [engineOn, setEngineOn] = useState(false);
  // Drag-and-drop state (works in guided, explore, practice)
  const [dragFrom, setDragFrom] = useState<Square | null>(null);
  // Guided-mode tap/drag-to-play state
  const [guidedSelected, setGuidedSelected] = useState<Square | null>(null);
  const [guidedLegalMoves, setGuidedLegalMoves] = useState<Square[]>([]);
  const [guidedFeedback, setGuidedFeedback] = useState<"correct" | "wrong" | null>(null);

  // Index of the first move that belongs to the branch (for highlighting)
  const branchStartIdx = branchAt !== null ? branchAt : -1;

  // Explore mode state
  const [exploreChess, setExploreChess] = useState(() => new Chess(baseFen));
  const [exploreSelected, setExploreSelected] = useState<Square | null>(null);
  const [exploreLegalMoves, setExploreLegalMoves] = useState<Square[]>([]);

  // Practice mode state
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceChess, setPracticeChess] = useState(() => new Chess(baseFen));
  const [practiceSelected, setPracticeSelected] = useState<Square | null>(null);
  const [practiceLegalMoves, setPracticeLegalMoves] = useState<Square[]>([]);
  const [practiceResult, setPracticeResult] = useState<"correct" | "wrong" | null>(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);

  // Reset when lesson changes
  useEffect(() => {
    setMoveIndex(0);
    setMode("guided");
    setBranchAt(null);
    setBranchIdx(0);
    setExploreChess(new Chess(baseFen));
    setExploreSelected(null);
    setExploreLegalMoves([]);
    setGuidedSelected(null);
    setGuidedLegalMoves([]);
    setGuidedFeedback(null);
    resetPractice();
  }, [baseFen, moves]);

  // When the active branch/effective line changes, clamp the move pointer
  useEffect(() => {
    setMoveIndex((i) => Math.min(i, positions.length - 1));
  }, [positions.length]);

  const resetPractice = useCallback(() => {
    setPracticeIndex(0);
    setPracticeChess(new Chess(baseFen));
    setPracticeSelected(null);
    setPracticeLegalMoves([]);
    setPracticeResult(null);
    setPracticeCompleted(false);
    setHintSquare(null);
  }, [baseFen]);

  // Guided mode navigation
  const goToStart = useCallback(() => setMoveIndex(0), []);
  const goToEnd = useCallback(() => setMoveIndex(totalMoves), [totalMoves]);
  const goForward = useCallback(() => setMoveIndex((i) => Math.min(i + 1, totalMoves)), [totalMoves]);
  const goBack = useCallback(() => setMoveIndex((i) => Math.max(i - 1, 0)), []);

  // Autoplay (guided mode)
  const [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    if (!autoplay || mode !== "guided") return;
    if (moveIndex >= totalMoves) { setAutoplay(false); return; }
    const id = setTimeout(() => setMoveIndex((i) => Math.min(i + 1, totalMoves)), 1100);
    return () => clearTimeout(id);
  }, [autoplay, moveIndex, totalMoves, mode]);
  useEffect(() => { setAutoplay(false); }, [baseFen, moves]);

  // Keyboard navigation (guided mode)
  useEffect(() => {
    if (mode !== "guided") return;
    const handler = (e: KeyboardEvent) => {
      // Don't hijack keys when user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault(); goForward();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault(); goBack();
      } else if (e.key === "Home") {
        e.preventDefault(); goToStart();
      } else if (e.key === "End") {
        e.preventDefault(); goToEnd();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goForward, goBack, goToStart, goToEnd, mode]);

  // Touch swipe navigation (guided mode, mobile)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== "guided") return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mode !== "guided" || !touchStartRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;
    // Horizontal swipe: > 50px, mostly horizontal, under 600ms
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 600) {
      if (dx < 0) goForward();
      else goBack();
    }
  };

  // Current board state based on mode
  const currentFen = mode === "guided"
    ? (positions[moveIndex] || baseFen)
    : mode === "explore"
      ? exploreChess.fen()
      : practiceChess.fen();

  const board = useMemo(() => new Chess(currentFen).board(), [currentFen]);

  // Engine eval for current position (used by eval bar + best-move arrow)
  const engine = useEngineEval(currentFen, engineOn, 14);

  // Compute arrow endpoints from best UCI move (e.g. "e2e4")
  const bestArrow = useMemo(() => {
    if (!engineOn || !engine.bestMoveUci || engine.bestMoveUci.length < 4) return null;
    const from = engine.bestMoveUci.slice(0, 2);
    const to = engine.bestMoveUci.slice(2, 4);
    const fFi = displayFiles.indexOf(from[0]);
    const fRi = displayRanks.indexOf(parseInt(from[1]));
    const tFi = displayFiles.indexOf(to[0]);
    const tRi = displayRanks.indexOf(parseInt(to[1]));
    if (fFi < 0 || fRi < 0 || tFi < 0 || tRi < 0) return null;
    return { x1: fFi * 100 + 50, y1: fRi * 100 + 50, x2: tFi * 100 + 50, y2: tRi * 100 + 50 };
  }, [engineOn, engine.bestMoveUci]);

  const currentExplanation = mode === "guided" && moveIndex > 0 && moveIndex <= effectiveMoves.length
    ? (moveExplanations?.[moveIndex - 1] ?? effectiveMoves[moveIndex - 1].explanation) : null;

  // Notify parent on every guided-mode move pointer change (powers Nikola TTS).
  useEffect(() => {
    if (!onMoveIndexChange) return;
    if (mode !== "guided") return;
    const san = moveIndex > 0 && moveIndex <= effectiveMoves.length ? effectiveMoves[moveIndex - 1].san : null;
    const exp = moveIndex > 0 && moveIndex <= effectiveMoves.length
      ? (moveExplanations?.[moveIndex - 1] ?? effectiveMoves[moveIndex - 1].explanation ?? null)
      : null;
    onMoveIndexChange(moveIndex, { san, explanation: exp, totalMoves });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveIndex, mode, effectiveMoves, totalMoves, moveExplanations]);

  // Branches available at the CURRENT position (i.e. branches attached to
  // the move that would be played next from the main line). Only show on
  // the main line (no nested branches).
  const availableBranches = useMemo(() => {
    if (mode !== "guided" || branchAt !== null) return null;
    const nextMove = moves[moveIndex];
    if (!nextMove?.branches?.length) return null;
    return { atIndex: moveIndex, branches: nextMove.branches };
  }, [mode, branchAt, moves, moveIndex]);

  // Last move highlighting for guided mode
  const lastMoveHighlight = useMemo(() => {
    if (mode !== "guided" || moveIndex === 0) return null;
    try {
      const chess = new Chess(positions[moveIndex - 1]);
      const result = chess.move(effectiveMoves[moveIndex - 1].san);
      return result ? { from: result.from, to: result.to } : null;
    } catch {
      return null;
    }
  }, [moveIndex, positions, effectiveMoves, mode]);

  // Handle explore mode clicks
  const handleExploreClick = (square: Square) => {
    if (exploreSelected && exploreLegalMoves.includes(square)) {
      const newChess = new Chess(exploreChess.fen());
      newChess.move({ from: exploreSelected, to: square, promotion: "q" });
      setExploreChess(newChess);
      setExploreSelected(null);
      setExploreLegalMoves([]);
      return;
    }
    const piece = exploreChess.get(square);
    if (piece && piece.color === exploreChess.turn()) {
      setExploreSelected(square);
      setExploreLegalMoves(exploreChess.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setExploreSelected(null);
      setExploreLegalMoves([]);
    }
  };

  // Handle practice mode clicks
  const handlePracticeClick = (square: Square) => {
    if (practiceCompleted || practiceResult === "correct") return;

    if (practiceSelected && practiceLegalMoves.includes(square)) {
      const expectedSan = moves[practiceIndex]?.san;
      if (!expectedSan) return;

      // Try the move
      const testChess = new Chess(practiceChess.fen());
      const result = testChess.move({ from: practiceSelected, to: square, promotion: "q" });

      if (result && result.san === expectedSan) {
        // Correct!
        setPracticeChess(testChess);
        setPracticeResult("correct");
        setHintSquare(null);
        setPracticeSelected(null);
        setPracticeLegalMoves([]);

        // Auto-advance after delay
        setTimeout(() => {
          setPracticeResult(null);
          const nextIdx = practiceIndex + 1;
          if (nextIdx >= moves.length) {
            setPracticeCompleted(true);
          } else {
            setPracticeIndex(nextIdx);
          }
        }, 1200);
      } else {
        // Wrong move
        setPracticeResult("wrong");
        setPracticeSelected(null);
        setPracticeLegalMoves([]);
        setTimeout(() => setPracticeResult(null), 1500);
      }
      return;
    }

    const piece = practiceChess.get(square);
    if (piece && piece.color === practiceChess.turn()) {
      setPracticeSelected(square);
      setPracticeLegalMoves(practiceChess.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setPracticeSelected(null);
      setPracticeLegalMoves([]);
    }
  };

  // Hint: show the "from" square of the expected move
  const showHint = () => {
    if (practiceIndex >= moves.length) return;
    const expectedSan = moves[practiceIndex].san;
    try {
      const testChess = new Chess(practiceChess.fen());
      const move = testChess.move(expectedSan);
      if (move) {
        setHintSquare(move.from as Square);
      }
    } catch { /* ignore */ }
  };

  // Guided mode: tap or drag the piece that plays the next expected move.
  // If correct, advance moveIndex. If wrong, brief red flash.
  const tryGuidedMove = useCallback((from: Square, to: Square): boolean => {
    if (moveIndex >= effectiveMoves.length) return false;
    const expectedSan = effectiveMoves[moveIndex].san;
    const fen = positions[moveIndex] || baseFen;
    const test = new Chess(fen);
    let res: ReturnType<typeof test.move> | null = null;
    try { res = test.move({ from, to, promotion: "q" }); } catch { res = null; }
    if (res && res.san === expectedSan) {
      setMoveIndex(moveIndex + 1);
      setGuidedSelected(null);
      setGuidedLegalMoves([]);
      setGuidedFeedback("correct");
      setTimeout(() => setGuidedFeedback(null), 600);
      return true;
    }
    setGuidedFeedback("wrong");
    setGuidedSelected(null);
    setGuidedLegalMoves([]);
    setTimeout(() => setGuidedFeedback(null), 700);
    return false;
  }, [moveIndex, effectiveMoves, positions, baseFen]);

  const handleGuidedClick = (square: Square) => {
    if (moveIndex >= effectiveMoves.length) return;
    const fen = positions[moveIndex] || baseFen;
    const chess = new Chess(fen);
    if (guidedSelected && guidedLegalMoves.includes(square)) {
      tryGuidedMove(guidedSelected, square);
      return;
    }
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setGuidedSelected(square);
      setGuidedLegalMoves(chess.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setGuidedSelected(null);
      setGuidedLegalMoves([]);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (mode === "explore") handleExploreClick(square);
    else if (mode === "practice") handlePracticeClick(square);
    else if (mode === "guided") handleGuidedClick(square);
  };

  // Drag-and-drop: pick up piece, then drop on target — works in guided, explore & practice.
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    let chess: Chess;
    if (mode === "guided") {
      const fen = positions[moveIndex] || baseFen;
      chess = new Chess(fen);
    } else {
      chess = mode === "explore" ? exploreChess : practiceChess;
    }
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) { e.preventDefault(); return; }
    setDragFrom(square);
    const legal = chess.moves({ square, verbose: true }).map(m => m.to as Square);
    if (mode === "explore") {
      setExploreSelected(square); setExploreLegalMoves(legal);
    } else if (mode === "practice") {
      setPracticeSelected(square); setPracticeLegalMoves(legal);
    } else {
      setGuidedSelected(square); setGuidedLegalMoves(legal);
    }
    try { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", square); } catch { /* noop */ }
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (!dragFrom) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = "move"; } catch { /* noop */ }
  };
  const handleDrop = (e: React.DragEvent, square: Square) => {
    if (!dragFrom) return;
    e.preventDefault();
    const from = dragFrom;
    setDragFrom(null);
    if (from === square) return;
    if (mode === "explore") handleExploreClick(square);
    else if (mode === "practice") handlePracticeClick(square);
    else if (mode === "guided") tryGuidedMove(from, square);
  };
  const handleDragEnd = () => { setDragFrom(null); };

  // Selected/legal state for rendering — covers guided too
  const selectedSquare = mode === "explore" ? exploreSelected
    : mode === "practice" ? practiceSelected
    : mode === "guided" ? guidedSelected : null;
  const legalMoveSquares = mode === "explore" ? exploreLegalMoves
    : mode === "practice" ? practiceLegalMoves
    : mode === "guided" ? guidedLegalMoves : [];

  const getMoveNumber = (idx: number) => {
    const chess = new Chess(baseFen);
    const startTurnIsWhite = chess.turn() === "w";
    if (startTurnIsWhite) {
      return idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : "";
    } else {
      if (idx === 0) return "1...";
      return (idx + 1) % 2 === 0 ? `${Math.floor((idx + 1) / 2) + 1}.` : "";
    }
  };

  const resetExplore = () => {
    setExploreChess(new Chess(currentFen));
    setExploreSelected(null);
    setExploreLegalMoves([]);
  };

  const switchMode = (newMode: BoardMode) => {
    setMode(newMode);
    if (newMode === "explore") {
      const fen = positions[moveIndex] || baseFen;
      setExploreChess(new Chess(fen));
      setExploreSelected(null);
      setExploreLegalMoves([]);
    } else if (newMode === "practice") {
      resetPractice();
    }
  };

  return (
    <div className="w-full max-w-md lg:max-w-[min(calc(100svh-12rem),780px)] xl:max-w-[min(calc(100svh-10rem),980px)] 2xl:max-w-[min(calc(100svh-10rem),1180px)] mx-auto">
      {/* Mode tabs */}
      {hasMoves && (
        <div className="flex rounded-lg border border-border/50 overflow-hidden mb-3">
          {([
            { key: "guided" as const, label: "Guided", icon: Play },
            { key: "practice" as const, label: "Practice", icon: Puzzle },
            { key: "explore" as const, label: "Explore", icon: Eye },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                mode === key
                  ? "bg-primary/15 text-primary"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Engine + flip toolbar */}
      <div className="flex items-center justify-between mb-2 px-1 gap-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Position</div>
        <div className="flex items-center gap-2">
          {allowFlip && (
            <button
              onClick={() => setFlipped(v => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border bg-card text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/40 transition-colors"
              title="Flip board"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Flip
            </button>
          )}
          <button
            onClick={() => setEngineOn(v => !v)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
              engineOn
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border/50 hover:text-foreground hover:border-primary/40"
            }`}
            title="Toggle Stockfish eval bar + best-move arrow"
          >
            <Cpu className="w-3.5 h-3.5" />
            Engine {engineOn ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Board row: optional eval bar + board */}
      <div className="flex items-stretch gap-1.5 mb-3">
        {engineOn && (
          <EvalBar evalCp={engine.evalCp} mate={engine.mate} loading={engine.loading} />
        )}

        <div className="flex-1 flex flex-col">
          {/* Top file labels */}
          <div className="flex ml-6 mr-6 mb-0.5">
            {displayFiles.map((f) => (
              <span key={`t-${f}`} className="flex-1 text-center text-[11px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{f}</span>
            ))}
          </div>
          <div className="flex">
            {/* Left rank labels */}
            <div className="flex flex-col w-6 flex-shrink-0">
              {displayRanks.map((r) => (
                <span key={`l-${r}`} className="flex-1 flex items-center justify-center text-[11px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{r}</span>
              ))}
            </div>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`flex-1 relative rounded-lg overflow-hidden border transition-all touch-pan-y ${
          (practiceResult === "correct" || guidedFeedback === "correct") ? "border-green-500/50 shadow-[0_0_15px_hsl(142,70%,45%,0.15)]"
          : (practiceResult === "wrong" || guidedFeedback === "wrong") ? "border-red-500/50 shadow-[0_0_15px_hsl(0,70%,45%,0.15)]"
          : "border-border/50"
        }`}>
        {displayRanks.map((rank, ri) => (
          <div key={rank} className="flex">
            {displayFiles.map((file, fi) => {
              const boardRow = 8 - rank;
              const boardCol = FILES.indexOf(file);
              const isLight = (boardRow + boardCol) % 2 === 0;
              const piece = board[boardRow]?.[boardCol];
              const pieceKey = piece ? `${piece.color}${piece.type}` : null;
              const pd = pieceKey ? getGlyph(pieceKey) : null;
              const sq = `${file}${rank}` as Square;
              const isSelected = selectedSquare === sq;
              const isLegal = legalMoveSquares.includes(sq);
              const isLastMove = mode === "guided" && lastMoveHighlight && (lastMoveHighlight.from === sq || lastMoveHighlight.to === sq);
              const isHint = hintSquare === sq;
              const isInteractive = mode === "explore" || mode === "practice" || (mode === "guided" && moveIndex < effectiveMoves.length);
              const guidedFen = positions[moveIndex] || baseFen;
              const turnColor = mode === "explore" ? exploreChess.turn()
                : mode === "practice" ? practiceChess.turn()
                : new Chess(guidedFen).turn();
              const canDrag = isInteractive && !!piece && piece.color === turnColor;

              let bgClass = isLight ? "bg-[hsl(var(--board-light))]" : "bg-[hsl(var(--board-dark))]";
              if (isSelected) bgClass = "bg-primary/40";
              else if (isLastMove) bgClass = isLight ? "bg-primary/20" : "bg-primary/25";
              else if (isHint) bgClass = isLight ? "bg-amber-400/30" : "bg-amber-500/35";

              return (
                <button
                  key={sq}
                  className={`aspect-square w-[12.5%] flex items-center justify-center text-2xl sm:text-3xl select-none transition-colors duration-100 relative ${bgClass} ${
                    isInteractive ? "cursor-pointer active:scale-95" : "cursor-default"
                  }`}
                  onClick={() => isInteractive && handleSquareClick(sq)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sq)}
                  disabled={!isInteractive}
                >
                  {isLegal && !piece && <span className="block h-[26%] w-[26%] rounded-full bg-foreground/20" />}
                  {isLegal && pd && <span className="absolute inset-[6%] rounded-full border-[3px] border-foreground/25" />}
                  {pd && (
                    pd.svgUrl ? (
                      <img
                        src={pd.svgUrl}
                        alt=""
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, sq)}
                        onDragEnd={handleDragEnd}
                        className={`w-[88%] h-[88%] object-contain ${canDrag ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"} ${dragFrom === sq ? "opacity-40" : ""}`}
                        style={pd.pixelated ? { imageRendering: "pixelated" } : undefined}
                      />
                    ) : (
                      <span
                        draggable={canDrag}
                        onDragStart={(e) => handleDragStart(e, sq)}
                        onDragEnd={handleDragEnd}
                        className={`leading-none ${canDrag ? "cursor-grab active:cursor-grabbing" : ""} ${dragFrom === sq ? "opacity-40" : ""} ${
                          pd.white
                            ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                            : "drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                        }`}
                        style={{
                          color: pd.white ? "var(--piece-white, #ffffff)" : "var(--piece-black, hsl(220,15%,8%))",
                        }}
                      >
                        {pd.symbol}
                      </span>
                    )
                  )}
                  {isHint && !isSelected && (
                    <span className="absolute inset-[6%] rounded-full border-2 border-amber-400/60 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Best-move arrow overlay (Stockfish) */}
        {engineOn && bestArrow && (
          <svg
            viewBox="0 0 800 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
            aria-hidden
          >
            <defs>
              <marker id="best-arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(140 70% 50%)" />
              </marker>
            </defs>
            <line
              x1={bestArrow.x1} y1={bestArrow.y1} x2={bestArrow.x2} y2={bestArrow.y2}
              stroke="hsl(140 70% 50%)" strokeWidth={14} strokeLinecap="round"
              opacity={0.85} markerEnd="url(#best-arrowhead)"
            />
          </svg>
        )}
        </div>
            {/* Right rank labels */}
            <div className="flex flex-col w-6 flex-shrink-0">
              {displayRanks.map((r) => (
                <span key={`r-${r}`} className="flex-1 flex items-center justify-center text-[11px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{r}</span>
              ))}
            </div>
          </div>
          {/* Bottom file labels */}
          <div className="flex ml-6 mr-6 mt-0.5">
            {displayFiles.map((f) => (
              <span key={`b-${f}`} className="flex-1 text-center text-[11px] font-mono font-bold text-foreground [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Practice feedback */}
      <AnimatePresence>
        {practiceResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-3 text-sm font-medium ${
              practiceResult === "correct"
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            }`}
          >
            {practiceResult === "correct" ? (
              <><CheckCircle2 className="w-4 h-4" /> Correct! {moves[practiceIndex - 1]?.explanation || "Well done!"}</>
            ) : (
              <><XCircle className="w-4 h-4" /> Wrong move — try again! Use the hint button if you're stuck.</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Practice completed */}
      {mode === "practice" && practiceCompleted && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-3 mb-3 bg-green-500/15 text-green-400 border border-green-500/30 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <p className="font-bold">Exercise Complete! 🎉</p>
            <p className="text-xs text-green-400/80">You found all the correct moves.</p>
          </div>
        </div>
      )}

      {/* Explanation bubble */}
      <div className="min-h-[60px] rounded-lg border border-border/50 bg-card p-3 mb-3">
        {mode === "guided" && currentExplanation ? (
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="font-mono font-bold text-primary">
                {getMoveNumber(moveIndex - 1) || "…"} {effectiveMoves[moveIndex - 1].san}
              </span>
              <span className="opacity-60">·</span>
              <span>Move {moveIndex} of {totalMoves}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{currentExplanation}</p>
          </div>
        ) : mode === "guided" ? (
          <p className="text-sm text-muted-foreground italic">
            {totalMoves > 0 ? "Drag a piece on the board to play the next move — or use the arrow keys / ▶ buttons." : "This position illustrates the lesson concept."}
          </p>
        ) : mode === "practice" && !practiceCompleted ? (
          <div className="space-y-1">
            <p className="text-sm text-foreground font-medium">
              Find the correct move! ({practiceIndex + 1}/{moves.length})
            </p>
            {practiceIndex < moves.length && (
              <p className="text-xs text-muted-foreground">
                {practiceChess.turn() === "w" ? "White" : "Black"} to move
              </p>
            )}
          </div>
        ) : mode === "explore" ? (
          <p className="text-sm text-muted-foreground italic">
            Explore freely — move any piece to analyze the position.
          </p>
        ) : null}
      </div>

      {/* Stockfish engine analysis (toggleable) */}
      <EngineAnalysis fen={currentFen} />

      {availableBranches && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
            <GitBranch className="w-3 h-3" />
            Alternative line at this position
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableBranches.branches.map((b, i) => (
              <button
                key={i}
                onClick={() => {
                  setBranchAt(availableBranches.atIndex);
                  setBranchIdx(i);
                  setMoveIndex(availableBranches.atIndex + 1);
                }}
                title={b.summary}
                className="px-2.5 py-1 rounded-md text-xs font-medium border border-amber-500/30 bg-card hover:bg-amber-500/10 hover:border-amber-500/50 text-foreground transition-colors"
              >
                <span className="text-amber-400/80 mr-1">→</span>
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active branch banner + back-to-main */}
      {branchAt !== null && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">In branch:</span>
            <span className="font-semibold text-foreground">
              {moves[branchAt]?.branches?.[branchIdx]?.name}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setBranchAt(null);
              setBranchIdx(0);
              setMoveIndex((i) => Math.min(i, moves.length));
            }}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Main line
          </Button>
        </div>
      )}

      {/* Move list (guided mode) — paired rows with autoscroll to active move */}
      {mode === "guided" && effectiveMoves.length > 0 && (
        <MoveListPanel
          moves={effectiveMoves}
          activeIdx={moveIndex}
          branchAt={branchAt}
          onJump={(idx) => setMoveIndex(idx + 1)}
        />
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {mode === "guided" && totalMoves > 0 && (
          <>
            <Button variant="outline" size="icon" onClick={goToStart} disabled={moveIndex === 0} className="h-9 w-9">
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goBack} disabled={moveIndex === 0} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              onClick={goForward}
              disabled={moveIndex === totalMoves}
              className="h-10 px-4 font-semibold"
            >
              Sledeći potez <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
            <span className="text-xs text-muted-foreground px-1 min-w-[52px] text-center tabular-nums">
              {moveIndex} / {totalMoves}
            </span>
            <Button variant="outline" size="icon" onClick={goToEnd} disabled={moveIndex === totalMoves} className="h-10 w-10">
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant={autoplay ? "default" : "outline"}
              size="icon"
              onClick={() => {
                if (moveIndex >= totalMoves) setMoveIndex(0);
                setAutoplay((a) => !a);
              }}
              className="h-9 w-9"
              title={autoplay ? "Pause" : "Autoplay"}
            >
              {autoplay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </>
        )}

        {mode === "practice" && !practiceCompleted && (
          <>
            <Button variant="outline" size="sm" onClick={showHint}>
              <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> Hint
            </Button>
            <Button variant="outline" size="sm" onClick={resetPractice}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restart
            </Button>
          </>
        )}
        {mode === "practice" && practiceCompleted && (
          <Button variant="outline" size="sm" onClick={resetPractice}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </Button>
        )}

        {mode === "explore" && (
          <Button variant="outline" size="sm" onClick={resetExplore}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Position
          </Button>
        )}
      </div>

      {/* Keyboard / swipe hint (guided mode only) */}
      {mode === "guided" && totalMoves > 0 && (
        <p className="text-[11px] text-muted-foreground/70 text-center mt-2 leading-relaxed">
          <span className="hidden sm:inline">Drag a piece or tap two squares to play the next move · ← → arrows also work.</span>
          <span className="sm:hidden">Drag a piece or tap two squares to play moves · swipe to step.</span>
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Move list panel: paired rows (white/black), autoscrolls active row
   into view. Designed so a 15-move variation reads top-to-bottom and
   the active move is always visible.
   ───────────────────────────────────────────────────────────────────── */
interface MoveListPanelProps {
  moves: MoveStep[];
  activeIdx: number; // 0 = before first move
  branchAt: number | null;
  onJump: (moveIndexZeroBased: number) => void;
}

function MoveListPanel({ moves, activeIdx, branchAt, onJump }: MoveListPanelProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeIdx]);

  // Group into pairs: [{ num, white, black }]
  const rows: { num: number; w?: { san: string; idx: number }; b?: { san: string; idx: number } }[] = [];
  for (let i = 0; i < moves.length; i++) {
    const num = Math.floor(i / 2) + 1;
    if (i % 2 === 0) {
      rows.push({ num, w: { san: moves[i].san, idx: i } });
    } else {
      rows[rows.length - 1].b = { san: moves[i].san, idx: i };
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card p-2 mb-3 max-h-[180px] lg:max-h-[340px] xl:max-h-[440px] overflow-y-auto">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5 text-xs">
        {rows.map((row) => {
          const isWActive = row.w && row.w.idx + 1 === activeIdx;
          const isBActive = row.b && row.b.idx + 1 === activeIdx;
          const isWBranch = branchAt !== null && row.w && row.w.idx >= branchAt;
          const isBBranch = branchAt !== null && row.b && row.b.idx >= branchAt;
          return (
            <div key={row.num} className="contents">
              <span className="text-muted-foreground font-mono text-[11px] tabular-nums pt-0.5 pr-1">{row.num}.</span>
              {row.w ? (
                <button
                  ref={isWActive ? activeRef : undefined}
                  onClick={() => onJump(row.w!.idx)}
                  className={`text-left px-1.5 py-0.5 rounded font-mono transition-colors ${
                    isWActive
                      ? "bg-primary text-primary-foreground font-bold shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
                      : isWBranch
                        ? "text-amber-400/90 hover:bg-amber-500/10"
                        : "text-foreground hover:bg-muted"
                  }`}
                >
                  {row.w.san}
                </button>
              ) : <span />}
              {row.b ? (
                <button
                  ref={isBActive ? activeRef : undefined}
                  onClick={() => onJump(row.b!.idx)}
                  className={`text-left px-1.5 py-0.5 rounded font-mono transition-colors ${
                    isBActive
                      ? "bg-primary text-primary-foreground font-bold shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
                      : isBBranch
                        ? "text-amber-400/90 hover:bg-amber-500/10"
                        : "text-foreground hover:bg-muted"
                  }`}
                >
                  {row.b.san}
                </button>
              ) : <span />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
