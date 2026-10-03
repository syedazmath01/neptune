-- Neptune (by 99sols.ai) — 14-day free trial, then monthly ($29) or yearly ($290).
-- Billing is manual for now (invoice, then set plan + paid_until in the Table Editor).
-- Users can read these columns (table-level select) but never change them
-- (no column-level update grant), so a trial can't be extended from the browser.

alter table public.companies
  add column trial_ends_at timestamptz not null default (now() + interval '14 days'),
  add column plan text not null default 'trial' check (plan in ('trial', 'monthly', 'yearly')),
  add column paid_until timestamptz;

-- Existing companies: trial counts from when they signed up.
update public.companies set trial_ends_at = created_at + interval '14 days';

-- Pipeline + dashboard rule: a company may run analyses while either is in the future.
comment on column public.companies.trial_ends_at is 'Free trial end. Analyses run while trial_ends_at or paid_until is in the future.';
comment on column public.companies.paid_until is 'Set manually after an invoice is paid (monthly: +1 month, yearly: +1 year).';
