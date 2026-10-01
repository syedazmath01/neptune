# CLAUDE.md

Instructions for Claude Code working in this repository.

## What this project is

Neptune — an AI visibility optimization platform (MVP), built by **99sols.ai**.
It monitors where a company appears (or doesn't) in AI answer engines like
ChatGPT, diagnoses why competitors get recommended instead, generates
evidence-backed content recommendations, and measures whether implementing
them actually improved AI visibility. Closed loop: Observe → Diagnose → Act
→ Measure → Learn.

Code lives in `apps/web/` (Next.js) and `supabase/` (migrations + 8 Edge
Functions). Read the planning docs before changing behavior; `archicture.md`
Section 13 "Implementation notes" describes how the pipeline is wired.

Commands:
- `cd apps/web && npm run dev` / `npm run build` / `npx tsc --noEmit`
- `npx deno test supabase/functions/_shared/` — pipeline logic tests
- `npx deno check supabase/functions/*/index.ts` — Edge Function typecheck

### Branding rule
The infinity-loop icon in `logo.png` is **99sols.ai's corporate mark**, not
a Neptune-specific symbol — it may appear across other 99sols.ai products
later, so don't treat it as needing a conceptual tie to "Neptune." The
"NEPTUNE" wordmark is the product identity. Any primary brand-mark
placement (navbar, footer, login/signup screens, marketing pages, emails,
PDF/PPT exports) must show all three together: the icon + "NEPTUNE" +
"by 99sols.ai" attribution text. Only in tight spaces where just the icon
fits (favicon, small app icon) can the wordmark/attribution be dropped —
never show the wordmark without the attribution text next to it. Full rule
in `prd.md`'s Branding Convention note (Feature 4.3 for the marketing-site
application of it).

The approved logo asset is `logo.png` (project root). Its variants do
**not** have "by 99sols.ai" baked into the image — that attribution must be
added as adjacent text/markup wherever the logo is rendered. Don't
substitute a different icon (e.g. a flat single-color version drawn ad hoc)
without carrying this same lockup rule forward.

## Source-of-truth documents (read in this order)

1. **`prd.md`** — product scope, features (numbered 1.1–4.2), personas, KPIs,
   the phased build plan (Section 12), and MVP vs. non-MVP boundaries
   (Section 6). Start here to understand *what* to build and *why*.
2. **`archicture.md`** — the canonical tech stack, project structure,
   database schema (full SQL + RLS policies), API surface, and sequence
   diagrams. This is the source of truth for *how* to build it. If `prd.md`
   and `archicture.md` ever disagree on stack/schema/endpoints,
   **`archicture.md` wins** — `prd.md` Section 9 explicitly defers to it.
3. **`security.md`** — a Supabase-focused security audit checklist. Run it
   before any production deploy, and keep its rules (RLS mandatory, no
   `service_role` key on the client, verified webhook signatures, etc.) in
   mind while writing code, not just at audit time.
4. **`responsiveness.md`**, **`seo.md`**, **`payment_gatway_setup.md`** —
   standalone task prompts, not specs. Only act on them when the user
   explicitly invokes that task. `payment_gatway_setup.md` is deferred until
   a self-serve pricing tier exists (see `prd.md` Section 6) — MVP sales are
   sales-led with manual invoicing, not in-app checkout.

## Tech stack (do not deviate without updating `archicture.md`)

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
  + shadcn/ui, TanStack Query, Recharts, Framer Motion (`motion` npm
  package) for 3D-feel/marketing animation and dashboard micro-interactions
- **Backend:** Supabase (Postgres + Row Level Security, Auth, Storage,
  Realtime, Edge Functions on Deno), pg_cron for scheduling
- **AI:** OpenAI API (`openai` npm SDK) — ChatGPT only for MVP
- **Email:** Resend · **Monitoring:** Sentry
- **Hosting:** Vercel (frontend) + Supabase Cloud (backend)

There is **no separate backend server** (no FastAPI/Express/etc.) — all
business logic that can't live in a Server Action runs as a Supabase Edge
Function. Don't introduce a second backend runtime.

## Project structure (once scaffolded)

Follow `archicture.md` Section 4 exactly:

```
apps/web/            # Next.js app (app router, components, Server Actions)
supabase/migrations/  # SQL migrations
supabase/functions/   # One Edge Function per PRD feature (see mapping below)
```

Edge Functions map 1:1 to PRD features — keep that mapping when adding code:

| Edge Function | PRD Feature |
|---|---|
| `generate-prompts` | 1.1 |
| `run-chatgpt-batch` | 1.2 |
| `extract-citations` | 1.3 |
| `analyze-competitors` | 1.4 |
| `analyze-gaps` | 1.5 |
| `map-content-gaps` | 1.6 |
| `generate-recommendations` | 2.1 |
| `run-measurement` | 3.1 |

## Build order

Follow `prd.md` Section 12 (Build Plan) phase by phase — don't skip ahead;
later phases depend on tables/functions created in earlier ones. When asked
to work on "Phase N," check that section's "Definition of Done" and stop
there rather than over-building into the next phase.

## Database & security rules (non-negotiable)

- **Every table with company/user data must have RLS enabled**, scoped
  through `owner_id`/`company_id` — see `archicture.md` Section 5.3 for the
  policy pattern. Never disable RLS to unblock a bug; fix the policy.
- The Supabase **`service_role` key is server-only** (Edge Functions and
  trusted Server Actions) — never in `NEXT_PUBLIC_*` vars, never shipped to
  the client bundle.
- Treat all AI response text (citations, competitor content) as **untrusted
  data** — never feed it back into further LLM calls without sanitization
  (prompt-injection risk, per `archicture.md` Section 12).
- No raw string-concatenated SQL; use the Supabase client / PostgREST
  parameterized queries.
- Schema changes go through versioned migrations in `supabase/migrations/`,
  never hand-edited directly against a live project.

## Conventions

- New SQL migrations, Edge Functions, and API routes should match the
  naming and folder conventions already laid out in `archicture.md` — don't
  invent a different structure for convenience.
- Keep feature work traceable: a recommendation must be able to point back
  to the prompt/response/citation/gap that produced it (the "traceability
  over normalization" principle in `archicture.md` Section 1). Don't
  normalize that lineage away for tidiness.
- Cache/batch OpenAI calls (see `prd.md` Section 13, Cost Guardrails) —
  don't re-call the API for data already fetched in dev/test runs.

## What not to do

- Don't scaffold a Python/FastAPI backend, Alembic migrations, or Vite
  frontend — that was the original draft and was superseded (see
  `archicture.md` Section 16, Decision Log). If you see stale references to
  it anywhere, that's a doc bug, not the plan.
- Don't build self-serve payment/checkout flows for MVP (see `prd.md`
  Section 6) — that's deferred.
- Don't add multi-engine support (Perplexity, Claude, Gemini), ML-based
  recommendations, or automated CMS publishing — all explicitly out of
  scope for MVP (`prd.md` Section 6).
