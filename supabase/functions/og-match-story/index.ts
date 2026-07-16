// Crawler-friendly HTML preview for Match Story shares.
// When shared on WhatsApp/Discord/X/Telegram, this returns HTML with real
// OG meta tags (player names, result). Browsers get a fast redirect to
// the SPA route /game/:id/story.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BASE = "https://masterchess.live";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("missing id", { status: 400, headers: corsHeaders });

  const target = `${BASE}/game/${id}/story`;
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: game } = await supabase
    .from("online_games")
    .select("id, white_player_id, black_player_id, result, time_control_label, move_number, end_reason")
    .eq("id", id)
    .maybeSingle();

  let title = "MasterChess Match Story";
  let description = "Vidi ovu šahovsku partiju na MasterChess.";
  if (game) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, rating")
      .in("id", [game.white_player_id, game.black_player_id]);
    const w = profs?.find((p) => p.id === game.white_player_id);
    const b = profs?.find((p) => p.id === game.black_player_id);
    const wn = w?.username ?? "Beli";
    const bn = b?.username ?? "Crni";
    const isDraw = game.result === "1/2-1/2";
    const winner =
      game.result === "1-0" ? wn : game.result === "0-1" ? bn : null;
    title = winner
      ? `${winner} pobedio/la • ${wn} vs ${bn} — MasterChess`
      : isDraw
        ? `Remi • ${wn} vs ${bn} — MasterChess`
        : `${wn} vs ${bn} — MasterChess`;
    description = `${game.time_control_label} • ${game.move_number} poteza${
      game.end_reason ? ` • ${game.end_reason}` : ""
    }. Odigraj i ti — masterchess.live`;
  }

  const image = `${BASE}/og-image.jpg`;
  const html = `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${target}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${target}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="MasterChess" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${image}" />
<meta http-equiv="refresh" content="0;url=${target}" />
</head>
<body style="background:#000;color:#eee;font-family:system-ui;text-align:center;padding:40px">
<p>${esc(title)}</p>
<p><a href="${target}" style="color:#d4a843">Otvori Match Story →</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
