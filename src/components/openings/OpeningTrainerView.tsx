import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { Opening, OpeningMove, getMainLine, getAllVariationPaths } from "@/lib/openings-data";
import { LESSON_MOVES } from "@/lib/lesson-moves";
import { COURSES } from "@/lib/courses-data";
import OpeningBoard from "./OpeningBoard";
import VariationTree from "./VariationTree";
import { playChessSound } from "@/lib/chess-sounds";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, RotateCcw, Eye, Dumbbell,
  BookOpen, ChevronLeft, CheckCircle2, XCircle, Lightbulb,
  SkipBack, SkipForward
} from "lucide-react";

type Mode = "explore" | "train";

// Registry of openings that pull their lines from a `MasterKurs` course in
// `courses-data.ts` (curated titles + chapters) plus the matching lesson IDs
// in `lesson-moves.ts`. Add a new entry here when you ship another masterclass.
const MASTERCLASS_OPENINGS: Record<
  string,
  { courseId: string; lessonPrefix: string; lineCount: number }
> = {
  "masterclass-jobava-london": {
    courseId: "masterkurs-jobava-london",
    lessonPrefix: "jl",
    lineCount: 130,
  },
  "masterclass-kalashnikov": {
    courseId: "masterkurs-kalashnikov",
    lessonPrefix: "kal",
    lineCount: 50,
  },
};

interface MasterclassLine {
  id: string;
  title: string;
  moves: OpeningMove[];
}

interface OpeningTrainerViewProps {
  opening: Opening;
  onBack: () => void;
}

// Walk the tree by path indices to get the move sequence
function getMovesForPath(tree: OpeningMove[], path: number[]): OpeningMove[] {
  const moves: OpeningMove[] = [];
  let nodes = tree;
  for (const idx of path) {
    if (idx < nodes.length) {
      moves.push(nodes[idx]);
      nodes = nodes[idx].children;
    }
  }
  return moves;
}

// Get node at path
function getNodeAtPath(tree: OpeningMove[], path: number[]): OpeningMove | null {
  let nodes = tree;
  let node: OpeningMove | null = null;
  for (const idx of path) {
    if (idx >= nodes.length) return null;
    node = nodes[idx];
    nodes = node.children;
  }
  return node;
}

export default function OpeningTrainerView({ opening, onBack }: OpeningTrainerViewProps) {
  const [mode, setMode] = useState<Mode>("explore");
  const [currentPath, setCurrentPath] = useState<number[]>([0]); // path of indices into tree
  const [viewUpToIndex, setViewUpToIndex] = useState(0); // how many moves deep we're viewing
  const [flipped, setFlipped] = useState(false);
  const [selectedMasterLine, setSelectedMasterLine] = useState(0);

  // Training state
  const [trainPath, setTrainPath] = useState<number[]>([]);
  const [trainCustomMoves, setTrainCustomMoves] = useState<OpeningMove[] | null>(null);
  const [trainMoveIndex, setTrainMoveIndex] = useState(0);
  const [wrongSquare, setWrongSquare] = useState<Square | null>(null);
  const [correctSquare, setCorrectSquare] = useState<Square | null>(null);
  const [trainFeedback, setTrainFeedback] = useState<"correct" | "wrong" | null>(null);
  const [trainCompleted, setTrainCompleted] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [trainLegalMoves, setTrainLegalMoves] = useState<Square[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Build a flat list of individual variations for ANY opening.
  // Masterclass openings (Jobava, Kalashnikov, …) use curated titles + LESSON_MOVES;
  // other openings derive variations from the move tree via getAllVariationPaths().
  const masterclassLines: MasterclassLine[] = useMemo(() => {
    const mc = MASTERCLASS_OPENINGS[opening.id];
    if (mc) {
      const course = COURSES.find((c) => c.id === mc.courseId);
      const lessonTitleById = new Map<string, string>(
        (course?.lessons ?? []).map((l) => [l.id, l.title]),
      );
      return Array.from({ length: mc.lineCount }, (_, index) => {
        const lessonId = `${mc.lessonPrefix}-${index + 1}`;
        const lessonMoves = LESSON_MOVES[lessonId]?.moves || [];
        return {
          id: lessonId,
          title: lessonTitleById.get(lessonId) ?? `Line ${index + 1}`,
          moves: lessonMoves.map((move) => ({ san: move.san, explanation: move.explanation, children: [], isMainLine: true })),
        };
      }).filter((line) => line.moves.length > 0);
    }

    // For every other opening: build one card per leaf-path in the tree.
    const paths = getAllVariationPaths(opening.tree);
    return paths.map((path, index) => {
      // Try to derive a friendly title: last move with explanation, else "Variation N"
      const lastMoveWithExpl = [...path].reverse().find((m) => m.explanation);
      const fallbackTitle = `Variation ${index + 1}`;
      const title = lastMoveWithExpl?.explanation
        ? lastMoveWithExpl.explanation.split(/[.—–-]/)[0].trim().slice(0, 60) || fallbackTitle
        : fallbackTitle;
      return {
        id: `${opening.id}-var-${index}`,
        title: title || fallbackTitle,
        moves: path,
      };
    });
  }, [opening.id, opening.tree]);

  // Treat any opening with 2+ variations as the "individual variations" UI
  const isMasterclassOpening = masterclassLines.length >= 2;
  const activeMasterLine = isMasterclassOpening ? masterclassLines[selectedMasterLine] : null;

  // Build the full path of moves for the current selection
  const fullMovePath = useMemo(() => {
    if (activeMasterLine) return activeMasterLine.moves;
    // Walk from root, always taking index from currentPath
    return getMovesForPath(opening.tree, currentPath);
  }, [activeMasterLine, opening.tree, currentPath]);

  // Clamp viewUpToIndex
  const clampedView = Math.min(viewUpToIndex, fullMovePath.length - 1);

  // Build the FEN for the current view position
  const { fen, lastMove } = useMemo(() => {
    const game = new Chess();
    let last: { from: string; to: string } | null = null;
    const movesToApply = fullMovePath.slice(0, clampedView + 1);
    for (const mv of movesToApply) {
      try {
        const result = game.move(mv.san);
        if (result) last = { from: result.from, to: result.to };
      } catch { break; }
    }
    return { fen: game.fen(), lastMove: last };
  }, [fullMovePath, clampedView]);

  // Current node's explanation
  const currentNode = fullMovePath[clampedView] || null;
  const highlightSquares = currentNode?.highlightSquares || [];

  // Navigation
  const goForward = useCallback(() => {
    if (clampedView < fullMovePath.length - 1) {
      setViewUpToIndex(clampedView + 1);
      playChessSound("move");
    }
  }, [clampedView, fullMovePath.length]);

  const goBack = useCallback(() => {
    if (clampedView > 0) {
      setViewUpToIndex(clampedView - 1);
      playChessSound("move");
    }
  }, [clampedView]);

  const goToStart = useCallback(() => {
    setViewUpToIndex(0);
  }, []);

  const goToEnd = useCallback(() => {
    setViewUpToIndex(fullMovePath.length - 1);
  }, [fullMovePath.length]);

  // Handle tree node selection
  const handleSelectNode = useCallback((path: number[]) => {
    setCurrentPath(path);
    // Set viewUpToIndex to show up to this depth
    setViewUpToIndex(path.length - 1);
    playChessSound("move");
  }, []);

  const handleSelectMasterLine = useCallback((index: number) => {
    setSelectedMasterLine(index);
    setViewUpToIndex(0);
    setTrainCustomMoves(null);
    setMode("explore");
    playChessSound("move");
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (mode === "train") return;
      if (e.key === "ArrowRight") goForward();
      else if (e.key === "ArrowLeft") goBack();
      else if (e.key === "Home") goToStart();
      else if (e.key === "End") goToEnd();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, goForward, goBack, goToStart, goToEnd]);

  // Extend path if we navigate deeper and need to pick children
  useEffect(() => {
    if (activeMasterLine) return;
    // If viewUpToIndex goes past current path length, extend with main line (index 0)
    if (viewUpToIndex >= currentPath.length) {
      const node = getNodeAtPath(opening.tree, currentPath);
      if (node && node.children.length > 0) {
        setCurrentPath([...currentPath, 0]);
      }
    }
  }, [activeMasterLine, viewUpToIndex, currentPath, opening.tree]);

  // ═══════ TRAINING MODE ═══════
  const allPaths = useMemo(() => isMasterclassOpening ? masterclassLines.map((line) => line.moves) : getAllVariationPaths(opening.tree), [isMasterclassOpening, masterclassLines, opening.tree]);
  const mainLineMoves = useMemo(() => activeMasterLine?.moves || getMainLine(opening.tree), [activeMasterLine, opening.tree]);

  const startTraining = useCallback((pathMoves?: OpeningMove[]) => {
    const moves = pathMoves || mainLineMoves;
    if (isMasterclassOpening) {
      setTrainCustomMoves(moves);
      setTrainPath([]);
      setTrainMoveIndex(0);
      setTrainCompleted(false);
      setTrainFeedback(null);
      setWrongSquare(null);
      setCorrectSquare(null);
      setSelectedSquare(null);
      setTrainLegalMoves([]);
      setShowHint(false);
      setMode("train");
      return;
    }
    const pathIndices: number[] = [];
    let nodes = opening.tree;
    for (const mv of moves) {
      const idx = nodes.findIndex(n => n.san === mv.san);
      if (idx >= 0) {
        pathIndices.push(idx);
        nodes = nodes[idx].children;
      }
    }
    setTrainPath(pathIndices);
    setTrainCustomMoves(null);
    setTrainMoveIndex(0);
    setTrainCompleted(false);
    setTrainFeedback(null);
    setWrongSquare(null);
    setCorrectSquare(null);
    setSelectedSquare(null);
    setTrainLegalMoves([]);
    setShowHint(false);
    setMode("train");
  }, [isMasterclassOpening, mainLineMoves, opening.tree]);

  const trainMovesSequence = useMemo(() => trainCustomMoves || getMovesForPath(opening.tree, trainPath), [opening.tree, trainCustomMoves, trainPath]);

  const trainFen = useMemo(() => {
    const game = new Chess();
    for (let i = 0; i < trainMoveIndex; i++) {
      try { game.move(trainMovesSequence[i].san); } catch { break; }
    }
    return game.fen();
  }, [trainMovesSequence, trainMoveIndex]);

  const trainLastMove = useMemo(() => {
    if (trainMoveIndex === 0) return null;
    const game = new Chess();
    let last: { from: string; to: string } | null = null;
    for (let i = 0; i < trainMoveIndex; i++) {
      try {
        const r = game.move(trainMovesSequence[i].san);
        if (r) last = { from: r.from, to: r.to };
      } catch { break; }
    }
    return last;
  }, [trainMovesSequence, trainMoveIndex]);

  // Who plays at trainMoveIndex? White is even indices
  const isUserTurnInTraining = trainMoveIndex % 2 === (flipped ? 1 : 0);

  // Auto-play opponent moves in training
  useEffect(() => {
    if (mode !== "train" || trainCompleted) return;
    if (trainMoveIndex >= trainMovesSequence.length) {
      setTrainCompleted(true);
      playChessSound("gameOver");
      return;
    }
    if (!isUserTurnInTraining) {
      const timer = setTimeout(() => {
        setTrainMoveIndex(prev => prev + 1);
        playChessSound("move");
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [mode, trainMoveIndex, isUserTurnInTraining, trainCompleted, trainMovesSequence.length]);

  const handleTrainSquareClick = useCallback((square: Square) => {
    if (!isUserTurnInTraining || trainCompleted) return;
    if (trainMoveIndex >= trainMovesSequence.length) return;

    const game = new Chess();
    for (let i = 0; i < trainMoveIndex; i++) {
      try { game.move(trainMovesSequence[i].san); } catch { break; }
    }

    const expectedSan = trainMovesSequence[trainMoveIndex].san;

    if (selectedSquare) {
      // Try the move
      try {
        const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
        if (move) {
          // Check if it matches expected
          // Compare SANs
          const trialGame = new Chess(game.fen());
          // Actually we already made the move on 'game', let's check
          // The move SAN was generated by chess.js, compare
          game.undo();
          const correctMove = game.move(expectedSan);
          if (correctMove && correctMove.from === move.from && correctMove.to === move.to) {
            // Correct!
            setTrainFeedback("correct");
            setCorrectSquare(square);
            setWrongSquare(null);
            setSelectedSquare(null);
            setTrainLegalMoves([]);
            setShowHint(false);
            playChessSound("move");
            setTimeout(() => {
              setTrainMoveIndex(prev => prev + 1);
              setTrainFeedback(null);
              setCorrectSquare(null);
            }, 400);
          } else {
            // Wrong move
            setTrainFeedback("wrong");
            setWrongSquare(square);
            setSelectedSquare(null);
            setTrainLegalMoves([]);
            playChessSound("check");
            setTimeout(() => {
              setTrainFeedback(null);
              setWrongSquare(null);
            }, 1500);
          }
        } else {
          setSelectedSquare(null);
          setTrainLegalMoves([]);
        }
      } catch {
        setSelectedSquare(null);
        setTrainLegalMoves([]);
      }
    } else {
      // Select a piece
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setTrainLegalMoves(moves.map(m => m.to as Square));
      }
    }
  }, [selectedSquare, trainMoveIndex, trainMovesSequence, isUserTurnInTraining, trainCompleted]);

  const handleShowHint = useCallback(() => {
    if (trainMoveIndex >= trainMovesSequence.length) return;
    const game = new Chess();
    for (let i = 0; i < trainMoveIndex; i++) {
      try { game.move(trainMovesSequence[i].san); } catch { break; }
    }
    const expectedSan = trainMovesSequence[trainMoveIndex].san;
    try {
      const move = game.move(expectedSan);
      if (move) {
        setShowHint(true);
        setCorrectSquare(move.from as Square);
        setTimeout(() => {
          setShowHint(false);
          setCorrectSquare(null);
        }, 2000);
      }
    } catch { /* */ }
  }, [trainMoveIndex, trainMovesSequence]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground flex items-start gap-2 leading-snug">
              <span className="shrink-0">{opening.icon}</span>
              <span className="break-words">{opening.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "explore" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMode("explore"); setSelectedSquare(null); setTrainLegalMoves([]); }}
              className="gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              Explore
            </Button>
            <Button
              variant={mode === "train" ? "default" : "outline"}
              size="sm"
              onClick={() => startTraining()}
              className="gap-1"
            >
              <Dumbbell className="h-3.5 w-3.5" />
              Train
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Board area */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "explore" ? (
                <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OpeningBoard
                    fen={fen}
                    lastMove={lastMove}
                    highlightSquares={highlightSquares}
                    flipped={flipped}
                  />
                </motion.div>
              ) : (
                <motion.div key="train" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OpeningBoard
                    fen={trainFen}
                    lastMove={trainLastMove}
                    flipped={flipped}
                    onSquareClick={handleTrainSquareClick}
                    selectedSquare={selectedSquare}
                    legalMoves={trainLegalMoves}
                    wrongSquare={wrongSquare}
                    correctSquare={correctSquare}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            {mode === "explore" && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={goToStart} disabled={clampedView === 0}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goBack} disabled={clampedView === 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goForward} disabled={clampedView >= fullMovePath.length - 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToEnd} disabled={clampedView >= fullMovePath.length - 1}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFlipped(!flipped)} className="ml-2">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Training feedback */}
            {mode === "train" && (
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {trainFeedback === "wrong" && (
                    <motion.div
                      key="wrong"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                    >
                      <XCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Incorrect — try again!</span>
                    </motion.div>
                  )}
                  {trainFeedback === "correct" && (
                    <motion.div
                      key="correct"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    >
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Correct!</span>
                    </motion.div>
                  )}
                  {trainCompleted && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center"
                    >
                      <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">Variation Mastered!</p>
                      <p className="text-xs text-muted-foreground mt-1">You completed this line perfectly.</p>
                      <Button size="sm" className="mt-3" onClick={() => startTraining()}>
                        Practice Again
                      </Button>
                    </motion.div>
                  )}
                  {!trainFeedback && !trainCompleted && isUserTurnInTraining && (
                    <motion.div
                      key="prompt"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        Your turn — play the correct move
                      </span>
                      <Button variant="ghost" size="sm" onClick={handleShowHint} className="gap-1 text-primary">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Hint
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Training progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${trainMovesSequence.length > 0 ? (trainMoveIndex / trainMovesSequence.length) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {trainMoveIndex}/{trainMovesSequence.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setFlipped(!flipped)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => startTraining()}>
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {/* Explanation */}
            {mode === "explore" && currentNode?.explanation && (
              <motion.div
                key={currentNode.san + clampedView}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-mono text-primary mr-2">
                      {Math.floor(clampedView / 2) + 1}{clampedView % 2 === 0 ? "." : "..."}{currentNode.san}
                    </span>
                    <span className="text-sm text-muted-foreground">{currentNode.explanation}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar — Variation Tree */}
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {isMasterclassOpening ? `${masterclassLines.length} Individual Variation${masterclassLines.length === 1 ? "" : "s"}` : "Variation Tree"}
              </h3>
              {isMasterclassOpening ? (
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary/25 bg-primary/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase text-primary">Variation {selectedMasterLine + 1}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{fullMovePath.length} moves</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground leading-snug">{activeMasterLine?.title}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {masterclassLines.map((line, index) => (
                      <button
                        key={line.id}
                        onClick={() => handleSelectMasterLine(index)}
                        className={`group w-full rounded-lg border p-3 text-left transition-all ${
                          selectedMasterLine === index
                            ? "border-primary bg-primary/10 shadow-[0_0_18px_hsl(var(--primary)/0.18)]"
                            : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold ${selectedMasterLine === index ? "bg-primary text-primary-foreground" : "bg-card text-primary border border-border/50"}`}>
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground leading-tight">{line.title}</p>
                            <p className="mt-1 truncate text-[11px] font-mono text-muted-foreground">{line.moves.map((move) => move.san).join(" ")}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                  <VariationTree
                    tree={opening.tree}
                    currentPath={currentPath.slice(0, clampedView + 1)}
                    onSelectNode={handleSelectNode}
                  />
                </div>
              )}
            </div>

            {/* Train specific lines */}
            {mode === "explore" && (
              <div className="bg-card border border-border/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  Practice Lines
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => startTraining()}
                  >
                    {isMasterclassOpening ? `Selected: ${selectedMasterLine + 1}. ${activeMasterLine?.title}` : "Main Line"}
                  </Button>
                  {allPaths.slice(0, isMasterclassOpening ? masterclassLines.length : 6).map((path, i) => {
                    const label = isMasterclassOpening
                      ? `${i + 1}. ${masterclassLines[i]?.title || "Variation"}`
                      : `Line ${i + 1}: ${path.map(m => m.san).join(" ")}`;
                    return (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs font-mono text-muted-foreground h-auto py-2 whitespace-normal text-left leading-snug break-words"
                        onClick={() => startTraining(path)}
                      >
                        <span className="block w-full break-words">{label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
