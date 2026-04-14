import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ThumbsUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MoveVote {
  move: string;
  votes: number;
  sponsors: string[];
}

export default function SponsorAMove() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestedMove, setSuggestedMove] = useState("");
  const [votes, setVotes] = useState<MoveVote[]>([
    { move: "e4", votes: 3, sponsors: ["Player1", "Player2", "Player3"] },
    { move: "d4", votes: 2, sponsors: ["Player4", "Player5"] },
    { move: "Nf3", votes: 1, sponsors: ["Player6"] },
  ]);
  const [hasVoted, setHasVoted] = useState(false);
  const totalVotes = votes.reduce((s, v) => s + v.votes, 0);

  const handleSponsor = async () => {
    if (!suggestedMove.trim()) return;
    if (!user) {
      toast({ title: "Login required to sponsor a move", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: 100, // $1 to sponsor a move
          itemType: "sponsor_move",
          itemId: suggestedMove.trim(),
        },
      });
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast({ title: "Payment error", variant: "destructive" });
    }
  };

  const handleVote = (idx: number) => {
    if (hasVoted) return;
    setVotes(prev => prev.map((v, i) => i === idx ? { ...v, votes: v.votes + 1 } : v));
    setHasVoted(true);
  };

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Swords className="w-4 h-4 text-yellow-400" />
          <h3 className="font-display text-sm font-bold text-foreground">Sponsor a Move</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-3">
          Pay $1 to suggest a move. Chat votes on which move the streamer plays! ♟️
        </p>

        {/* Current votes */}
        <div className="space-y-1.5 mb-3">
          {votes.sort((a, b) => b.votes - a.votes).map((v, i) => {
            const pct = totalVotes > 0 ? Math.round((v.votes / totalVotes) * 100) : 0;
            return (
              <motion.button
                key={v.move}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleVote(i)}
                disabled={hasVoted}
                className="w-full text-left rounded-lg px-3 py-2 relative overflow-hidden transition-all hover:bg-yellow-500/5"
              >
                <div className="absolute inset-0 bg-yellow-500/10 rounded-lg" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-yellow-400 text-xs">👑</span>}
                    <span className="text-sm font-mono font-bold text-foreground">{v.move}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {v.votes} vote{v.votes !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Suggest a move */}
        <div className="flex gap-1.5">
          <Input
            value={suggestedMove}
            onChange={e => setSuggestedMove(e.target.value)}
            placeholder="e.g. Bxf7+"
            className="h-8 text-xs bg-muted/20 border-border/30 font-mono flex-1"
            maxLength={10}
          />
          <Button size="sm" onClick={handleSponsor} className="h-8 text-xs whitespace-nowrap">
            <DollarSign className="w-3 h-3 mr-0.5" />$1
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
