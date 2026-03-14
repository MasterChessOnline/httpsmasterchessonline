import { useMemo } from "react";
import { Chess } from "chess.js";

const CAPTURED_SYMBOLS: Record<string, string> = {
  q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

interface CapturedPiecesProps {
  game: Chess;
  color: "w" | "b"; // which side's captured pieces to show
}

export default function CapturedPieces({ game, color }: CapturedPiecesProps) {
  const { pieces, advantage } = useMemo(() => {
    const initial: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const current: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pc = board[r][c];
        if (pc && pc.color === color) current[pc.type] = (current[pc.type] || 0) + 1;
      }
    }

    const captured: string[] = [];
    const order = ["q", "r", "b", "n", "p"];
    const VALS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    let myTotal = 0, oppTotal = 0;
    for (const t of order) {
      const missing = initial[t] - current[t];
      for (let i = 0; i < missing; i++) captured.push(t);
      myTotal += current[t] * VALS[t];
    }
    // opponent material
    const oppColor = color === "w" ? "b" : "w";
    const oppCurrent: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pc = board[r][c];
        if (pc && pc.color === oppColor) oppCurrent[pc.type] = (oppCurrent[pc.type] || 0) + 1;
      }
    }
    for (const t of order) oppTotal += oppCurrent[t] * VALS[t];

    return { pieces: captured, advantage: Math.max(0, oppTotal - myTotal) };
  }, [game.fen(), color]);

  if (pieces.length === 0 && advantage === 0) return <div className="h-5" />;

  return (
    <div className="flex items-center gap-0.5 h-5 px-1">
      {pieces.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className={`text-sm leading-none ${color === "w" ? "text-foreground/60" : "text-muted-foreground/70"}`}
          style={{ marginLeft: i > 0 ? "-3px" : 0 }}
        >
          {CAPTURED_SYMBOLS[t]}
        </span>
      ))}
      {advantage > 0 && (
        <span className="text-[10px] font-bold text-primary ml-1">+{advantage}</span>
      )}
    </div>
  );
}
