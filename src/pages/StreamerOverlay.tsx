// /overlay/:username — Transparent OBS Browser Source overlay for streamers.
// Streamers drop this URL into OBS as a Browser Source (1920x300 recommended,
// transparent background). Shows: username, ELO, win/loss streak, last move,
// time on each clock if in active game. Polls every 4s; no auth needed.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Flame, Trophy } from "lucide-react";

interface ProfileLite {
  user_id: string;
  username: string;
  display_name: string | null;
  rating: number;
  peak_rating: number | null;
  win_streak: number | null;
  games_won: number;
  games_played: number;
  country_flag: string | null;
  avatar_url: string | null;
}

interface GameLite {
  fen: string;
  last_move_from: string | null;
  last_move_to: string | null;
  white_time: number | null;
  black_time: number | null;
  turn: string | null;
  status: string;
  white_player_id: string;
  black_player_id: string;
}

const fmtTime = (s: number | null) => {
  if (s == null) return "--:--";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export default function StreamerOverlay() {
  const { username = "" } = useParams();
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [game, setGame] = useState<GameLite | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    const fetchAll = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_id,username,display_name,rating,peak_rating,win_streak,games_won,games_played,country_flag,avatar_url")
        .ilike("username", username)
        .maybeSingle();
      if (!alive) return;
      if (!prof) { setNotFound(true); return; }
      setProfile(prof as ProfileLite);

      const { data: g } = await supabase
        .from("online_games")
        .select("fen,last_move_from,last_move_to,white_time,black_time,turn,status,white_player_id,black_player_id")
        .or(`white_player_id.eq.${prof.user_id},black_player_id.eq.${prof.user_id}`)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!alive) return;
      setGame((g as GameLite | null) ?? null);
    };
    fetchAll();
    const id = window.setInterval(fetchAll, 4000);
    return () => { alive = false; window.clearInterval(id); };
  }, [username]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70 text-sm bg-transparent">
        Streamer "{username}" not found
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen bg-transparent" />;
  }

  const winRate = profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100)
    : 0;
  const streak = profile.win_streak ?? 0;

  return (
    <>
      <Helmet>
        <title>{`${profile.display_name || profile.username} — Live Overlay`}</title>
        <meta name="robots" content="noindex,nofollow" />
        <style>{`html,body,#root{background:transparent !important;}`}</style>
      </Helmet>
      <div className="min-h-screen w-full p-4 bg-transparent text-white font-sans select-none">
        <div className="inline-flex items-stretch gap-3 rounded-2xl bg-black/65 backdrop-blur-md border border-amber-400/30 px-4 py-3 shadow-2xl">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-400/40"
            />
          )}
          <div className="flex flex-col justify-between min-w-[160px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base leading-none">
                {profile.display_name || profile.username}
              </span>
              {profile.country_flag && <span>{profile.country_flag}</span>}
            </div>
            <div className="flex items-center gap-3 text-xs text-amber-200/90">
              <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" /> {profile.rating}</span>
              {profile.peak_rating ? (
                <span className="inline-flex items-center gap-1"><Trophy className="w-3 h-3" /> {profile.peak_rating}</span>
              ) : null}
              {streak > 0 ? (
                <span className="inline-flex items-center gap-1 text-orange-300"><Flame className="w-3 h-3" /> {streak}</span>
              ) : null}
              <span className="opacity-80">{winRate}% WR</span>
            </div>
          </div>

          {game && (
            <div className="border-l border-white/15 pl-3 ml-1 flex flex-col justify-between text-xs">
              <div className="text-white/60 uppercase tracking-widest">In game</div>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className={game.turn === "w" ? "text-amber-300" : "text-white/70"}>
                  ♔ {fmtTime(game.white_time)}
                </span>
                <span className={game.turn === "b" ? "text-amber-300" : "text-white/70"}>
                  ♚ {fmtTime(game.black_time)}
                </span>
              </div>
              {game.last_move_from && game.last_move_to && (
                <div className="text-white/50">
                  Last: {game.last_move_from}→{game.last_move_to}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-2 text-[10px] text-white/40 tracking-wider">masterchess.live/u/{profile.username}</div>
      </div>
    </>
  );
}
