import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight read-only board for streamers/embeds.
 * URL: /embed/board/:gameId   →  <iframe> friendly, no chrome, watermark only.
 */
export default function EmbedBoard() {
  const { gameId } = useParams();
  const [fen, setFen] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [white, setWhite] = useState("White");
  const [black, setBlack] = useState("Black");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("loading");

  const load = async () => {
    if (!gameId) return;
    const { data: g } = await supabase
      .from("online_games")
      .select("fen, white_player_id, black_player_id, result, status")
      .eq("id", gameId)
      .maybeSingle();
    if (!g) {
      setStatus("notfound");
      return;
    }
    setFen(g.fen || fen);
    setResult(g.result);
    setStatus(g.status);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", [g.white_player_id, g.black_player_id]);
    profiles?.forEach((p) => {
      if (p.user_id === g.white_player_id) setWhite(p.display_name || "White");
      if (p.user_id === g.black_player_id) setBlack(p.display_name || "Black");
    });
  };

  useEffect(() => {
    load();
    if (!gameId) return;
    const channel = supabase
      .channel(`embed-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_games", filter: `id=eq.${gameId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[600px]">
        <div className="flex items-center justify-between mb-2 text-sm text-amber-200/90">
          <span className="font-bold truncate">{black}</span>
          <span className="text-xs opacity-60">vs</span>
          <span className="font-bold truncate text-right">{white}</span>
        </div>
        <MiniBoard fen={fen} />
        <div className="mt-2 flex items-center justify-between text-xs">
          <a
            href="https://masterchess.live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300/80 hover:text-amber-200 font-bold"
          >
            ♛ masterchess.live
          </a>
          <span className="text-muted-foreground">
            {status === "finished" && result ? `Result: ${result}` : status === "active" ? "● Live" : status}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniBoard({ fen }: { fen: string }) {
  const board = fenToBoard(fen);
  const glyphs: Record<string, string> = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };
  return (
    <div className="grid grid-cols-8 aspect-square rounded-lg overflow-hidden border-2 border-amber-500/40 shadow-2xl">
      {board.map((row, r) =>
        row.map((piece, c) => {
          const isLight = (r + c) % 2 === 0;
          return (
            <div
              key={`${r}-${c}`}
              className={`flex items-center justify-center ${isLight ? "bg-[#e8c98a]" : "bg-[#7a5a30]"}`}
            >
              {piece && (
                <span
                  className={`text-[clamp(1.5rem,5vw,3rem)] leading-none ${
                    piece === piece.toUpperCase() ? "text-white drop-shadow" : "text-black"
                  }`}
                  style={{ textShadow: piece === piece.toUpperCase() ? "0 1px 2px rgba(0,0,0,0.7)" : "0 1px 1px rgba(255,255,255,0.3)" }}
                >
                  {glyphs[piece]}
                </span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
}

function fenToBoard(fen: string): string[][] {
  const rows = (fen.split(" ")[0] || "").split("/");
  return rows.map((row) => {
    const out: string[] = [];
    for (const ch of row) {
      if (/\d/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) out.push("");
      } else {
        out.push(ch);
      }
    }
    while (out.length < 8) out.push("");
    return out.slice(0, 8);
  });
}
