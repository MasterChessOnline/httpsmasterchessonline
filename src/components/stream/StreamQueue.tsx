import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swords, Crown, Flame, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface QueueEntry {
  id: string;
  user_id: string;
  username: string;
  priority: number;
  role: string;
  game_mode: string;
  status: string;
  created_at: string;
}

const ROLE_PRIORITY: Record<string, number> = {
  legend: 100,
  vip: 50,
  supporter: 25,
  free: 0,
};

const ROLE_ICONS: Record<string, string> = {
  legend: "👑",
  vip: "🔥",
  supporter: "⭐",
  free: "",
};

export default function StreamQueue() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [inQueue, setInQueue] = useState(false);
  const [gameMode, setGameMode] = useState("blitz");

  // Load queue
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("stream_queue")
        .select("*")
        .eq("status", "waiting")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });
      if (data) {
        setQueue(data as QueueEntry[]);
        if (user) setInQueue(data.some(e => e.user_id === user.id));
      }
    };
    load();

    const channel = supabase
      .channel("stream-queue")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "stream_queue",
      }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const joinQueue = async () => {
    if (!user) {
      toast({ title: "Sign in to join queue", variant: "destructive" });
      return;
    }
    const role = "free"; // TODO: fetch from subscription
    const priority = ROLE_PRIORITY[role] || 0;

    const { error } = await supabase.from("stream_queue").insert({
      user_id: user.id,
      username: profile?.display_name || "Player",
      avatar_url: profile?.avatar_url,
      priority,
      role,
      game_mode: gameMode,
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already in queue", variant: "destructive" });
      } else {
        toast({ title: "Error joining queue", variant: "destructive" });
      }
      return;
    }
    setInQueue(true);
    toast({ title: "Queue joined! ⚔️" });
  };

  const leaveQueue = async () => {
    if (!user) return;
    await supabase.from("stream_queue").delete().eq("user_id", user.id);
    setInQueue(false);
  };

  const position = user ? queue.findIndex(e => e.user_id === user.id) + 1 : 0;

  return (
    <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Play vs DailyChess_12</h3>
            <Badge variant="outline" className="text-[10px]">{queue.length} waiting</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {["bullet", "blitz", "rapid"].map(mode => (
            <Button
              key={mode}
              size="sm"
              variant={gameMode === mode ? "default" : "outline"}
              onClick={() => setGameMode(mode)}
              className="text-xs h-7 px-3 capitalize"
            >
              {mode === "bullet" ? "⚡" : mode === "blitz" ? "🔥" : "🕐"} {mode}
            </Button>
          ))}
        </div>

        {inQueue ? (
          <Button size="sm" variant="outline" onClick={leaveQueue} className="w-full text-xs h-8">
            Leave Queue (Position #{position})
          </Button>
        ) : (
          <Button size="sm" onClick={joinQueue} className="w-full text-xs h-8">
            <Swords className="w-3 h-3 mr-1" /> Join Queue
          </Button>
        )}

        {queue.length > 0 && (
          <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
            {queue.slice(0, 10).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                  entry.user_id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-muted/10"
                }`}
              >
                <span className="font-bold text-primary w-5">#{i + 1}</span>
                <span className="shrink-0">{ROLE_ICONS[entry.role]}</span>
                <span className="text-foreground flex-1 truncate">{entry.username}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 capitalize">{entry.game_mode}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
