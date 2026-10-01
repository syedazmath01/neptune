-- Neptune (by 99sols.ai) — pipeline support + column-level write restrictions + schedules.

-- ============================================
-- Feature 1.5: manual Google rank per prompt
-- ============================================
alter table public.prompts add column google_rank int check (google_rank between 1 and 100);

-- ============================================
-- Column-scoped writes (security.md Phase 6: users can't touch ownership/privileged fields)
-- ============================================
revoke insert, update, delete on all tables in schema public from anon;

revoke update on public.prompts from authenticated;
grant update (google_rank) on public.prompts to authenticated;
create policy "prompts_update_own_rank" on public.prompts
  for update to authenticated
  using (public.owns_company(company_id))
  with check (public.owns_company(company_id));

revoke update on public.recommendations from authenticated;
grant update (status, implementation_notes, implemented_at, updated_at) on public.recommendations to authenticated;

revoke update on public.companies from authenticated;
grant update (name, domain, industry, products_services, target_market, business_goals, onboarding_completed, updated_at)
  on public.companies to authenticated;

-- role is never self-assignable
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ============================================
-- Pipeline idempotency: one answer per prompt / round / engine
-- ============================================
create unique index responses_prompt_round_engine on public.responses(prompt_id, measurement_round, engine);

-- Live "analysis in progress" updates on the dashboard (RLS still applies to Realtime)
alter publication supabase_realtime add table public.prompts, public.measurement_runs;

-- ============================================
-- Schedules (archicture.md Section 10). Secrets live in Vault, never in this file:
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<PIPELINE_SECRET value>', 'pipeline_secret');
-- ============================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'weekly-prompt-refresh',
  '0 6 * * 1',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/run-chatgpt-batch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pipeline_secret')
      ),
      body := '{"trigger":"scheduled_weekly"}'::jsonb
    );
  $$
);

select cron.schedule(
  'check-due-measurements',
  '0 8 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/run-measurement',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pipeline_secret')
      ),
      body := '{"trigger":"scheduled_check"}'::jsonb
    );
  $$
);
