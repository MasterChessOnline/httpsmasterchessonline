import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BOT_PROFILES } from "@/lib/bots/profiles";
import { Crown, Swords, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayFromPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fen: string;
  /** Display name of the line/opening, used in confirmation copy. */
  contextLabel?: string;
  /** Opening id to return to from the Play page (Continue course button). */
  returnOpeningId?: string;
}

type Side = "w" | "b";

const STORAGE_KEY = "play-from-position";

/**
 * Dialog: pick a side (White/Black) and a bot, then jump to /play
 * with the chosen position pre-loaded via sessionStorage.
 */
export default function PlayFromPositionDialog({
  open,
  onOpenChange,
  fen,
  contextLabel,
  returnOpeningId,
}: PlayFromPositionDialogProps) {
  const navigate = useNavigate();
  const [side, setSide] = useState<Side>("w");
  const [selectedBotId, setSelectedBotId] = useState<string>("calm-camille");

  // Sort bots by rating ascending; keep the unbeatable boss at the very end.
  const bots = useMemo(() => {
    const copy = [...BOT_PROFILES];
    copy.sort((a, b) => {
      if (a.id === "masterchess") return 1;
      if (b.id === "masterchess") return -1;
      return a.rating - b.rating;
    });
    return copy;
  }, []);

  const startGame = () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fen,
        botId: selectedBotId,
        playerColor: side,
        contextLabel: contextLabel ?? null,
        returnOpeningId: returnOpeningId ?? null,
        ts: Date.now(),
      }),
    );
    onOpenChange(false);
    navigate("/play");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            Play this position vs Computer
          </DialogTitle>
          <DialogDescription>
            {contextLabel
              ? `Play out "${contextLabel}" against an engine bot of your chosen strength.`
              : "Continue the current opening position against an engine bot of your chosen strength."}
          </DialogDescription>
        </DialogHeader>

        {/* Side picker */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose your side</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSide("w")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                side === "w"
                  ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span className="text-3xl">♔</span>
              <span className="font-semibold">Play White</span>
            </button>
            <button
              type="button"
              onClick={() => setSide("b")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                side === "b"
                  ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <span className="text-3xl">♚</span>
              <span className="font-semibold">Play Black</span>
            </button>
          </div>
        </div>

        {/* Bot picker */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose your opponent</p>
          <ScrollArea className="h-72 rounded-lg border border-border/50 bg-background/50">
            <div className="p-2 space-y-1.5">
              {bots.map((bot) => {
                const selected = selectedBotId === bot.id;
                const isBoss = bot.id === "masterchess";
                return (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => setSelectedBotId(bot.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-md border p-2.5 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:bg-muted/40",
                      isBoss && "ring-1 ring-primary/30",
                    )}
                  >
                    <span className="text-2xl shrink-0">{bot.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{bot.name}</span>
                        {isBoss && <Crown className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{bot.style}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {bot.rating}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={startGame} className="gap-2">
            <Bot className="h-4 w-4" />
            Start game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { STORAGE_KEY as PLAY_FROM_POSITION_STORAGE_KEY };
