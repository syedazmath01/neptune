-- Neptune (by 99sols.ai) — multiple AI answer engines (Grok now, ChatGPT once its key is set).
-- Every metric is kept per engine; scores from different engines are never mixed.

-- Allowed engines: add Grok.
alter table public.responses drop constraint responses_engine_check;
alter table public.responses add constraint responses_engine_check
  check (engine in ('chatgpt', 'grok', 'perplexity', 'claude', 'gemini', 'google_ai_overview'));
alter table public.responses alter column engine drop default;

-- Per-engine round metrics replace the single-engine columns:
-- { "<engine>": { brand_citations_count, brand_recommendation_count, citation_share,
--                 recommendation_share, competitor_snapshot, confidence_level, answers } }
alter table public.measurement_runs
  add column engine_metrics jsonb not null default '{}',
  drop column brand_citations_count,
  drop column brand_recommendation_count,
  drop column citation_share,
  drop column recommendation_share,
  drop column competitor_snapshot,
  drop column confidence_level;

-- Which engine(s) each gap was seen on (merged across engines by the pipeline).
alter table public.gaps add column engines text[] not null default '{}';

-- The batch function was renamed run-chatgpt-batch -> run-engine-batch.
-- cron.schedule with an existing job name replaces that job.
select cron.schedule(
  'weekly-prompt-refresh',
  '0 6 * * 1',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/run-engine-batch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pipeline_secret')
      ),
      body := '{"trigger":"scheduled_weekly"}'::jsonb
    );
  $$
);
