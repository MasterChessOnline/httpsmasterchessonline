import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StyleTwin {
  user_id: string;
  gm_name: string;
  match_pct: number;
  reasoning: string;
  games_analyzed: number;
  computed_at: string;
}

interface Props {
  userId: string;
  username?: string | null;
  isOwner: boolean;
}

/**
 * Profile section: "You play like <GM>". Auth users can compute/refresh their twin.
 * Others see a teaser if no twin exists, the result if one does.
 */
export default function StyleTwinCard({ userId, username, isOwner }: Props) {
  const [twin, setTwin] = useState<StyleTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      if (isOwner) {
        const { data } = await supabase
          .from("style_twins" as any)
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) setTwin((data as any) ?? null);
      } else if (username) {
        const { data } = await supabase.rpc("get_public_style_twin" as any, { p_username: username });
        const row = Array.isArray(data) ? data[0] : data;
        if (!cancelled && row) {
          setTwin({
            user_id: userId,
            gm_name: row.gm_name,
            match_pct: row.match_pct,
            reasoning: "",
            games_analyzed: 0,
            computed_at: row.computed_at,
          });
        }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [userId, username, isOwner]);

  const compute = async () => {
    setComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke("style-twin", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const t = (data as any)?.twin;
      if (t) {
        setTwin(t);
        toast.success(`You play like ${t.gm_name}!`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not compute your Style Twin.");
    } finally {
      setComputing(false);
    }
  };

  const share = () => {
    if (!twin) return;
    const text = `I play like ${twin.gm_name} (${twin.match_pct}% match) on MasterChess! Find your Style Twin: https://masterchess.live${username ? `/u/${username}` : ""}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!twin) {
    if (!isOwner) return null;
    return (
      <div className="rounded-2xl border border-[#d4a843]/30 bg-gradient-to-br from-card/70 to-[#1a1408]/40 p-6">
        <div className="flex items-center gap-2 text-[#f3d97a] mb-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Style Twin</span>
        </div>
        <h3 className="text-xl font-display font-bold mb-2">Which Grandmaster do you play like?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          AI analyzes your recent games and matches you with one of 16 legendary GMs. Play 5+ ranked games first.
        </p>
        <Button onClick={compute} disabled={computing} className="gap-2">
          {computing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {computing ? "Analyzing your games..." : "Find my Style Twin"}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#d4a843]/40 bg-gradient-to-br from-[#1a1408]/80 via-card/60 to-[#15110a]/80 p-6 shadow-[0_0_30px_rgba(212,168,67,0.1)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#f3d97a]/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-[#f3d97a] mb-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Style Twin</span>
          <Badge variant="outline" className="ml-auto border-[#d4a843]/40 text-[#f3d97a]">
            {twin.match_pct}% match
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mb-1">You play like</div>
        <h3 className="text-3xl font-display font-black bg-gradient-to-r from-[#f3d97a] to-[#d4a843] bg-clip-text text-transparent mb-3">
          {twin.gm_name}
        </h3>
        {twin.reasoning && (
          <p className="text-sm text-muted-foreground italic mb-4 leading-relaxed">
            "{twin.reasoning}"
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={share} size="sm" variant="outline" className="gap-2 border-[#d4a843]/40">
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          {isOwner && (
            <Button onClick={compute} disabled={computing} size="sm" variant="ghost" className="gap-2">
              {computing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Recompute
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
