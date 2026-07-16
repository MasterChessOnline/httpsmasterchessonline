import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Swords, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";

type Game = {
  id: string;
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  time_control_label: string;
  move_number: number;
  end_reason: string | null;
  pgn: string;
  status: string;
};
type Profile = { id: string; username: string | null; avatar_url: string | null; rating: number | null };

/** Public shareable Match Story page. */
export default function MatchStory() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [white, setWhite] = useState<Profile | null>(null);
  const [black, setBlack] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: g } = await supabase.from("online_games").select("*").eq("id", id).maybeSingle();
      if (!g) {
        setLoading(false);
        return;
      }
      setGame(g as Game);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, rating")
        .in("id", [g.white_player_id, g.black_player_id]);
      setWhite((profs ?? []).find((p: any) => p.id === g.white_player_id) ?? null);
      setBlack((profs ?? []).find((p: any) => p.id === g.black_player_id) ?? null);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!game || !white || !black) return;
    const winner =
      game.result === "1-0" ? white?.username : game.result === "0-1" ? black?.username : null;
    const title = winner
      ? `${winner} pobedio/la — MasterChess Match Story`
      : `${white?.username ?? "?"} vs ${black?.username ?? "?"} — MasterChess`;
    document.title = title;

    let og = document.querySelector('meta[property="og:title"]');
    if (!og) {
      og = document.createElement("meta");
      og.setAttribute("property", "og:title");
      document.head.appendChild(og);
    }
    og.setAttribute("content", title);
  }, [game, white, black]);

  const share = async () => {
    // Use edge function URL so crawlers (WhatsApp/Discord/X) get rich preview
    // with real player names + result. Humans get redirected to /game/:id/story.
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const shareUrl = projectId
      ? `https://${projectId}.supabase.co/functions/v1/og-match-story?id=${id}`
      : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: shareUrl });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link kopiran — podeli na WhatsApp/Discord za bogat preview");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Učitavanje…</div>;
  if (!game) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Partija nije pronađena</div>;

  const isDraw = game.result === "1/2-1/2";
  const whiteWin = game.result === "1-0";
  const blackWin = game.result === "0-1";

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col">
      {/* Hero card — this is what people will screenshot & share */}
      <section className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
            {/* Decorative background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #d4a84355, transparent 50%), radial-gradient(circle at 80% 80%, #d4a84333, transparent 50%)",
              }}
            />
            <div className="relative p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  Match Story
                </span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                  <Clock size={10} className="mr-1" /> {game.time_control_label}
                </Badge>
              </div>

              {/* Players */}
              <div className="flex items-center justify-between gap-4">
                <PlayerSide profile={white} color="w" won={whiteWin} draw={isDraw} />
                <div className="text-3xl font-bold text-amber-400">
                  {isDraw ? "½–½" : game.result?.replace("-", " – ") ?? "?"}
                </div>
                <PlayerSide profile={black} color="b" won={blackWin} draw={isDraw} align="right" />
              </div>

              {/* Result banner */}
              <div className="border-y border-amber-500/20 py-3 text-center">
                <Trophy className="inline text-amber-400 mr-2" size={16} />
                <span className="font-semibold">
                  {isDraw
                    ? "Remi"
                    : whiteWin
                      ? `${white?.username ?? "Beli"} pobedio/la`
                      : `${black?.username ?? "Crni"} pobedio/la`}
                </span>
                {game.end_reason && (
                  <div className="text-xs text-neutral-400 mt-1">{game.end_reason}</div>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold">{game.move_number}</div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest">poteza</div>
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Swords size={18} className="text-amber-400" />
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest">masterchess</div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-500">masterchess.live</span>
                <span className="text-xs text-amber-400">More Than Chess.</span>
              </div>
            </div>
          </Card>

          <div className="mt-4 flex gap-2">
            <Button onClick={share} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black">
              <Share2 size={16} className="mr-2" /> Podeli
            </Button>
            <Link to={`/spectate?game=${game.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Odigraj ponovo
              </Button>
            </Link>
          </div>
          <div className="mt-3 text-center">
            <Link to="/feed" className="text-xs text-neutral-500 hover:text-amber-400">
              ← Nazad na feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlayerSide({
  profile,
  color,
  won,
  draw,
  align = "left",
}: {
  profile: Profile | null;
  color: "w" | "b";
  won: boolean;
  draw: boolean;
  align?: "left" | "right";
}) {
  return (
    <Link
      to={profile?.username ? `/u/${profile.username}` : "#"}
      className={`flex flex-col items-center gap-1 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <div
        className={`w-16 h-16 rounded-full overflow-hidden border-2 ${
          won ? "border-amber-400 shadow-[0_0_20px_rgba(212,168,67,0.5)]" : draw ? "border-neutral-600" : "border-neutral-800 opacity-60"
        }`}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-neutral-800">
            {color === "w" ? "♔" : "♚"}
          </div>
        )}
      </div>
      <div className="text-sm font-semibold truncate max-w-[90px]">{profile?.username ?? "?"}</div>
      {profile?.rating && <div className="text-[10px] text-neutral-500">{profile.rating}</div>}
    </Link>
  );
}
