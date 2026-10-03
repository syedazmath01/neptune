# Neptune PRD - AI Search Intelligence Engine (MVP)
**Product:** Neptune, by 99sols.ai  
**Version:** 1.2 (Claude Code Build Edition)  
**Last Updated:** September 2026  
**Status:** MVP Phase — Ready for Implementation  
**Built With:** Claude Code  
**Companion Doc:** `archicture.md` is the canonical source for stack, schema, and setup — Section 9/12/13 below were updated to match it after the team moved from the original Python/FastAPI draft to Next.js + Supabase (see `archicture.md` Section 16, Decision Log).

### Branding Convention
Neptune is a product of **99sols.ai**. The infinity-loop icon in `logo.png` is **99sols.ai's corporate mark** — it represents the company, not Neptune specifically, and may appear across other 99sols.ai products in the future. It is not meant to visually symbolize "Neptune" on its own; that's why the icon carries no conceptual tie to the product name. The **"NEPTUNE" wordmark is the product identity** — the icon and wordmark together form the product lockup, and the company attribution text makes the company relationship explicit for anyone who doesn't already know the icon.

Wherever the product is presented as a standalone brand mark in the UI or in outbound communication — app header/logo, browser tab title, login/signup screen, marketing site, emails, invoices, PDF/PPT exports — show the full lockup:

> [infinity icon] **NEPTUNE**
> *by 99sols.ai*

The icon (99sols.ai's mark) + "NEPTUNE" (product wordmark) + "by 99sols.ai" (company attribution, in text) must all three be present together in any primary brand-mark placement (navbar, footer, login screen, hero). In tight spaces where only the icon fits (favicon, small app icon), the full lockup isn't possible — that's acceptable there, but any surface that shows the wordmark must also show the "by 99sols.ai" text; don't show the wordmark alone.

This does not apply to plain in-sentence references to "Neptune" within body copy or documentation (like the rest of this PRD) — only to the product's name/logo lockup wherever it's presented as a brand mark.

**Logo asset:** `logo.png` (project root) is the approved icon — a brushed-metal infinity symbol representing 99sols.ai, with primary/icon/horizontal/monochrome/hero variants, paired with the "NEPTUNE" wordmark. None of its variants have the "by 99sols.ai" attribution text baked into the image itself, so every UI surface that renders the full lockup must add that attribution as adjacent text/markup — don't assume the image alone satisfies this convention, and don't substitute a different icon (e.g. a flat single-color version drawn ad hoc) without carrying this same lockup rule forward.

---

## 0. How to Use This PRD With Claude Code

This document is written to be fed directly to Claude Code as the source of truth for the build. Recommended workflow:

1. **Start a project folder** and drop this file in as `PRD.md` at the repo root — Claude Code can reference it throughout the session.
2. **Build in the order defined in Section 12 (Build Plan)** — each phase is scoped to be completable in one focused Claude Code session and produces a working, testable slice.
3. **Give Claude Code one phase at a time.** Don't ask it to build the whole product in one prompt — paste/reference the specific feature section (e.g. "Feature 1.1") and let it scaffold, implement, and test that slice before moving on.
4. **Use Section 9 (Technical Architecture) as the scaffolding contract** — data models and API endpoints are specified so Claude Code can generate consistent schemas/migrations across sessions instead of improvising each time.
5. **Treat Section 13 (Environment & Setup)** as the first thing Claude Code should do in a fresh repo — API keys, `.env` structure, dependency install.
6. **Re-paste this file when starting a new session** — Claude Code doesn't retain memory across separate sessions unless you're using persistent project context, so keep this PRD as the canonical reference to re-anchor it.

**Suggested first prompt to Claude Code:**
> "Read PRD.md. We're building Neptune's MVP. Start with Phase 0 in Section 12 — scaffold the project structure and environment setup from Section 13. Don't build features yet, just get the skeleton running."

---

## 1. Executive Summary

Neptune is an AI visibility optimization platform that solves a critical gap: companies don't know why AI answer engines (ChatGPT, Perplexity, Claude) recommend their competitors instead of them, and they lack data-driven actions to fix it.

Neptune continuously monitors where companies appear (or don't appear) in AI-generated answers, identifies the content gaps causing visibility loss, recommends evidence-backed optimizations, and measures whether those changes actually improve AI visibility—creating a closed-loop Observe → Diagnose → Act → Measure → Learn system.

**Core Value Proposition:**  
Companies pay for actionable intelligence that tells them exactly where they're losing AI-driven customers, why, what to change, and proof that the change worked—not another SEO dashboard.

---

## 2. Problem Statement

### The Market Problem
- **AI Answer Engines Are Real Traffic Now**: ChatGPT, Perplexity, and Claude are increasingly how professionals research products/solutions; they account for 15-20% of qualified traffic for B2B SaaS companies
- **Visibility Gap**: Companies rank on Google but get zero AI citations; they lose customers to competitors recommended by AI without understanding why
- **No Diagnostic Tool**: Existing SEO tools (SEMrush, Ahrefs, Moz) don't track AI recommendations, and AI companies don't expose citation attribution data
- **Blind Optimization**: Marketing teams make content changes without knowing if those changes actually impact AI visibility

### User Pain Points
1. **Loss of qualified leads** to competitors recommended by AI
2. **Unclear optimization priorities**—is it SEO, content authority, structured data, or something else?
3. **No measurement framework**—can't prove content investments moved the needle on AI visibility
4. **Time-to-insight is slow**—waiting months for SEO tools to index and correlate data

---

## 3. Solution Overview

Neptune is a **closed-loop AI visibility optimization platform** that:

1. **Observes** where companies appear (or don't) in AI-generated answers across multiple engines
2. **Diagnoses** why visibility gaps exist (content gaps, lack of authority, missing structured data)
3. **Recommends** specific evidence-backed actions to improve visibility
4. **Measures** whether actions actually increased AI recommendations
5. **Learns** which content changes drive real AI visibility improvements

---

## 4. Target Audience & Buyer Personas

### Primary Markets (MVP Phase)
- **B2B SaaS companies** (50-500 employees) with high customer acquisition cost (CAC)
- **Professional services firms** (consulting, legal, accounting) competing on thought leadership
- **E-commerce/marketplace platforms** losing discovery traffic to competitors

### Buyer Personas

#### Persona 1: Sarah Chen - VP of Growth (SaaS)
- **Company**: Mid-market SaaS ($5-20M ARR)
- **Role**: Owns pipeline, CAC, and marketing ROI
- **Pain Points**:
  - Lost 15-20% of inbound leads to competitor because AI recommends them first
  - Can't explain to CEO why SEO improvements didn't move the needle
  - Needs to justify marketing budget spend with clear ROI
- **Goals**:
  - Understand why competitors win in AI answers
  - Reduce CAC by recapturing AI-driven customers
  - Prove marketing investments improve business outcomes
- **Decision Criteria**:
  - Clear ROI measurement
  - Actionable, not just data
  - Integration with existing tools (GA, HubSpot, Slack)
- **Budget**: $5-15K/month for critical visibility challenges

#### Persona 2: Marcus Rodriguez - Head of Marketing
- **Company**: Mid-market B2B (enterprise software, fintech, HR tech)
- **Role**: Leads content strategy, owned marketing channels
- **Pain Points**:
  - Content performance measured only by SEO rankings, not revenue impact
  - Doesn't know which competitors dominate AI conversations
  - Struggles to prioritize content investments
- **Goals**:
  - See where his brand shows up in AI answers
  - Get evidence-backed content recommendations
  - Prove content optimization drives real business impact
- **Decision Criteria**:
  - Easy onboarding (no manual competitor research)
  - Clear before/after metrics
  - Ability to implement recommendations without external help
- **Budget**: $3-10K/month depending on company size

#### Persona 3: James Patterson - Content Strategy Lead
- **Company**: Large B2B/E-commerce (100+ employees)
- **Role**: Owns editorial, thought leadership, technical documentation
- **Pain Points**:
  - Creates high-quality content but doesn't see improvement in AI recommendations
  - No feedback loop on what resonates in AI contexts
  - Competes with better-resourced competitors for thought leadership
- **Goals**:
  - Optimize content specifically for AI discoverability
  - Understand why competitor content ranks higher in AI answers
  - Get specific tactical recommendations (add FAQ, improve source authority, etc.)
- **Decision Criteria**:
  - Deep content analysis and recommendations
  - Integration with content management workflow
  - Proof that changes drive visibility
- **Budget**: $8-15K/month

---

## 5. MVP Scope & Features

### Phase 1: Core Data Collection & Analysis (Weeks 1-6)

#### Feature 1.1: Prompt Intelligence Engine
**Description**: Generates real, intent-driven prompts based on company profile and industry.

**Specifications**:
- Input: Company domain, industry (SaaS), 2-3 main competitors
- Output: 50+ unique customer-intent prompts tailored to the company
- Prompt Categories:
  - Problem-awareness ("best project management tool for remote teams")
  - Solution-comparison ("Asana vs Monday vs ClickUp")
  - Feature-specific ("tools with Slack integrations")
  - Use-case ("project management for small teams vs enterprises")
  - Competitive positioning ("alternatives to [competitor]")
- Quality: Prompts derived from real search query data + LLM generation
- Update frequency: Weekly (initial MVP), monthly (production)

**Technical**:
- Input: Company profile (domain, vertical, competitors)
- Output: JSON with 50-100 prompts, categorized by intent
- No manual curation required in MVP (quality validated with first customer)

---

#### Feature 1.2: Multi-Engine Observation (MVP: Grok live, ChatGPT when its key is added)
**Description**: Runs prompts across AI answer engines and captures complete responses.

**Specifications**:
- **MVP Phase**: Grok (xAI API) is the live engine. ChatGPT (OpenAI API) switches on automatically once `OPENAI_API_KEY` is set, with no code change. Every prompt is asked to every active engine, and each engine is scored separately (never mixed)
- **Scope**: Each prompt gets one response; full text captured
- **Data Collected**:
  - Complete AI response (text)
  - Sources cited (domain names, URLs)
  - Brand/company mentions in response
  - Sentiment/positioning (positive, neutral, negative)
  - Competitor mentions
- **Cadence**: 
  - Initial baseline run: Week 1
  - Weekly runs thereafter
  - Complete response history retained
- **Cost Management**:
  - Use the cheaper model tier per engine (`grok-4.3`, `gpt-4-turbo`); cost scales with the number of active engines
  - Cache repeated prompts to reduce API calls
  - Batch run all 50 prompts in single session

**Technical**:
- OpenAI-compatible API integration via the `openai` SDK (xAI for Grok, OpenAI for ChatGPT)
- Response parsing and raw storage
- Schema: `{prompt_id, engine, timestamp, full_response_text, raw_sources}`

---

#### Feature 1.3: Citation & Source Extraction
**Description**: Parses AI responses and extracts structured citation data.

**Specifications**:
- **Input**: Raw ChatGPT responses
- **Output**: Structured citations with:
  - Domain cited
  - URL (if provided)
  - Company/brand mentioned in response
  - Context (how cited—recommendation, comparison, warning)
  - Frequency (how many times cited across all prompts)
- **Parsing Logic**:
  - URL extraction (regex + LLM-assisted for implicit mentions)
  - Brand name detection (exact match + fuzzy matching for variations)
  - Context classification ("recommended," "alternative," "compared to")
- **Ambiguity Handling**:
  - Manual tagging for first 100 responses (MVP validation)
  - Build extraction rules from tagged data
  - Flag low-confidence citations for manual review
- **Output Format**: CSV/JSON with citations indexed by prompt ID

**Technical**:
- LLM-assisted parsing (Claude/GPT for ambiguous cases)
- Rule-based extraction for clear citations
- Manual review queue for validation

---

#### Feature 1.4: Competitor & Brand Identification
**Description**: Identifies which competitors are mentioned, recommended, and cited across AI responses.

**Specifications**:
- **Input**: Structured citations + raw responses
- **Output**: Competitor visibility scorecard
  - Your brand: citation count, recommendation frequency, sentiment
  - Competitor A: citation count, recommendation frequency, sentiment
  - Competitor B: citation count, recommendation frequency, sentiment
  - Untracked competitors mentioned
- **Metrics Tracked**:
  - **Citation Count**: Total times domain appears across all prompts
  - **Recommendation Rate**: % of prompts where brand is recommended (vs. mentioned neutrally)
  - **Citation Share**: Your citations / total citations across category
  - **Recommendation Share**: Your recommendations / total recommendations
- **Analysis**:
  - Identify which prompts don't mention your company
  - Identify which prompts recommend competitors instead
  - Correlation: prompts where you lose (competitor wins, you don't appear)

**Technical**:
- Schema: `{competitor_name, domain, citation_count, recommendation_count, sentiment, prompt_list}`
- Allows manual competitor addition if auto-detection misses

---

#### Feature 1.5: AI Visibility Gap Analyzer
**Description**: Compares AI visibility with Google SEO rankings to identify optimization gaps.

**Specifications**:
- **Input**: 
  - Competitor citation data from Neptune
  - Google rankings (via Search Console or user input)
- **Output**: Gap Analysis Report
  - "You rank #2 on Google but zero AI citations" → **High Priority Gap**
  - "Competitor ranks #5 on Google but 8 AI citations vs your 1" → **Visibility Inversion**
  - "You appear in AI but lack structured data" → **Authority Gap**
  - "You're cited but never as primary recommendation" → **Positioning Gap**
- **Gap Types** (MVP):
  1. **Visibility Gap**: Rank well on Google, missing from AI
  2. **Substitution Gap**: Competitor recommended when searched
  3. **Authority Gap**: Cited but not trusted as primary source
  4. **Coverage Gap**: Don't appear for certain use cases/verticals
- **Priority Scoring**:
  - High: High Google volume + zero AI citations
  - Medium: Low Google volume + losing to competitor in AI
  - Low: Cited but rarely recommended

**Technical**:
- Correlation analysis: prompt intent → Google ranking → AI citation
- Gap scoring formula: `(google_rank_volume × missing_ai_mention) / competitor_ai_citations`

---

#### Feature 1.6: Content Gap Mapping
**Description**: Maps which content pieces are missing or underperforming to drive AI visibility.

**Specifications**:
- **Input**: Gap analysis + raw responses
- **Output**: Content inventory
  - Topics you should cover but don't (identified from competitor responses)
  - Pages that rank on Google but get zero AI citations
  - Content types competitors use (FAQs, comparison tables, case studies)
  - Authority gaps (you don't have sources for claims competitors cite)
- **Specific Gaps** (MVP detects):
  - "Competitors cite FAQs on this topic; you don't have an FAQ" → **Format Gap**
  - "Competitor cited on ROI; you lack ROI metrics/proof" → **Evidence Gap**
  - "Your page ranks but uses passive voice; competitor uses active, data-driven language" → **Tone Gap**
  - "Competitor has 50+ customer reviews; you have 5" → **Social Proof Gap**
- **Output Format**: Spreadsheet/CSV with:
  - Gap type
  - Competitor example
  - Recommended content type
  - Estimated impact (high/medium/low)

**Technical**:
- Topic extraction from competitor responses (NLP)
- Your site crawl (Sitemap + metadata extraction)
- Gap detection: competitor topics not on your site

---

### Phase 2: Actionable Recommendations (Weeks 4-6)

#### Feature 2.1: Actionable Recommendations Engine
**Description**: Converts gap analysis into specific, implementable actions with expected impact.

**Specifications**:
- **Input**: Content gap analysis
- **Output**: Prioritized action list with:
  - Action description (create FAQ, add structured data, improve source authority)
  - Specific implementation (e.g., "Add FAQ section to pricing page addressing: 'How does Acme compare to Monday?'")
  - Evidence (which competitor uses this; how often cited)
  - Expected impact (high/medium/low based on citation volume)
  - Time estimate (hours to implement)
- **Recommendation Types** (MVP v1):
  1. **Create Content**: FAQ, comparison page, use-case guide
  2. **Optimize Existing**: Add structured data, improve clarity, add evidence
  3. **Authority Building**: Get cited on industry blogs, get mentioned in reviews
  4. **Internal Linking**: Link related content to improve discoverability
- **Impact Classification**:
  - **High**: Competitor gets 10+ citations on this topic; you're missing it
  - **Medium**: Competitor cited 3-5x; you have weak coverage
  - **Low**: Niche topic; limited traffic potential
- **Approval Workflow**:
  - Customer reviews recommendations
  - Marks approved/rejected/modify
  - Neptune tracks approved actions for re-measurement

**Technical**:
- Recommendation stored in DB with implementation status
- Linked to original prompts/gaps for traceability
- Flag for re-measurement after implementation (2-week window)

---

#### Feature 2.2: Implementation Tracking
**Description**: Records what actions the customer took so Neptune can measure impact.

**Specifications**:
- **Input**: Approved actions
- **Output**: Implementation checklist
  - Action
  - Status (pending, in-progress, completed, skipped)
  - Completion date
  - Notes (what was actually done)
- **Notification**: Slack/Email reminder when action is 80% likely complete (based on typical timelines)
- **Re-measurement Trigger**: When action marked "completed," schedule re-run of related prompts in 2 weeks

**Technical**:
- Simple toggle/checkbox for implementation status
- Optional notes field
- Webhook to trigger re-measurement analysis

---

### Phase 3: Measurement & Learning (Week 5-6)

#### Feature 3.1: Before/After Measurement
**Description**: Re-runs the same prompts after actions are implemented and measures visibility changes.

**Specifications**:
- **Input**: Original baseline data + new responses (week 2-3 after implementation)
- **Output**: Before/After scorecard
  - **Your Brand**:
    - Brand mentions: 5 → 12 (+140%)
    - Recommendations: 3 → 8 (+167%)
    - Citations from authority domains: 2 → 7 (+250%)
  - **Competitor A**:
    - Brand mentions: 18 → 17 (-5%)
    - Recommendations: 10 → 9 (-10%)
  - **Share Metrics**:
    - Your citation share: 8% → 25% (+17 pp)
    - Your recommendation share: 5% → 22% (+17 pp)
- **Correlation Analysis**:
  - Which implemented actions drove the biggest lift
  - Which prompts improved (and why)
  - Which actions had zero impact
- **Confidence Level**: Display (based on sample size, time elapsed, data quality)

**Technical**:
- Side-by-side comparison (before/after for each metric)
- Trend visualization (line chart over time)
- Statistical significance test (if sufficient data)

---

#### Feature 3.2: Results Dashboard
**Description**: Single-view dashboard showing progress toward AI visibility goals.

**Specifications**:
- **Top-Line Metrics**:
  - Your brand mentions (count, trend)
  - Your recommendation rate (%, trend)
  - Your citation share (%, trend)
  - Share of voice vs competitors (%, trend)
- **Competitive Positioning**:
  - You vs Competitor A vs Competitor B (side-by-side chart)
  - Win/loss analysis (which prompts you're winning, losing)
- **Gap Progress**:
  - Status of each recommended action (pending, in-progress, completed)
  - Expected impact vs actual impact of completed actions
- **Prompts Trending**:
  - Which prompts moved the needle
  - Which prompts still show competitors
- **Drill-Down**: Click any metric to see underlying prompts and changes

**Technical**:
- Real-time data (updated after each measurement run)
- Exportable to PDF/PPT for board presentations
- Embedded widgets for Slack/HubSpot

---

### Phase 4: UI & Onboarding (Weeks 3-6)

#### Feature 4.1: Company Onboarding Flow
**Description**: 5-minute setup to get company analyzing AI visibility.

**Specifications**:
- **Step 1: Company Profile** (1 min)
  - Company name
  - Website domain
  - Industry (dropdown: SaaS, Professional Services, E-commerce, Other)
  - Main product/service (textarea)
- **Step 2: Competitors** (1 min)
  - Add 2-5 main competitors (domain input)
  - Auto-suggest based on industry
- **Step 3: Business Goals** (1 min)
  - What are you optimizing for? (dropdown: increase inbound leads, improve brand visibility, reduce CAC)
  - Current pain point (textarea)
- **Step 4: Setup Complete**
  - "Starting analysis… this will take ~10 minutes"
  - Show progress (Generating prompts → Running analysis → Extracting insights)
- **Post-Setup**:
  - Email with dashboard link
  - Slack invite (if available)
  - Welcome video (2 min)

**Technical**:
- Quick 4-step form
- Server-side validation (domain reachability, competitor verification)
- Trigger background job for prompt generation + analysis

---

#### Feature 4.2: Dashboard UI
**Description**: Clean, intuitive dashboard showing all insights in one place.

**Specifications**:
- **Top of Sidebar (app-level brand mark)**:
  - Neptune logo/wordmark with "by 99sols.ai" beneath it, per the Branding Convention note at the top of this document
- **Left Sidebar**:
  - Customer's company name / logo (the account's own branding, distinct from the Neptune app-level mark above)
  - Navigation: Overview, Gaps, Recommendations, Results, Settings
- **Overview Tab** (main view):
  - Top metrics (brand mentions, recommendation rate, citation share)
  - Competitive positioning chart
  - Latest action status
  - Next re-measurement date
- **Gaps Tab**:
  - All identified gaps (visibility, substitution, authority, coverage)
  - Gap severity indicator (high/medium/low)
  - Related prompts
- **Recommendations Tab**:
  - All recommendations ranked by impact
  - Approve/reject workflow
  - Implementation status checkbox
- **Results Tab**:
  - Before/after comparisons
  - Trend charts
  - Correlation analysis
- **Design**:
  - Clean, modern (Tailwind/similar)
  - Color-coded priority (red: high impact gaps, green: completed actions)
  - Mobile responsive (secondary priority)
  - Motion: purposeful micro-interactions via Framer Motion (see Section 9 Tech Stack) — animated transitions between dashboard tabs, animated number count-ups on metric cards, staggered card entrance on the Gaps/Recommendations tabs. Keep it subtle in-app; save heavier 3D/hero-style motion for the marketing site (Feature 4.3 below).

**Technical**:
- React/TypeScript frontend
- Figma designs (mockups)
- API endpoints for data fetching

---

#### Feature 4.3: Marketing Site / Landing Page
**Description**: Public-facing site that explains Neptune and converts visitors into trial signups. Not part of the authenticated dashboard.

**Specifications**:
- **Visual direction**: follows the illustrated, warm aesthetic established in `platform_theme_template.png` — cream/ivory background, hand-illustrated scene, serif display headline + sans-serif UI/body text, forest-green primary + terracotta/orange accent. This is a deliberate departure from the cold brushed-metal tone of the `logo.png` icon itself — the icon is used small and precisely (navbar, footer) while the surrounding page uses the warmer illustrated palette.
- **Header/Footer**: full brand lockup per the Branding Convention — 99sols.ai infinity icon + "NEPTUNE" wordmark + "by 99sols.ai" attribution text. (The template mockup used a flat single-color icon with no company attribution — both must be corrected to match `logo.png` and the Branding Convention before this ships.)
- **Sections** (per template): hero with product screenshot/chat-mention mockups, 3 value-prop icons, product visual panel, "How Neptune Works" (Observe → Diagnose → Act → Measure → Learn, matching the PRD's closed loop exactly), "What You Can Do" feature cards, testimonial, Platform Coverage (ChatGPT live in MVP, other engines "Coming Soon" — matches Section 6 Non-MVP scope), CTA band, FAQ, footer.
- **Motion**: the hero and key transition points should use 3D/motion graphics — implemented with Framer Motion (React) — e.g. layered parallax on the illustrated scene, animated entrance of the floating UI cards ("ChatGPT Mentions your brand," "Brand Visibility ↑112%"), animated chart line draw-in on the embedded dashboard preview, subtle 3D tilt/depth on scroll. Keep animations performant (respect `prefers-reduced-motion`) and don't block Core Web Vitals — see `seo.md` Step 8 (Page Speed Basics).

**Technical**:
- Framer Motion (`motion` npm package) for all animated/3D-feel interactions, both here and in the dashboard (Feature 4.2)
- Static/marketing pages can stay mostly server-rendered (Next.js Server Components) with motion applied client-side via `'use client'` islands, to avoid dragging animation JS into every route

---

## 6. Non-MVP (Future Phases)

### Out of Scope for MVP:
- Engines beyond Grok and ChatGPT (Perplexity, Claude, Gemini, Google, Bing) → Phase 2
- Automated entity/knowledge graph → Phase 2
- ML-based recommendation generation → Phase 2
- Automated implementation (API-driven content changes) → Phase 2
- Integration with CMS/API for direct publishing → Phase 3
- Predictive impact scoring → Phase 3
- Compliance/privacy features (SOC 2, GDPR) → Phase 3
- Advanced segmentation (by vertical, audience, stage) → Phase 3
- **Self-serve payment gateway / checkout flow** → GTM (Section 10) is sales-led at MVP prices ($3-15K/month, demo → paid trial, manual invoicing); no in-app billing needed until a self-serve/lower-priced tier is introduced. `payment_gatway_setup.md` is a ready-to-run template for that later phase, not part of MVP build order.

---

## 7. Success Metrics & KPIs

### Product Metrics (What We Measure)
| Metric | Target (MVP) | Definition |
|--------|--------------|------------|
| Time to First Insight | <15 min | Time from onboarding to first gap identified |
| Gap Detection Accuracy | >85% | % of identified gaps confirmed by customer as real |
| Action Implementation Rate | >60% | % of recommended actions actually implemented by customer |
| Visibility Improvement | >25% | Average lift in brand citations/recommendations after implementation |
| Confidence Interval | >80% | Statistical confidence in before/after measurement |

### Business Metrics (Why It Matters)
| Metric | Target | Definition |
|--------|--------|------------|
| Customer Onboarding NPS | >40 | Net Promoter Score for onboarding experience |
| First Action-to-ROI Time | <4 weeks | Time from recommendation approval to measurable visibility lift |
| Customer Satisfaction | >80 Net Sentiment | % of customers who report "high value" |
| Retention (3-month) | >70% | % of customers retained after first quarter |

---

## 8. User Stories & Use Cases

### Use Case 1: SaaS Company Losing Leads to Competitor
**Persona**: Sarah Chen, VP of Growth

**Scenario**:
- Acme (project management tool) ranks #2 on Google for "best project management tool for remote teams"
- But when prospects ask ChatGPT the same question, it recommends Monday.com, Asana, and ClickUp—never Acme
- Lost ~5 leads/month to this (at $5K CAC = $25K/month revenue leak)

**Neptune Journey**:
1. Onboards in 5 minutes (domain, competitors)
2. Gets analysis in 15 minutes: "You rank well on Google but zero AI citations on project management use cases"
3. Sees gap: "Monday.com cited for remote team features; you don't have dedicated content on this"
4. Neptune recommends: "Create blog post: 'Acme for Remote Team Management: ROI Case Study'"
5. Sarah approves; team publishes in 1 week
6. Neptune re-measures after 2 weeks: "Brand citations +300%, recommendations +200%"
7. Sarah measures pipeline impact: +8 leads → +$40K MRR revenue

**Key Moment**: Neptune shows causal link (content change → visibility improvement → revenue), justifying budget spend.

---

### Use Case 2: B2B Fintech Losing Thought Leadership
**Persona**: Marcus Rodriguez, Head of Marketing

**Scenario**:
- TrustBank (fintech) publishes whitepapers but doesn't appear in AI answers on "modern banking infrastructure"
- Competitors (Stripe, Plaid) get cited as authorities
- TrustBank isn't losing direct customers (B2B2B model) but losing brand credibility

**Neptune Journey**:
1. Identifies gap: "Stripe cited 12x on banking infrastructure; you cited 0x"
2. Recommends: "Improve content authority—add third-party research, case studies from Gartner"
3. Marcus implements: Publishes "2024 Banking Infrastructure Benchmark" (original research)
4. Neptune re-measures: "Citations +500%, included in 'Top Sources' for banking infrastructure"
5. Result: Brand visibility in AI mentions increases; improves inbound for thought leadership partnerships

**Key Moment**: Neptune shows that original research (not just content) drives AI authority.

---

### Use Case 3: E-commerce Platform Losing Discovery
**Persona**: James Patterson, Content Strategy Lead

**Scenario**:
- OnlineStore (e-commerce platform) has good SEO but weak AI visibility for "best e-commerce platform for small businesses"
- Shopify, WooCommerce mentioned in AI answers; OnlineStore isn't
- Losing affiliate/marketplace partnerships due to low brand visibility in AI

**Neptune Journey**:
1. Gap identified: "You have FAQ page but it's not optimized for AI—lacks specific data (ROI, implementation time)"
2. Recommends: "Rewrite FAQ to include concrete metrics: 'Setup in 24 hours, 40% lower monthly cost than Shopify'"
3. James implements: Updates FAQ with data-driven claims
4. Neptune re-measures: "FAQ cited 6x in AI answers; brand recommendations +150%"
5. Result: Better positioning in AI conversations; attracts more partnership inquiries

**Key Moment**: Neptune shows that *how* you write content (data-driven) matters as much as *what* you write.

---

## 9. Technical Architecture (MVP)

> **This section is a summary only.** The authoritative tech stack, project structure, database schema (SQL + RLS policies), and API surface live in `archicture.md`. The team moved off the original Python/FastAPI draft to Next.js + Supabase early on (see `archicture.md` Section 16, Decision Log) — this section was rewritten to match so the two documents no longer contradict each other. Always build against `archicture.md` for exact schema/endpoint contracts; treat the tables below as a quick-reference summary, not the source of truth.

### Tech Stack (summary — see `archicture.md` Section 3 for full rationale)
| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Motion/Animation | Framer Motion (`motion` npm package) — 3D-feel hero/marketing animation (Feature 4.3) and in-app micro-interactions (Feature 4.2) |
| Database | Supabase Postgres (with Row Level Security) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Long-running/scheduled logic | Supabase Edge Functions (Deno) |
| Scheduling | pg_cron (Supabase) |
| AI Integration | `openai` npm SDK against OpenAI-compatible APIs: Grok (xAI) now, ChatGPT (OpenAI) when its key is set |
| File Storage | Supabase Storage |
| Realtime Updates | Supabase Realtime |
| Email | Resend |
| Monitoring | Sentry |
| Hosting | Vercel (frontend) + Supabase Cloud (backend) |
| CI/CD | GitHub Actions + Vercel Git integration |

### Project Structure, Data Models, and API Surface
See `archicture.md`:
- **Section 4** — full project directory layout (`apps/web/`, `supabase/functions/`, one Edge Function per PRD feature)
- **Section 5** — complete Postgres schema (`companies`, `competitors`, `prompts`, `responses`, `citations`, `gaps`, `recommendations`, `measurement_runs`) plus RLS policies
- **Section 7** — Edge Function responsibilities, mapped 1:1 to PRD Features 1.1–3.1
- **Section 11** — API surface (Server Actions + Route Handlers); most dashboard reads go directly through the Supabase client in Server Components rather than custom REST routes, since RLS already enforces access control

**Why this split matters for Claude Code:** each Edge Function in `supabase/functions/` maps 1:1 to a PRD feature (`generate-prompts` → 1.1, `run-engine-batch` → 1.2, etc.), so you can prompt Claude Code with "implement `generate-prompts` per Feature 1.1 in PRD.md, using the schema in archicture.md Section 5" and it has a clear, isolated target.

---

## 10. Go-to-Market Strategy

### Launch Approach
1. **Beta Launch**: 3-5 customers in single vertical (SaaS) with hands-on onboarding
2. **Feedback Loop**: Weekly calls to validate gap detection accuracy + action impact
3. **Iterate**: Fix parsing errors, improve recommendation quality
4. **Public Launch**: Blog post + ProductHunt after 10+ customers with positive ROI stories

### Pricing (Post-MVP)
- **Starter**: $3K/month (1 vertical, monthly measurement)
- **Pro**: $8K/month (all verticals, weekly measurement, Slack integration)
- **Enterprise**: Custom (multi-engine, API access, white-label)

### Sales Motion
- Bottom-up: Free audit (run analysis, show gaps, no action recommendations) → Demo → Paid trial
- Top-down: Outreach to CMOs/Growth VPs of $5-20M ARR SaaS companies with 3+ competitors

---

## 11. Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **AI Engine API Costs Scale** | High | Implement caching, use cheaper model tiers, set monthly limits per provider, batch requests; each active engine adds ~50 calls per round |
| **Citation Extraction Accuracy <85%** | High | Start with manual labeling (100 responses), build rules incrementally, flag low-confidence |
| **Causation Hard to Prove** | High | Use statistical significance testing, control groups, longer measurement windows (3-4 weeks) |
| **Prompt Drift Over Time** | Medium | Store all prompts immutably, version control, re-run exact same prompts |
| **Customer Data Privacy** | High | Encrypt sensitive data, don't store full responses long-term, GDPR/CCPA compliance roadmap |
| **Competitor Copy Feature** | Medium | Defensibility through data quality, network effects, integrations; lead on multi-engine |

---

## 12. Build Plan (Claude Code Session Phases)

Each phase below is scoped to be a self-contained Claude Code session with a working, testable output. Don't skip ahead — each phase depends on the data models from the previous one.

| Phase | Goal | Maps to PRD Section | Definition of Done |
|-------|------|---------------------|---------------------|
| **Phase 0: Scaffold** | Next.js app + Supabase project connection | Section 9, 13; `archicture.md` Section 4, 13 | `next dev` runs locally, Supabase client connects (local or hosted project), a protected route redirects unauthenticated users |
| **Phase 1: Data Models** | Create all core tables + RLS policies | `archicture.md` Section 5 | `supabase db push` applies migrations clean; can insert/query a `companies` row as an authenticated test user; a second test user cannot see it (RLS verified) |
| **Phase 2: Onboarding** | Company profile form + Server Action | Feature 4.1 | Can submit company + competitors via UI, row appears in DB under the correct `owner_id` |
| **Phase 3: Prompt Generation** | `generate-prompts` Edge Function | Feature 1.1 | Given a company, returns categorized prompt list saved to `prompts` table |
| **Phase 4: AI Engine Runner** | `run-engine-batch` Edge Function | Feature 1.2 | Batch-runs all prompts for a company through every active engine (Grok now, ChatGPT when keyed) (batched per `archicture.md` Section 7), stores full response text in `responses` |
| **Phase 5: Citation Extraction** | `extract-citations` Edge Function | Feature 1.3 | Given raw response, extracts domain/brand/context into `citations` rows |
| **Phase 6: Competitor Analysis** | `analyze-competitors` Edge Function | Feature 1.4 | Returns citation count / recommendation rate per competitor |
| **Phase 7: Gap Analyzer** | `analyze-gaps` Edge Function | Feature 1.5 | Given manual Google rank input, flags gap types with priority score in `gaps` table |
| **Phase 8: Recommendations Engine** | `generate-recommendations` Edge Function | Feature 2.1 | Gap → recommendation with impact estimate, stored in `recommendations` with approve/reject state |
| **Phase 9: Dashboard UI** | Overview, Gaps, Recommendations, Results tabs | Feature 4.2 | Customer can log in and see live data for their company, gated by RLS |
| **Phase 10: Measurement Loop** | `run-measurement` Edge Function + pg_cron trigger | Feature 3.1, 3.2 | Given two measurement rounds, returns before/after diff + % change |
| **Phase 11: QA Pass** | End-to-end test with one real company | — | Full loop works: onboard → analyze → recommend → implement (manual) → re-measure |

**Prompting tip:** at the start of each phase, tell Claude Code explicitly which phase you're on and paste the "Definition of Done" — it gives the agent a concrete stop condition instead of over-building.

---

## 13. Environment & Setup

> Full setup commands, environment variable lists, and deployment environments live in `archicture.md` Section 13. Summary below; when the two differ, `archicture.md` wins.

### Required API Keys / Accounts
| Service | Used For | Get It From |
|---------|----------|--------------|
| xAI API Key | Grok prompt runs (Feature 1.2), current engine | console.x.ai |
| OpenAI API Key | ChatGPT prompt runs (Feature 1.2), optional until ChatGPT goes live | platform.openai.com |
| Supabase project (URL, anon key, service_role key) | Database, Auth, Edge Functions, Storage, Realtime | supabase.com |
| Resend API key | Transactional email | resend.com |
| Sentry DSN (optional, post-Phase 9) | Error monitoring | sentry.io |

### `.env.local` (Next.js — `apps/web/`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only, never NEXT_PUBLIC_
```

### Supabase Edge Function secrets (set via `supabase secrets set`)
```
XAI_API_KEY=                      # Grok — active when set (current engine)
XAI_MODEL=grok-4.3                # optional; grok-4.7 is the flagship
OPENAI_API_KEY=                   # ChatGPT — switches on automatically when set
OPENAI_MODEL=gpt-4-turbo
RESEND_API_KEY=
SLACK_WEBHOOK_URL=
```

### Local Dev Bootstrap (first Claude Code session)
```bash
# Supabase (DB, Auth, Storage, Edge Functions)
supabase init
supabase start                    # Spins up local Postgres, Auth, Storage via Docker
supabase db push                  # Apply migrations
supabase functions serve          # Run Edge Functions locally

# Frontend
cd apps/web
npm install
npm run dev
```

### Cost Guardrails (Important for Solo/Indie Builds)
- Cap usage with a monthly budget alert in the xAI console (and OpenAI dashboard once ChatGPT is on) before Phase 4
- Use `grok-4.3` (and `gpt-4-turbo` not `gpt-4`) for cost control during dev/testing
- Cache prompt responses in dev so you're not re-calling the API every time you test parsing logic (Phase 5) — this alone can cut dev-time API costs by 80%+

---

## 14. Appendix

### Glossary
- **AI Visibility**: How often a brand appears in AI-generated answers vs. competitors
- **Citation**: A source/domain mentioned in an AI response
- **Gap**: A mismatch between SEO ranking and AI visibility (e.g., rank well on Google, absent from AI)
- **Prompt**: A customer-intent query run against ChatGPT to test visibility
- **Recommendation**: An actionable suggestion to improve content/authority

### Assumptions
1. Companies will implement recommendations within 2 weeks
2. Citation extraction accuracy can reach 85%+ with manual validation
3. Visibility improvements correlate with AI mention volume (not all mentions convert to customers)
4. Market willing to pay $5-15K/month for actionable AI visibility insights

### Open Questions (For Customer Validation)
1. How long should re-measurement window be? (2 weeks? 4 weeks?)
2. Which content types drive AI visibility most? (FAQs, case studies, research, reviews?)
3. How many competitors should we track by default? (2? 5? unlimited?)
4. Would automated implementation (API pushes) be valuable? (Or too risky?)

---

**Document Status**: Ready for engineering kickoff  
**Next Step**: Customer validation interviews (3-5 SaaS CMOs/Growth leads)