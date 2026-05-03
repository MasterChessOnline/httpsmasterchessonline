import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Chess, Square } from "chess.js";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trophy, Calendar, ArrowLeft } from "lucide-react";
import ChessBoard from "@/components/chess/ChessBoard";
import { getMasterGameById } from "@/lib/masterchess-db";

export default function MasterGameView() {
  const { id } = useParams();
  const game = useMemo(() => (id ? getMasterGameById(id) : undefined), [id]);

  const moves = useMemo(() => {
    if (!game) return [] as { san: string; from: string; to: string }[];
    const c = new Chess();
    try { c.loadPgn(game.pgn); } catch { return []; }
    return c.history({ verbose: true }).map(m => ({ san: m.san, from: m.from, to: m.to }));
  }, [game]);

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [id]);

  const board = useMemo(() => {
    const c = new Chess();
    for (let i = 0; i < idx; i++) c.move(moves[i].san);
    return c;
  }, [idx, moves]);

  const lastMove = idx > 0 ? { from: moves[idx - 1].from, to: moves[idx - 1].to } : null;

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Game not found</h1>
          <Link to="/opening-explorer"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Explorer</Button></Link>
        </div>
      </div>
    );
  }

  const resultStr = game.winner === "white" ? "1-0" : game.winner === "black" ? "0-1" : "½-½";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-16 max-w-6xl">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-xl font-bold">
                {game.white.name} <span className="text-muted-foreground">vs</span> {game.black.name}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                <Badge variant="outline" className="text-[10px]">W {game.white.rating}</Badge>
                <Badge variant="outline" className="text-[10px]">B {game.black.rating}</Badge>
                {game.event && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {game.event} · {game.year}</span>}
                <Badge variant="secondary" className="text-[10px]">{resultStr}</Badge>
                <Badge className="text-[10px] bg-primary/15 text-primary border border-primary/30">MasterChess DB</Badge>
              </div>
            </div>
          </div>
          <Link to="/opening-explorer"><Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Explorer</Button></Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] gap-6">
          <div>
            <ChessBoard
              game={board}
              flipped={false}
              selectedSquare={null}
              legalMoves={[] as Square[]}
              lastMove={lastMove}
              isGameOver={false}
              isPlayerTurn={false}
              hintSquare={null}
              onSquareClick={() => {}}
            />
            <div className="flex items-center gap-1 justify-center mt-3">
              <Button size="sm" variant="ghost" onClick={() => setIdx(0)}><ChevronsLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setIdx(Math.min(moves.length, idx + 1))}><ChevronRight className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setIdx(moves.length)}><ChevronsRight className="w-4 h-4" /></Button>
            </div>
            <Slider value={[idx]} min={0} max={moves.length} step={1} onValueChange={([v]) => setIdx(v)} className="mt-2" />
            <p className="text-center text-xs text-muted-foreground mt-1">Move {idx} / {moves.length}</p>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</h3>
            <div className="max-h-[460px] overflow-y-auto">
              <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 text-sm">
                {moves.map((m, i) => i % 2 === 0 ? (
                  <div key={i} className="contents">
                    <span className="text-muted-foreground/60 text-xs font-mono">{Math.floor(i / 2) + 1}.</span>
                    <button onClick={() => setIdx(i + 1)}
                      className={`text-left font-mono px-1 rounded ${idx === i + 1 ? "bg-primary/20 text-primary font-bold" : "text-foreground hover:bg-muted/30"}`}>{m.san}</button>
                    <button onClick={() => setIdx(i + 2)}
                      className={`text-left font-mono px-1 rounded ${idx === i + 2 ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground hover:bg-muted/30"}`}>{moves[i + 1]?.san || ""}</button>
                  </div>
                ) : null)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
