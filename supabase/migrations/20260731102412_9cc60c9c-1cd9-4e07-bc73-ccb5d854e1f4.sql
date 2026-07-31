SELECT cron.schedule(
  'daily-puzzle-email',
  '0 8 * * *',
  $$ SELECT net.http_post(
    url:='https://kicabdwgdyabibioycbq.supabase.co/functions/v1/daily-puzzle-email',
    headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '", "Content-Type": "application/json"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id; $$
);