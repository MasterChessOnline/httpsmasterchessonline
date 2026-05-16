import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Crown, TrendingUp } from "lucide-react";

interface Data {
  display_name: string | null;
  username: string | null;
  rating: number;
  peak_rating: number | null;
  games_won: number;
  games_played: number;
  avatar_url: string | null;
}

export default function EmbedRating() {
  const { username } = useParams<{ username: string }>();
  const [params] = useSearchParams();
  const theme = (params.get("theme") || "dark").toLowerCase();
  const accent = params.get("accent") || "#d4af37";
  const layout = (params.get("layout") || "bar").toLowerCase(); // bar | card

  const [data, setData] = useState<Data | null>(null);
  const [recent, setRecent] = useState<{ result: string | null; isWhite: boolean } | null>(null);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  useEffect(() => {
    if (!username) return;
    let alive = true;

    const load = async () => {
      const cols = "user_id,display_name,username,avatar_url,rating,peak_rating,games_won,games_played";
      let r = await supabase.from("profiles").select(cols).eq("username", username).maybeSingle();
      if (!r.data) r = await supabase.from("profiles").select(cols).ilike("display_name", username).limit(1).maybeSingle();
      if (!alive || !r.data) return;
      setData(r.data as any);

      const { data: games } = await supabase
        .from("online_games")
        .select("result, white_player_id, black_player_id")
        .or(`white_player_id.eq.${r.data.user_id},black_player_id.eq.${r.data.user_id}`)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(1);
      if (games?.[0]) {
        setRecent({ result: games[0].result, isWhite: games[0].white_player_id === r.data.user_id });
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => { alive = false; clearInterval(interval); };
  }, [username]);

  const bg = theme === "light" ? "rgba(255,255,255,0.92)" : "rgba(10,10,12,0.85)";
  const fg = theme === "light" ? "#0a0a0c" : "#f5f5f5";
  const sub = theme === "light" ? "#555" : "#aaa";

  if (!data) {
    return (
      <div style={{ fontFamily: "system-ui,sans-serif", color: fg, padding: 16 }}>
        Loading…
      </div>
    );
  }

  const winRate = data.games_played > 0 ? Math.round((data.games_won / data.games_played) * 100) : 0;
  const name = data.display_name || data.username || "Player";

  const lastResult = recent
    ? recent.result === "1/2-1/2"
      ? "½–½"
      : (recent.isWhite && recent.result === "1-0") || (!recent.isWhite && recent.result === "0-1")
      ? "WIN"
      : "LOSS"
    : null;

  if (layout === "card") {
    return (
      <div style={{
        fontFamily: "system-ui,-apple-system,sans-serif",
        background: bg, color: fg,
        borderRadius: 16, padding: "16px 20px",
        display: "inline-flex", flexDirection: "column", gap: 6,
        border: `1px solid ${accent}40`, minWidth: 240,
        boxShadow: `0 8px 32px ${accent}25`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Crown size={18} color={accent} />
          <strong style={{ fontSize: 16 }}>{name}</strong>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: accent, lineHeight: 1 }}>{data.rating}</div>
        <div style={{ fontSize: 12, color: sub, display: "flex", gap: 10 }}>
          <span>Peak {data.peak_rating ?? data.rating}</span>
          <span>•</span>
          <span>{winRate}% WR</span>
          {lastResult && <><span>•</span><span>Last: {lastResult}</span></>}
        </div>
      </div>
    );
  }

  // bar layout (default — OBS friendly)
  return (
    <div style={{
      fontFamily: "system-ui,-apple-system,sans-serif",
      background: bg, color: fg,
      borderRadius: 999, padding: "8px 16px",
      display: "inline-flex", alignItems: "center", gap: 12,
      border: `1px solid ${accent}40`,
      boxShadow: `0 4px 16px ${accent}20`,
    }}>
      <Crown size={16} color={accent} />
      <strong style={{ fontSize: 14 }}>{name}</strong>
      <span style={{ color: accent, fontWeight: 800, fontSize: 18 }}>{data.rating}</span>
      <span style={{ color: sub, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
        <TrendingUp size={12} /> {winRate}%
      </span>
      {lastResult && (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          background: lastResult === "WIN" ? "#10b98133" : lastResult === "LOSS" ? "#ef444433" : "#94a3b833",
          color: lastResult === "WIN" ? "#10b981" : lastResult === "LOSS" ? "#ef4444" : "#94a3b8",
        }}>{lastResult}</span>
      )}
    </div>
  );
}
