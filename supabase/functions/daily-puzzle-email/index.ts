// Daily puzzle email — sends today's Lichess puzzle to users who opted in.
// Cron: daily at 09:00 UTC+1 (08:00 UTC in summer).
// Users must explicitly opt in via public.email_preferences.daily_puzzle = true.
// Auth: x-cron-secret header must match the value stored in vault.secrets (name='daily_puzzle_cron_secret').
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SITE_NAME = "MasterChess";
const SENDER_DOMAIN = "notify.masterchess.com";
const FROM_DOMAIN = "notify.masterchess.com";
const CRON_SECRET_NAME = "daily_puzzle_cron_secret";

async function isAuthorizedCronCaller(req: Request, admin: any): Promise<boolean> {
  const headerSecret = req.headers.get("x-cron-secret") ?? "";
  if (!headerSecret) return false;

  // 1. Check env-based shared secrets (used by external cron services)
  const envSecrets = [
    Deno.env.get("CRON_SECRET"),
    Deno.env.get("GROWTH_CRON_SECRET"),
  ];
  if (envSecrets.includes(headerSecret)) return true;

  // 2. Check vault-based secret (used by pg_cron if configured)
  try {
    const { data } = await admin
      .from("secrets")
      .select("decrypted_secret")
      .eq("name", CRON_SECRET_NAME)
      .maybeSingle();
    if (data?.decrypted_secret === headerSecret) return true;
  } catch {
    // vault may not be accessible; fall through
  }

  return false;
}

interface LichessDailyPuzzle {
  game: { id: string; pgn: string; players: Array<{ name: string; rating: number }> };
  puzzle: { id: string; rating: number; themes: string[]; solution: string[] };
}

function buildEmailHtml(puzzle: LichessDailyPuzzle, puzzleUrl: string): string {
  const rating = puzzle.puzzle.rating;
  const themes = puzzle.puzzle.themes.slice(0, 5).join(", ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daily Chess Puzzle — ${SITE_NAME}</title>
  <style>
    body { margin: 0; padding: 0; background: #0B0A09; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #D9CFB8; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 16px; }
    .card { background: #0B0A09; border-radius: 16px; padding: 40px 32px; border: 1px solid #2A2520; }
    .brand { color: #E5B84A; font-size: 14px; letter-spacing: 0.25em; font-weight: 700; margin: 0 0 24px; }
    h1 { color: #F4EAD0; font-size: 24px; margin: 0 0 20px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .meta { color: #A89B7E; font-size: 13px; margin-bottom: 24px; }
    .button-wrap { text-align: center; margin: 32px 0; }
    .button { background: #E5B84A; color: #0B0A09; font-size: 15px; font-weight: 600; border-radius: 12px; padding: 14px 32px; text-decoration: none; display: inline-block; }
    .footer { font-size: 12px; color: #A89B7E; margin-top: 28px; border-top: 1px solid #2A2520; padding-top: 20px; }
    a { color: #E5B84A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <p class="brand">♟ MASTERCHESS</p>
      <h1>Your daily chess puzzle is here</h1>
      <p class="meta">Rating: ${rating} · Themes: ${themes}</p>
      <p>Train your tactical eye with today's hand-picked puzzle. One correct move can change everything.</p>
      <div class="button-wrap">
        <a class="button" href="${puzzleUrl}">Solve today's puzzle</a>
      </div>
      <p class="footer">You're receiving this because you opted in to Daily Puzzle emails in your MasterChess settings.<br /><a href="${puzzleUrl}">Open MasterChess</a></p>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(puzzle: LichessDailyPuzzle, puzzleUrl: string): string {
  return `MasterChess Daily Puzzle

Rating: ${puzzle.puzzle.rating}
Themes: ${puzzle.puzzle.themes.slice(0, 5).join(", ")}

Solve today's puzzle: ${puzzleUrl}

You're receiving this because you opted in to Daily Puzzle emails.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const cronOk = await isAuthorizedCronCaller(req, admin);
    if (!cronOk) {
      const auth = req.headers.get("Authorization");
      if (!auth?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth } },
      });
      const { data: u } = await uc.auth.getUser();
      if (!u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
      const { data: isAdmin } = await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch today's puzzle
    const res = await fetch("https://lichess.org/api/puzzle/daily");
    if (!res.ok) throw new Error(`Lichess daily puzzle failed: ${res.status}`);
    const puzzle: LichessDailyPuzzle = await res.json();
    const puzzleUrl = `https://masterchess.live/puzzles?utm_source=daily-email&utm_medium=email&utm_campaign=daily-puzzle`;

    const html = buildEmailHtml(puzzle, puzzleUrl);
    const text = buildEmailText(puzzle, puzzleUrl);

    // 2. Find opted-in users with confirmed emails
    const { data: prefs } = await admin
      .from("email_preferences")
      .select("user_id")
      .eq("daily_puzzle", true);

    if (!prefs || prefs.length === 0) {
      return new Response(JSON.stringify({ ok: true, queued: 0, reason: "no_opt_ins" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = prefs.map((p) => p.user_id);
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const recipients = (users?.users ?? [])
      .filter((u: any) => userIds.includes(u.id) && u.email_confirmed_at && !u.email?.endsWith("@example.test"))
      .map((u: any) => u.email);

    // 3. Enqueue emails
    let queued = 0;
    for (const email of recipients) {
      const messageId = crypto.randomUUID();
      await admin.from("email_send_log").insert({
        message_id: messageId,
        template_name: "daily-puzzle",
        recipient_email: email,
        status: "pending",
      });
      const { error: enqueueError } = await admin.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          run_id: crypto.randomUUID(),
          message_id: messageId,
          to: email,
          from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `♟ Daily chess puzzle — ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`,
          html,
          text,
          purpose: "transactional",
          label: "daily-puzzle",
          queued_at: new Date().toISOString(),
        },
      });
      if (enqueueError) {
        console.error("Failed to enqueue daily puzzle email", { email, error: enqueueError });
        await admin.from("email_send_log").insert({
          message_id: messageId,
          template_name: "daily-puzzle",
          recipient_email: email,
          status: "failed",
          error_message: "Failed to enqueue email",
        });
      } else {
        queued++;
      }
    }

    return new Response(JSON.stringify({ ok: true, queued, totalOptIns: prefs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-puzzle-email", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
