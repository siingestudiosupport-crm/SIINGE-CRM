-- Setup daily follow-up report at 8 AM EST (1 PM UTC / 13:00)
-- This requires pg_cron extension to be enabled in Supabase

-- First, ensure pg_cron is installed
create extension if not exists pg_cron;

-- Create the cron job to run schedule-followup-reminder daily at 1 PM UTC (8 AM EST)
-- Schedule format: minute hour day month day_of_week
-- 0 13 * * * = every day at 13:00 (1 PM UTC)
select cron.schedule(
  'daily-followup-report',
  '0 13 * * *',
  'select net.http_post(url := ''https://pbylrmaqtmgnywzdliql.supabase.co/functions/v1/schedule-followup-reminder'', headers := jsonb_build_object(''Authorization'', ''Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWxybWFxdG1nbnl3emRsaXFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA3NTY5OSwiZXhwIjoyMDkwNjUxNjk5fQ.JavRsQllFboPrgbXgGYky3s_TSPmFn1Rd55pKAHWhCI''), body := ''{}''::jsonb) as request_id;'
);

-- Verify the cron job was created
select jobname, schedule, command from cron.job where jobname = 'daily-followup-report';
