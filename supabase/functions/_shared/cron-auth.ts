// Shared helper: verifies the request was made by an authorized internal caller.
// Accepts EITHER:
//   - Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>   (used by pg_cron)
//   - x-cron-secret: <CRON_SECRET>                         (alternative shared secret)
export function isAuthorizedCronCaller(req: Request): boolean {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const growthSecret = Deno.env.get("GROWTH_CRON_SECRET") ?? "";

  const auth = req.headers.get("Authorization") ?? "";
  if (serviceKey && auth === `Bearer ${serviceKey}`) return true;

  const headerSecret = req.headers.get("x-cron-secret") ?? "";
  if (headerSecret) {
    if (cronSecret && headerSecret === cronSecret) return true;
    if (growthSecret && headerSecret === growthSecret) return true;
  }

  return false;
}
