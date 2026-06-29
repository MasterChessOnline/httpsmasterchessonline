// /dragan-brakus/overlay — transparent OBS widget for streamers.
// Usage: open in OBS Browser Source at 480×120, transparent background.
// Query: ?player=<registration_id> shows that player's live score + opponent + board #.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

type Standing = {
  registration_id: string;
  display_name: string;
  points: number;
  wins: number;
  rank: number;
  games_played: number;
  country: string;
};

export default function DraganBrakusOverlay() {
  const [params] = useSearchParams();
  const playerId = params.get("player") || "";
  const [row, setRow] = useState<Standing | null>(null);
  const [opponent, setOpponent] = useState<string>("");
  const [round, setRound] = useState<number | null>(null);

  useEffect(() => {
    // make body transparent for OBS
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    return () => { document.documentElement.style.background = ""; document.body.style.background = ""; };
  }, []);

  useEffect(() => {
    if (!playerId) return;
    let stop = false;
    async function load() {
      const { data: t } = await supabase
        .from("tournaments").select("id")
        .ilike("name", "%Dragan Brakus%")
        .order("starts_at", { ascending: false }).limit(1).maybeSingle();
      if (!t?.id || stop) return;

      const [{ data: standing }, { data: pairing }] = await Promise.all([
        supabase.from("tournament_standings_v")
          .select("*").eq("tournament_id", t.id).eq("registration_id", playerId).maybeSingle(),
        supabase.from("tournament_pairings")
          .select("round, white_player_id, black_player_id, result")
          .eq("tournament_id", t.id)
          .or(`white_player_id.eq.${playerId},black_player_id.eq.${playerId}`)
          .order("round", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (stop) return;
      setRow((standing as any) || null);
      setRound((pairing as any)?.round ?? null);

      const oppId = (pairing as any)?.white_player_id === playerId
        ? (pairing as any)?.black_player_id
        : (pairing as any)?.white_player_id;
      if (oppId) {
        const { data: opp } = await supabase
          .from("tournament_registrations").select("first_name,last_name")
          .eq("id", oppId).maybeSingle();
        if (!stop) setOpponent(`${(opp as any)?.first_name || ""} ${(opp as any)?.last_name || ""}`.trim() || "—");
      }
    }
    load();
    const i = setInterval(load, 5000);
    return () => { stop = true; clearInterval(i); };
  }, [playerId]);

  if (!playerId) {
    return (
      <div style={{ color: "#facc15", fontFamily: "system-ui", padding: 12 }}>
        Add <code>?player=&lt;registration_id&gt;</code> to the URL.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        color: "white",
        padding: 14,
        background: "linear-gradient(135deg, rgba(0,0,0,0.78), rgba(20,20,20,0.6))",
        border: "1px solid rgba(250,204,21,0.45)",
        borderRadius: 14,
        backdropFilter: "blur(6px)",
        width: 460,
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Trophy color="#facc15" size={22} />
        <div style={{ fontWeight: 700, fontSize: 14, color: "#facc15", letterSpacing: 0.5 }}>
          DRAGAN BRAKUS CUP
        </div>
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{row?.display_name || "—"}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {row?.country || ""}{row?.country ? " · " : ""}vs {opponent || "—"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#facc15", lineHeight: 1 }}>
            {row?.points ?? 0}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
            Rank #{row?.rank ?? "—"}{round ? ` · R${round}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
