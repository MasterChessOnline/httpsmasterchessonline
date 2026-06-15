import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Crown, Swords, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type LinkRow = {
  id: string;
  code: string;
  creator_id: string | null;
  claimed_by: string | null;
  time_control_label: string;
  initial_time: number;
  increment: number;
  status: string;
  game_id: string | null;
  expires_at: string;
};

/**
 * /vs/:code — friend lands here from a shared link.
 * Logged-out → signup with return path preserved.
 * Logged-in & pending → claim, create online game, redirect both players.
 * Already claimed → straight to the game.
 */
export default function ChallengeLink() {
  const { code = "" } = useParams<{ code: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [link, setLink] = useState<LinkRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error: err } = await (supabase as any)
        .from("challenge_links")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (cancelled) return;
      if (err || !data) {
        setError("This challenge link doesn't exist or has expired.");
        setLoading(false);
        return;
      }
      if (new Date(data.expires_at).getTime() < Date.now()) {
        setError("This challenge link has expired (24h limit). Ask your friend for a fresh one.");
        setLoading(false);
        return;
      }
      setLink(data);
      if (data.creator_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("user_id", data.creator_id)
          .maybeSingle();
        if (!cancelled && prof?.username) setCreatorName(prof.username);
      }
      setLoading(false);
    };
    if (code) load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  // If already claimed (or we are the creator and link is claimed), just go to the game
  useEffect(() => {
    if (link?.status === "claimed" && link.game_id && user) {
      navigate(`/play/online?game=${link.game_id}`, { replace: true });
    }
  }, [link, user, navigate]);

  const accept = async () => {
    if (!user || !link) return;
    if (link.creator_id === user.id) {
      toast({ title: "That's your own link", description: "Share it with someone else." });
      return;
    }
    setAccepting(true);
    try {
      // Create the online game (creator = white, visitor = black)
      const whiteId = link.creator_id ?? user.id;
      const blackId = user.id;

      const { data: startRes, error: startErr } = await (supabase as any).rpc("start_online_game", {
        p_white_id: whiteId,
        p_black_id: blackId,
        p_white_time: link.initial_time,
        p_black_time: link.initial_time,
        p_time_control_label: link.time_control_label,
        p_increment: link.increment,
      });

      let gameId: string | null = null;
      if (!startErr && startRes && (startRes as any).ok === true) {
        gameId = (startRes as any).game_id ?? null;
      }

      // Fallback: direct insert if RPC missing or returns unusable shape
      if (!gameId) {
        const { data: g, error: insErr } = await supabase
          .from("online_games")
          .insert({
            white_player_id: whiteId,
            black_player_id: blackId,
            white_time: link.initial_time,
            black_time: link.initial_time,
            increment: link.increment,
            time_control_label: link.time_control_label,
            is_rated: false,
            status: "active",
          })
          .select("id")
          .single();
        if (insErr || !g) {
          toast({ title: "Couldn't start the game", description: insErr?.message ?? "Try again.", variant: "destructive" });
          setAccepting(false);
          return;
        }
        gameId = g.id;
      }

      // Atomically mark the link claimed — fails silently if another visitor beat us
      const { error: upErr } = await (supabase as any)
        .from("challenge_links")
        .update({ status: "claimed", claimed_by: user.id, game_id: gameId })
        .eq("code", code)
        .eq("status", "pending");

      if (upErr) {
        toast({ title: "Already claimed", description: "Someone else accepted this link first.", variant: "destructive" });
        setAccepting(false);
        return;
      }

      navigate(`/play/online?game=${gameId}`);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Something went wrong.", variant: "destructive" });
      setAccepting(false);
    }
  };

  const goSignup = () => {
    const next = `/vs/${code}`;
    try {
      sessionStorage.setItem("mc_post_signup_redirect", next);
    } catch {}
    navigate(`/signup?next=${encodeURIComponent(next)}`);
  };

  return (
    <>
      <Helmet>
        <title>Chess Challenge — Play Now | MasterChess</title>
        <meta name="description" content="A friend challenged you to a chess game on MasterChess. Click to accept and play instantly." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/60">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-2xl border border-primary/40 bg-card/90 backdrop-blur-xl p-7 text-center space-y-5 shadow-glow-lg"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 border border-primary/30 mx-auto">
            <Swords className="h-8 w-8 text-primary" />
          </div>

          {loading || authLoading ? (
            <div className="py-6 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading challenge…
            </div>
          ) : error ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">Link unavailable</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/play")} className="w-full h-11">
                Start your own game
              </Button>
            </>
          ) : link?.status === "claimed" ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">Game started</h1>
              <p className="text-sm text-muted-foreground">Both players are connected. Heading to the board…</p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
            </>
          ) : !user ? (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {creatorName ? <><span className="text-gradient-gold">{creatorName}</span> challenged you</> : "You've been challenged"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign up in 10 seconds (free, no ads) to accept and play.
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {link?.time_control_label}</span>
                <span className="inline-flex items-center gap-1"><Crown className="h-3 w-3" /> Unrated</span>
              </div>
              <Button onClick={goSignup} className="w-full h-11 font-display font-bold uppercase tracking-wider">
                Sign up & accept
              </Button>
              <button
                onClick={() => navigate(`/login?next=${encodeURIComponent(`/vs/${code}`)}`)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Already have an account? Log in
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {creatorName ? <><span className="text-gradient-gold">{creatorName}</span> wants to play</> : "Chess challenge"}
              </h1>
              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {link?.time_control_label}</span>
                <span className="inline-flex items-center gap-1"><Crown className="h-3 w-3" /> Unrated</span>
              </div>
              <Button
                onClick={accept}
                disabled={accepting}
                className="w-full h-12 font-display font-bold uppercase tracking-wider"
              >
                {accepting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting…</> : "Accept & Play"}
              </Button>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}
