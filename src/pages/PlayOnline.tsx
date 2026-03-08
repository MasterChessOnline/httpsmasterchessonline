import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RotateCcw, Wifi, Flag, Timer, Loader2, Send } from "lucide-react";
import ChessClock, { TIME_CONTROLS } from "@/components/ChessClock";
import { useOnlineGame } from "@/hooks/use-online-game";
import { playChessSound } from "@/lib/chess-sounds";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_DISPLAY: Record<string, { symbol: string; className: string }> = {
  wk: { symbol: "♚", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wq: { symbol: "♛", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wr: { symbol: "♜", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wb: { symbol: "♝", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wn: { symbol: "♞", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  wp: { symbol: "♟", className: "text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" },
  bk: { symbol: "♚", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bq: { symbol: "♛", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  br: { symbol: "♜", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bb: { symbol: "♝", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bn: { symbol: "♞", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
  bp: { symbol: "♟", className: "text-[#1a1a2e] drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]" },
};

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

const PlayOnline = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    status: onlineStatus, game: onlineGame, myColor, error: onlineError,
    searchMatch, cancelSearch, makeMove, endGame, resign, reset: resetOnline,
  } = useOnlineGame();

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [timeoutWinner, setTimeoutWinner] = useState<string | null>(null);
  const [timeControlIdx, setTimeControlIdx] = useState(4);
  const gameRef = useRef(new Chess());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tc = TIME_CONTROLS[timeControlIdx];
  const unlimited = tc.seconds === 0;
  const [whiteTime, setWhiteTime] = useState(tc.seconds);
  const [blackTime, setBlackTime] = useState(tc.seconds);
  const [gameStarted, setGameStarted] = useState(false);

  const game = gameRef.current;
  const isGameOver = game.isGameOver() || !!timeoutWinner || onlineStatus === "finished";

  // Subscribe to chat
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    
    // Load existing messages
    supabase.from("game_messages").select("*").eq("game_id", onlineGame.id)
      .order("created_at", { ascending: true }).then(({ data }) => {
        if (data) setChatMessages(data as ChatMessage[]);
      });

    const channel = supabase.channel(`chat-${onlineGame.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "game_messages",
        filter: `game_id=eq.${onlineGame.id}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onlineGame?.id, onlineStatus]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim() || !onlineGame || !user) return;
    await supabase.from("game_messages").insert({
      game_id: onlineGame.id, user_id: user.id, message: chatInput.trim(),
    });
    setChatInput("");
  };

  // Sync board when online game updates
  useEffect(() => {
    if (!onlineGame || onlineStatus !== "playing") return;
    if (onlineGame.fen !== game.fen()) {
      const prevFen = game.fen();
      gameRef.current = new Chess(onlineGame.fen);
      setSelectedSquare(null);
      setLegalMoves([]);
      setGameStarted(true);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      // Play sound for opponent's move (when FEN changed and it's now our turn)
      if (prevFen !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" && gameRef.current.turn() === myColor) {
        const g = gameRef.current;
        if (g.isCheckmate() || g.isDraw() || g.isStalemate()) {
          playChessSound("gameOver");
        } else if (g.isCheck()) {
          playChessSound("check");
        } else {
          // Check last move for capture by looking at SAN
          const moves = onlineGame.pgn?.split(" ").filter(Boolean) || [];
          const lastSan = moves[moves.length - 1] || "";
          playChessSound(lastSan.includes("x") ? "capture" : "move");
        }
      }
    }
    setWhiteTime(onlineGame.white_time);
    setBlackTime(onlineGame.black_time);
  }, [onlineGame]);

  useEffect(() => {
    if (onlineGame && onlineStatus === "playing") {
      setWhiteTime(onlineGame.white_time);
      setBlackTime(onlineGame.black_time);
      gameRef.current = new Chess(onlineGame.fen);
      if (onlineGame.pgn) setMoveHistory(onlineGame.pgn.split(" ").filter(Boolean));
      setGameStarted(true);
      playChessSound("start");
    }
  }, [onlineStatus]);

  const boardFlipped = myColor === "b";
  const displayFiles = boardFlipped ? [...FILES].reverse() : FILES;
  const displayRanks = boardFlipped ? [...RANKS].reverse() : RANKS;
  const board = game.board();
  const lastMove = onlineGame?.last_move_from && onlineGame?.last_move_to
    ? { from: onlineGame.last_move_from, to: onlineGame.last_move_to } : null;

  const handleTimeOut = useCallback((color: "w" | "b") => {
    const result = color === "w" ? "0-1" : "1-0";
    setTimeoutWinner(color === "w" ? "Black" : "White");
    if (onlineGame) endGame(result);
  }, [onlineGame, endGame]);

  const handleSquareClick = (square: Square) => {
    if (isGameOver || onlineStatus !== "playing" || game.turn() !== myColor) return;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setMoveHistory(prev => [...prev, move.san]);
        setGameStarted(true);
        let wt = whiteTime, bt = blackTime;
        if (!unlimited && onlineGame && onlineGame.increment > 0) {
          if (move.color === "w") { wt += onlineGame.increment; setWhiteTime(wt); }
          else { bt += onlineGame.increment; setBlackTime(bt); }
        }
        makeMove(game.fen(), move.san, move.from, move.to, game.turn(), wt, bt);
        // Sound effects
        if (game.isCheckmate() || game.isDraw() || game.isStalemate()) {
          playChessSound("gameOver");
        } else if (game.isCheck()) {
          playChessSound("check");
        } else if (move.captured) {
          playChessSound("capture");
        } else {
          playChessSound("move");
        }
        if (game.isCheckmate()) endGame(game.turn() === "w" ? "0-1" : "1-0");
        else if (game.isDraw() || game.isStalemate()) endGame("1/2-1/2");
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(game.moves({ square, verbose: true }).map(m => m.to as Square));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const activeClockColor = isGameOver || !gameStarted ? null : game.turn();

  const statusText = onlineGame?.status === "finished"
    ? onlineGame.result === "1-0" ? "White wins!" : onlineGame.result === "0-1" ? "Black wins!" : "Draw!"
    : timeoutWinner ? `${timeoutWinner} wins on time!`
    : game.isCheckmate() ? `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`
    : game.isDraw() ? "Draw!" : game.isStalemate() ? "Stalemate!"
    : game.isCheck() ? `${game.turn() === "w" ? "White" : "Black"} is in check!`
    : onlineStatus === "playing" && game.turn() === myColor ? "Your turn"
    : onlineStatus === "playing" ? "Opponent's turn" : "";

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16 text-center">
          <Wifi className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Play Online</h1>
          <p className="text-muted-foreground mb-6">Log in to play against other players online.</p>
          <Button onClick={() => navigate("/login")}>Log In</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (onlineStatus === "idle" || onlineStatus === "searching") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
            Play <span className="text-gradient-gold">Online</span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">Find an opponent and play in real-time</p>
          <div className="max-w-md mx-auto space-y-6">
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Timer className="h-3 w-3" /> Time Control</p>
              <div className="grid grid-cols-4 gap-2">
                {TIME_CONTROLS.filter((_, i) => i < TIME_CONTROLS.length - 1).map((t, i) => (
                  <button key={t.label} onClick={() => setTimeControlIdx(i)} disabled={onlineStatus === "searching"}
                    className={`rounded-lg px-2 py-3 text-center transition-all border text-sm font-medium ${timeControlIdx === i ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"} disabled:opacity-50`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <p className="text-sm text-muted-foreground">Playing as</p>
              <p className="font-display text-lg font-bold text-foreground">{profile?.display_name || profile?.username || "Player"}</p>
              <p className="text-xs text-muted-foreground">Rating: {profile?.rating || 1200}</p>
            </div>
            {onlineError && <p className="text-sm text-destructive text-center">{onlineError}</p>}
            {onlineStatus === "searching" ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Looking for an opponent…</span>
                </div>
                <Button variant="outline" onClick={cancelSearch}>Cancel</Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={() => searchMatch(timeControlIdx)}>
                <Wifi className="mr-2 h-5 w-5" /> Find Match
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          Play <span className="text-gradient-gold">Online</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">You are {myColor === "w" ? "White" : "Black"}</p>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="w-full max-w-[min(90vw,480px)] space-y-2">
            {!unlimited && (
              <ChessClock whiteTime={whiteTime} blackTime={blackTime} activeColor={activeClockColor}
                isGameOver={isGameOver} onTimeOut={handleTimeOut} setWhiteTime={setWhiteTime} setBlackTime={setBlackTime} unlimited={unlimited} />
            )}
            <div role="grid" aria-label="Chess board">
              {displayRanks.map((rank) => (
                <div key={rank} className="flex" role="row">
                  {displayFiles.map((file) => {
                    const square = `${file}${rank}` as Square;
                    const origRi = RANKS.indexOf(rank);
                    const origFi = FILES.indexOf(file);
                    const isLight = (origRi + origFi) % 2 === 0;
                    const piece = board[origRi][origFi];
                    const isSelected = selectedSquare === square;
                    const isLegal = legalMoves.includes(square);
                    const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
                    const pieceKey = piece ? `${piece.color}${piece.type}` : null;
                    const pieceDisplay = pieceKey ? PIECE_DISPLAY[pieceKey] : null;

                    return (
                      <button key={square} role="gridcell"
                        aria-label={`${file}${rank}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : ""}`}
                        className={`aspect-square w-[12.5%] flex items-center justify-center text-3xl sm:text-5xl select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
                          ${isLight ? "bg-board-light" : "bg-board-dark"}
                          ${isSelected ? "ring-2 ring-primary ring-inset brightness-125" : ""}
                          ${isLastMove && !isSelected ? "brightness-110" : ""}
                          ${isLegal ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => handleSquareClick(square)} tabIndex={0}>
                        {isLegal && !piece && <span className="block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary/40" />}
                        {isLegal && pieceDisplay && <span className={`${pieceDisplay.className} drop-shadow-[0_0_6px_hsl(var(--primary))]`}>{pieceDisplay.symbol}</span>}
                        {!isLegal && pieceDisplay && <span className={pieceDisplay.className}>{pieceDisplay.symbol}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <div className="rounded-lg border border-border/50 bg-card p-4" role="status" aria-live="polite">
              <p className="font-display text-lg font-semibold text-foreground">{statusText}</p>
            </div>

            {onlineStatus === "playing" && !isGameOver && (
              <Button onClick={resign} variant="destructive" className="w-full"><Flag className="mr-2 h-4 w-4" /> Resign</Button>
            )}
            {isGameOver && (
              <Button onClick={resetOnline} variant="outline" className="w-full"><RotateCcw className="mr-2 h-4 w-4" /> New Game</Button>
            )}

            {/* Move history */}
            <div className="rounded-lg border border-border/50 bg-card p-4 max-h-40 overflow-y-auto">
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">Moves</h3>
              {moveHistory.length === 0 ? <p className="text-xs text-muted-foreground">No moves yet</p> : (
                <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                  {moveHistory.map((move, i) => i % 2 === 0 ? (
                    <div key={i} className="contents">
                      <span className="text-muted-foreground text-xs">{Math.floor(i / 2) + 1}.</span>
                      <span className="text-foreground font-medium">{move}</span>
                      <span className="text-muted-foreground">{moveHistory[i + 1] || ""}</span>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>

            {/* Chat */}
            {onlineGame && (
              <div className="rounded-lg border border-border/50 bg-card p-3 space-y-2">
                <h3 className="font-display text-sm font-semibold text-foreground">Chat</h3>
                <div className="h-32 overflow-y-auto space-y-1 text-xs">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={msg.user_id === user?.id ? "text-right" : "text-left"}>
                      <span className={`inline-block px-2 py-1 rounded-lg ${msg.user_id === user?.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-1">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type…" className="h-8 text-xs"
                    onKeyDown={e => e.key === "Enter" && sendChat()} />
                  <Button size="sm" variant="ghost" onClick={sendChat} className="h-8 w-8 p-0"><Send className="h-3 w-3" /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlayOnline;
