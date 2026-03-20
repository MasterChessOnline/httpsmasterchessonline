import { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStoryProgress } from "@/hooks/use-story-progress";
import { STORY_CHAPTERS, TOTAL_CHAPTERS, getArcColor, type StoryChapter } from "@/lib/story-data";
import { getAIMove, type Difficulty } from "@/lib/chess-ai";
import { playChessSound } from "@/lib/chess-sounds";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChessBoard from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Lock, CheckCircle, Star, ChevronRight, Swords,
  Trophy, ArrowLeft, Loader2, Play, Video
} from "lucide-react";

const StoryMode = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { progress, loading: progressLoading, markCompleted, completedCount, totalStars } = useStoryProgress(user?.id);

  const [selectedChapter, setSelectedChapter] = useState<StoryChapter | null>(null);
  const [playing, setPlaying] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [fen, setFen] = useState("start");
  const [gameResult, setGameResult] = useState<string | null>(null);
  const gameRef = useRef(new Chess());

  // All chapters unlocked - determine sequential unlock
  const isChapterUnlocked = (ch: StoryChapter, idx: number): boolean => {
    if (idx === 0) return true;
    // Must have completed previous chapter
    const prevKey = STORY_CHAPTERS[idx - 1]?.key;
    if (prevKey && !progress[prevKey]?.completed) return false;
    return true;
  };

  const getDifficultyForRating = (rating: number): Difficulty => {
    if (rating <= 700) return "beginner";
    if (rating <= 1300) return "intermediate";
    return "advanced";
  };

  const startChapter = (ch: StoryChapter) => {
    setSelectedChapter(ch);
    setPlaying(true);
    setGameResult(null);
    const startFen = ch.startingFen || undefined;
    gameRef.current = startFen ? new Chess(startFen) : new Chess();
    setFen(gameRef.current.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    playChessSound("start");
  };

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!gameResult;

  useEffect(() => {
    if (!playing || !selectedChapter || game.turn() !== "b" || isGameOver) return;
    setAiThinking(true);
    const difficulty = getDifficultyForRating(selectedChapter.aiRating);
    const timeout = setTimeout(() => {
      const aiMove = getAIMove(game, difficulty);
      if (aiMove) {
        const move = game.move(aiMove);
        if (move) {
          setLastMove({ from: move.from, to: move.to });
          setFen(game.fen());
          if (game.isCheckmate()) {
            setGameResult("0-1");
            playChessSound("gameOver");
          } else if (game.isDraw() || game.isStalemate()) {
            setGameResult("draw");
            playChessSound("gameOver");
          } else if (game.isCheck()) {
            playChessSound("check");
          } else if (move.captured) {
            playChessSound("capture");
          } else {
            playChessSound("move");
          }
        }
      }
      setAiThinking(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [fen, playing, isGameOver]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver || game.turn() !== "w" || aiThinking) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setLastMove({ from: move.from, to: move.to });
        setFen(game.fen());
        if (game.isCheckmate()) {
          setGameResult("1-0");
          playChessSound("gameOver");
          if (selectedChapter) {
            const stars = game.moveNumber() <= 20 ? 3 : game.moveNumber() <= 35 ? 2 : 1;
            markCompleted(selectedChapter.key, stars);
          }
        } else if (game.isDraw() || game.isStalemate()) {
          setGameResult("draw");
          playChessSound("gameOver");
        } else if (game.isCheck()) {
          playChessSound("check");
        } else if (move.captured) {
          playChessSound("capture");
        } else {
          playChessSound("move");
        }
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === "w") {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (playing && selectedChapter) {
    const won = gameResult === "1-0";
    const lost = gameResult === "0-1";

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => { setPlaying(false); setSelectedChapter(null); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">{selectedChapter.title}</h1>
              <p className={`text-xs ${getArcColor(selectedChapter.subtitle)}`}>{selectedChapter.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
            <div className="w-full max-w-[min(85vw,480px)]">
              <ChessBoard
                game={game}
                flipped={false}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                isGameOver={isGameOver}
                isPlayerTurn={game.turn() === "w" && !aiThinking}
                hintSquare={null}
                onSquareClick={handleSquareClick}
              />
            </div>

            <div className="w-full max-w-xs space-y-3">
              <div className="rounded-xl border border-border/40 bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Objective</p>
                <p className="text-sm font-medium text-foreground">{selectedChapter.objective}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Bot Rating: <span className="font-mono text-primary">{selectedChapter.aiRating}</span>
                </p>
              </div>

              {aiThinking && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> DailyChess_12 is thinking…
                </div>
              )}

              {isGameOver && (
                <div className={`rounded-xl border p-4 text-center space-y-3 ${won ? "border-green-500/30 bg-green-500/5" : lost ? "border-destructive/30 bg-destructive/5" : "border-border/40 bg-card"}`}>
                  <p className="font-display text-lg font-bold text-foreground">
                    {won ? "🎉 Victory!" : lost ? "😞 Defeat" : "🤝 Draw"}
                  </p>
                  {won && selectedChapter.reward.badge && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Reward unlocked:</p>
                      <Badge className="bg-primary/20 text-primary border-primary/30">{selectedChapter.reward.badge}</Badge>
                      {selectedChapter.reward.title && (
                        <p className="text-xs text-primary">Title: {selectedChapter.reward.title}</p>
                      )}
                    </div>
                  )}
                  {won && selectedChapter.reward.videoTip && (
                    <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground">
                      <Video className="h-3 w-3 text-primary" />
                      <span>Unlocked: {selectedChapter.reward.videoTip}</span>
                    </div>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => startChapter(selectedChapter)}>
                      <Play className="h-3.5 w-3.5 mr-1" /> Retry
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setPlaying(false); setSelectedChapter(null); }}>
                      Back to Map
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progressPct = Math.round((completedCount / TOTAL_CHAPTERS) * 100);

  const arcs: { name: string; chapters: { ch: StoryChapter; idx: number }[] }[] = [];
  STORY_CHAPTERS.forEach((ch, idx) => {
    const arcName = ch.subtitle;
    let arc = arcs.find(a => a.name === arcName);
    if (!arc) {
      arc = { name: arcName, chapters: [] };
      arcs.push(arc);
    }
    arc.chapters.push({ ch, idx });
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="text-center mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
            <BookOpen className="w-3 h-3 mr-1" /> Story Mode
          </Badge>
          <h1 className="font-display text-4xl font-bold text-foreground">
            The <span className="text-gradient-gold">Chess Adventure</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete AI challenges, unlock rewards, and master your skills
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground">Story Progress</span>
            <span className="font-mono text-primary font-bold">{completedCount}/{TOTAL_CHAPTERS} · {progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-1.5">
            <span>{totalStars} ⭐ earned</span>
            <span>Complete chapters to unlock the next</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {arcs.map(arc => (
            <div key={arc.name}>
              <h2 className={`font-display text-lg font-bold mb-3 ${getArcColor(arc.name)}`}>
                {arc.name}
              </h2>
              <div className="space-y-2">
                {arc.chapters.map(({ ch, idx }) => {
                  const unlocked = isChapterUnlocked(ch, idx);
                  const completed = progress[ch.key]?.completed;
                  const stars = progress[ch.key]?.stars || 0;

                  return (
                    <div
                      key={ch.key}
                      className={`rounded-xl border p-4 transition-all ${
                        completed
                          ? "border-green-500/30 bg-green-500/5"
                          : unlocked
                          ? "border-border/50 bg-card hover:border-primary/30 cursor-pointer"
                          : "border-border/30 bg-muted/10 opacity-60"
                      }`}
                      onClick={() => {
                        if (unlocked) startChapter(ch);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          completed ? "bg-green-500/20" : unlocked ? "bg-primary/15" : "bg-muted/30"
                        }`}>
                          {completed ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : !unlocked ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Swords className="h-5 w-5 text-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {ch.difficulty}
                            </Badge>
                            {ch.reward.videoTip && <Video className="h-3 w-3 text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                          {completed && stars > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3].map(s => (
                                <Star key={s} className={`h-3 w-3 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ch.aiRating} Elo</span>
                          {unlocked && !completed && (
                            <ChevronRight className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoryMode;
