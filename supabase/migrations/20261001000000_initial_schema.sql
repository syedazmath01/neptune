-- Neptune (by 99sols.ai) — initial schema. Source: archicture.md Section 5.

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text default 'member' check (role in ('owner', 'member', 'admin')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- COMPANIES
-- ============================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  domain text not null,
  industry text not null check (industry in ('saas', 'professional_services', 'ecommerce', 'other')),
  products_services text[],
  target_market text,
  business_goals text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_companies_owner on public.companies(owner_id);

-- ============================================
-- COMPETITORS
-- ============================================
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  domain text not null,
  auto_detected boolean default false,
  created_at timestamptz default now()
);
create index idx_competitors_company on public.competitors(company_id);

-- ============================================
-- PROMPTS (Feature 1.1)
-- ============================================
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  text text not null,
  category text not null check (category in ('problem_awareness', 'comparison', 'feature', 'use_case', 'competitive')),
  active boolean default true,
  created_at timestamptz default now()
);
create index idx_prompts_company on public.prompts(company_id);

-- ============================================
-- RESPONSES (Feature 1.2) — immutable, append-only
-- ============================================
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  engine text not null default 'chatgpt' check (engine in ('chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai_overview')),
  full_text text not null,
  raw_sources jsonb,
  measurement_round int not null default 1,
  model_version text,
  created_at timestamptz default now()
);
create index idx_responses_prompt on public.responses(prompt_id);
create index idx_responses_round on public.responses(measurement_round);

-- ============================================
-- CITATIONS (Feature 1.3)
-- ============================================
create table public.citations (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references public.responses(id) on delete cascade not null,
  domain text not null,
  url text,
  brand_mentioned text,
  entity_type text check (entity_type in ('own_company', 'competitor', 'third_party_source')),
  context text check (context in ('recommended', 'compared', 'alternative', 'warning', 'neutral_mention')),
  confidence_score numeric(3,2),
  needs_review boolean default false,
  created_at timestamptz default now()
);
create index idx_citations_response on public.citations(response_id);
create index idx_citations_domain on public.citations(domain);

-- ============================================
-- GAPS (Feature 1.5)
-- ============================================
create table public.gaps (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id),
  gap_type text not null check (gap_type in ('visibility_gap', 'substitution_gap', 'authority_gap', 'coverage_gap', 'format_gap', 'evidence_gap', 'tone_gap', 'social_proof_gap')),
  description text not null,
  google_rank int,
  competitor_citation_count int default 0,
  own_citation_count int default 0,
  priority text not null check (priority in ('high', 'medium', 'low')),
  priority_score numeric,
  status text default 'open' check (status in ('open', 'addressed', 'dismissed')),
  created_at timestamptz default now()
);
create index idx_gaps_company on public.gaps(company_id);
create index idx_gaps_priority on public.gaps(priority);

-- ============================================
-- RECOMMENDATIONS (Feature 2.1)
-- ============================================
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  gap_id uuid references public.gaps(id),
  action_type text not null check (action_type in ('create_content', 'optimize_existing', 'authority_building', 'internal_linking')),
  title text not null,
  description text not null,
  implementation_example text,
  evidence text,
  expected_impact text not null check (expected_impact in ('high', 'medium', 'low')),
  time_estimate_hours int,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'in_progress', 'implemented', 'skipped')),
  implemented_at timestamptz,
  implementation_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_recommendations_company on public.recommendations(company_id);
create index idx_recommendations_status on public.recommendations(status);

-- ============================================
-- MEASUREMENT_RUNS (Feature 3.1, 3.2)
-- ============================================
create table public.measurement_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  round_number int not null,
  triggered_by_recommendation_id uuid references public.recommendations(id),
  brand_citations_count int,
  brand_recommendation_count int,
  citation_share numeric(5,2),
  recommendation_share numeric(5,2),
  competitor_snapshot jsonb,
  confidence_level numeric(5,2),
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
create index idx_measurement_company on public.measurement_runs(company_id);
create index idx_measurement_round on public.measurement_runs(round_number);

-- ============================================
-- ROW LEVEL SECURITY
-- Writes from Edge Functions use service_role (bypasses RLS).
-- ============================================
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.competitors enable row level security;
alter table public.prompts enable row level security;
alter table public.responses enable row level security;
alter table public.citations enable row level security;
alter table public.gaps enable row level security;
alter table public.recommendations enable row level security;
alter table public.measurement_runs enable row level security;

create or replace function public.owns_company(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.companies c
    where c.id = cid and c.owner_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_company(uuid) from public, anon;
grant execute on function public.owns_company(uuid) to authenticated;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- COMPANIES
create policy "companies_select_own" on public.companies
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "companies_insert_own" on public.companies
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "companies_update_own" on public.companies
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- COMPETITORS (user manages during onboarding/settings)
create policy "competitors_select_own" on public.competitors
  for select to authenticated using (public.owns_company(company_id));
create policy "competitors_insert_own" on public.competitors
  for insert to authenticated with check (public.owns_company(company_id));
create policy "competitors_delete_own" on public.competitors
  for delete to authenticated using (public.owns_company(company_id));

-- READ-ONLY for users (written by Edge Functions)
create policy "prompts_select_own" on public.prompts
  for select to authenticated using (public.owns_company(company_id));
create policy "gaps_select_own" on public.gaps
  for select to authenticated using (public.owns_company(company_id));
create policy "measurement_runs_select_own" on public.measurement_runs
  for select to authenticated using (public.owns_company(company_id));

create policy "responses_select_own" on public.responses
  for select to authenticated using (
    exists (select 1 from public.prompts p where p.id = prompt_id and public.owns_company(p.company_id))
  );
create policy "citations_select_own" on public.citations
  for select to authenticated using (
    exists (
      select 1 from public.responses r
      join public.prompts p on p.id = r.prompt_id
      where r.id = response_id and public.owns_company(p.company_id)
    )
  );

-- RECOMMENDATIONS: users approve/reject/mark implemented
create policy "recommendations_select_own" on public.recommendations
  for select to authenticated using (public.owns_company(company_id));
create policy "recommendations_update_own" on public.recommendations
  for update to authenticated
  using (public.owns_company(company_id))
  with check (public.owns_company(company_id));

-- Realtime: live "analyzing N/52" progress on onboarding (archicture.md Section 9)
alter publication supabase_realtime add table public.responses;
