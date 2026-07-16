import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Flame, RefreshCw, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

type ParsedRoast = {
  headline: string;
  roast_lines: string[];
  hashtag: string;
};

type RoastRow = {
  id: string;
  game_id: string;
  roast_text: string;
  language: string;
  mode: string;
  upvotes: number;
  shares: number;
  created_at: string;
};

type Game = {
  id: string;
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  time_control_label: string;
  move_number: number;
};

type Profile = { id: string; username: string | null; avatar_url: string | null };

function parseRoast(text: string): ParsedRoast {
  try {
    const p = JSON.parse(text);
    return {
      headline: p.headline ?? "MasterChess Roast",
      roast_lines: Array.isArray(p.roast_lines) ? p.roast_lines : [text],
      hashtag: p.hashtag ?? "#MasterChess",
    };
  } catch {
    return { headline: "MasterChess Roast", roast_lines: [text], hashtag: "#MasterChess" };
  }
}

export default function Roast() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roast, setRoast] = useState<RoastRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mode, setMode] = useState<"playful" | "brutal">("playful");
  const [language, setLanguage] = useState<"sr" | "en">("sr");

  useEffect(() => {
    if (!gameId) return;
    (async () => {
      setLoading(true);
      const { data: g } = await supabase
        .from("online_games")
        .select("id, white_player_id, black_player_id, result, time_control_label, move_number")
        .eq("id", gameId)
        .maybeSingle();
      setGame((g as Game) ?? null);
      if (g) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", [g.white_player_id, g.black_player_id].filter(Boolean));
        setProfiles((profs as Profile[]) ?? []);
      }
      const { data: existing } = await supabase
        .from("roasts")
        .select("*")
        .eq("game_id", gameId)
        .maybeSingle();
      if (existing) setRoast(existing as RoastRow);
      setLoading(false);
      if (!existing && g) generate();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const generate = async (regen = false) => {
    if (!gameId || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-roast", {
        body: { gameId, language, mode, regenerate: regen },
      });
      if (error) throw error;
      if (data?.roast) setRoast(data.roast);
    } catch (e: any) {
      toast.error("Nije uspelo generisanje roast-a");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const parsed = roast ? parseRoast(roast.roast_text) : null;
  const white = profiles.find((p) => p.id === game?.white_player_id);
  const black = profiles.find((p) => p.id === game?.black_player_id);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = parsed
    ? `${parsed.headline}\n\n${parsed.roast_lines.slice(0, 2).join("\n")}\n\n${parsed.hashtag} — roast na masterchess.live`
    : "Roast na masterchess.live";

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: parsed?.headline ?? "Chess Roast", text: shareText, url: shareUrl });
        if (roast) await supabase.from("roasts").update({ shares: (roast.shares ?? 0) + 1 }).eq("id", roast.id);
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success("Roast kopiran — nalepi na TikTok/IG/X");
    if (roast) await supabase.from("roasts").update({ shares: (roast.shares ?? 0) + 1 }).eq("id", roast.id);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    toast.success("Tekst kopiran");
  };

  const title = parsed?.headline ?? "Chess Roast — MasterChess";

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <Helmet>
        <title>{title} — MasterChess Roast</title>
        <meta name="description" content={parsed?.roast_lines?.[0] ?? "Brutalno komentarisana šahovska partija."} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={parsed?.roast_lines?.[0] ?? "MasterChess Roast"} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-400" />
            <h1 className="text-2xl font-bold">Chess Roast</h1>
          </div>
          <Badge variant="outline" className="border-orange-500/40 text-orange-400">BETA</Badge>
        </div>

        {loading && <div className="text-center text-neutral-400 py-16">Učitavanje…</div>}

        {!loading && !game && (
          <div className="text-center text-neutral-400 py-16">Partija nije pronađena.</div>
        )}

        {!loading && game && (
          <>
            {/* Controls */}
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
                {(["sr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-3 py-1.5 text-sm ${language === l ? "bg-amber-500 text-black font-semibold" : "text-neutral-400 hover:text-white"}`}
                  >
                    {l === "sr" ? "SRB" : "ENG"}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
                {(["playful", "brutal"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 text-sm ${mode === m ? "bg-orange-500 text-black font-semibold" : "text-neutral-400 hover:text-white"}`}
                  >
                    {m === "playful" ? "Šaljivo" : "Brutalno"}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => generate(true)}
                disabled={generating}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                {generating ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                <span className="ml-2">Novi roast</span>
              </Button>
            </div>

            {/* The Roast Card — screenshot-worthy */}
            <Card className="relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #ff6b3555, transparent 50%), radial-gradient(circle at 80% 80%, #d4a84333, transparent 50%)",
                }}
              />
              <div className="relative p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold flex items-center gap-1">
                    <Flame size={12} /> Roast
                  </span>
                  <Badge variant="outline" className="border-orange-500/40 text-orange-400 text-[10px]">
                    {game.time_control_label} · {game.move_number} poteza
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-neutral-400">
                  <PlayerMini profile={white} color="w" />
                  <div className="text-lg font-bold text-orange-400">
                    {game.result === "1/2-1/2" ? "½–½" : game.result?.replace("-", " – ") ?? "?"}
                  </div>
                  <PlayerMini profile={black} color="b" />
                </div>

                {generating && !parsed && (
                  <div className="text-center py-8">
                    <Loader2 className="animate-spin inline text-orange-400" size={32} />
                    <div className="text-sm text-neutral-500 mt-2">AI kuva roast…</div>
                  </div>
                )}

                {parsed && (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white">
                      {parsed.headline}
                    </h2>
                    <div className="space-y-3">
                      {parsed.roast_lines.map((line, i) => (
                        <p key={i} className="text-neutral-200 text-base leading-relaxed border-l-2 border-orange-500/50 pl-4">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-orange-400 font-semibold">{parsed.hashtag}</span>
                      <span className="text-neutral-500">masterchess.live/roast</span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={share} className="bg-orange-500 hover:bg-orange-400 text-black font-semibold">
                <Share2 size={16} className="mr-2" /> Podeli
              </Button>
              <Button onClick={copyText} variant="outline">
                <Copy size={16} className="mr-2" /> Kopiraj tekst
              </Button>
            </div>

            <div className="flex justify-center gap-4 text-xs text-neutral-500 pt-4">
              <Link to={`/game/${gameId}/story`} className="hover:text-orange-400">← Match Story</Link>
              <Link to="/feed" className="hover:text-orange-400">Feed →</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlayerMini({ profile, color }: { profile?: Profile; color: "w" | "b" }) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center border border-neutral-700 shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">{color === "w" ? "♔" : "♚"}</span>
        )}
      </div>
      <span className="truncate">{profile?.username ?? "?"}</span>
    </div>
  );
}
