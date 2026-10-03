-- Neptune (by 99sols.ai) — explicit table privileges.
-- New Supabase projects don't auto-grant public tables to the API roles, so RLS policies
-- alone give "permission denied". Grants below mirror the policies exactly; RLS still
-- scopes every row. Column-level UPDATE grants stay as set in 20261001000100.

-- Pipeline (Edge Functions): service_role bypasses RLS but still needs privileges.
grant select, insert, update, delete on all tables in schema public to service_role;

-- Signed-in users: read their own data (RLS), plus the writes their policies allow.
grant select on
  public.profiles, public.companies, public.competitors, public.prompts, public.responses,
  public.citations, public.gaps, public.recommendations, public.measurement_runs
to authenticated;
grant insert on public.companies, public.competitors to authenticated;
grant delete on public.competitors to authenticated;

-- anon: no table access (the marketing site reads nothing from the database).
