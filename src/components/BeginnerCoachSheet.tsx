import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

/**
 * 60-SECOND BEGINNER PRIMER
 *
 * Paid traffic includes people who have never played chess. Without this they
 * bounce on the board itself, so the landing offers one quiet door: the rules
 * in six lines, then straight into the same free game against the weakest bot.
 */
interface BeginnerCoachSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the visitor is ready to play (scrolls to / starts the board). */
  onStart: () => void;
  surface?: string;
}

const PIECES: { glyph: string; name: string; how: string }[] = [
  { glyph: "♙", name: "Pawn", how: "one square forward, captures diagonally" },
  { glyph: "♘", name: "Knight", how: "an L shape — it can jump over pieces" },
  { glyph: "♗", name: "Bishop", how: "any distance diagonally" },
  { glyph: "♖", name: "Rook", how: "any distance straight" },
  { glyph: "♕", name: "Queen", how: "straight or diagonal, any distance" },
  { glyph: "♔", name: "King", how: "one square in any direction — protect it" },
];

export default function BeginnerCoachSheet({
  open,
  onOpenChange,
  onStart,
  surface = "ad-landing",
}: BeginnerCoachSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Never played chess? This is all you need.
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          The goal: trap the other king so it cannot escape. That is called checkmate.
          You move first, white pieces at the bottom.
        </p>

        <ul className="mt-1 space-y-2">
          {PIECES.map((p) => (
            <li key={p.name} className="flex items-start gap-3 text-sm">
              <span className="text-2xl leading-none text-primary">{p.glyph}</span>
              <span>
                <span className="font-semibold text-foreground">{p.name}</span>{" "}
                <span className="text-muted-foreground">— {p.how}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
          On the board, tap any of your pieces and every square it can legally reach
          lights up. You cannot make an illegal move, so nothing can go wrong.
        </div>

        <Button
          className="mt-1 h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            track("beginner_primer_start", { surface });
            onOpenChange(false);
            onStart();
          }}
        >
          Start my first game
        </Button>
      </DialogContent>
    </Dialog>
  );
}
