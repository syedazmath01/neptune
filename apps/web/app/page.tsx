import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChartColumn,
  ChevronDown,
  CircleCheck,
  FileSearch,
  Lightbulb,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { HeroScene } from "@/components/marketing/HeroScene";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { Faq } from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/Reveal";
import { ResourcesMenu } from "@/components/marketing/ResourcesMenu";
import { Fireflies } from "@/components/marketing/Fireflies";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { MobileMenu } from "@/components/marketing/MobileMenu";

const NAV = [["Home", "#"], ["Product", "#product"], ["Pricing", "#pricing"], ["Roadmap", "#roadmap"]] as const;

const VALUE_PROPS = [
  [MessageSquareText, "AI Answer Tracking", "See how your brand appears in ChatGPT."],
  [ChartColumn, "Actionable Insights", "Find opportunities to improve visibility."],
  [Users, "Built for Growth Teams", "Designed for founders, marketers and product teams."],
] as const;

const STEPS = [
  [Search, "Observe", "Track your brand across AI answers."],
  [FileSearch, "Diagnose", "Find gaps and opportunities."],
  [Sparkles, "Act", "Get clear recommendations."],
  [ChartColumn, "Measure", "Track progress over time."],
  [TrendingUp, "Grow", "Increase visibility and drive real results."],
] as const;

const FEATURES = [
  [MessageSquareText, "Track Brand Mentions", "See where and how your brand appears in ChatGPT answers.", "bg-forest-500/10 text-forest-700"],
  [Lightbulb, "Discover Opportunities", "Find high-intent questions where you can show up.", "bg-terracotta-400/15 text-terracotta-500"],
  [Users, "Analyze Competitors", "See what's working for your competitors.", "bg-teal-600/10 text-teal-700"],
  [Sparkles, "Get Actionable Recommendations", "Receive clear next steps to improve visibility.", "bg-terracotta-400/15 text-terracotta-500"],
] as const;

const ROADMAP = [
  ["Now", "Live in MVP", ["ChatGPT answer tracking", "Competitor & citation analysis", "Visibility gap detection", "Evidence-backed recommendations", "Before/after measurement"], "bg-success/15 text-success"],
  ["Next", "Planned", ["Perplexity, Claude & Gemini tracking", "Google AI Overviews", "Entity & knowledge-graph analysis"], "bg-terracotta-400/15 text-terracotta-600"],
  ["Later", "Exploring", ["CMS integrations for direct publishing", "Predictive impact scoring", "SOC 2 & GDPR compliance"], "bg-cream-200 text-muted"],
] as const;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "99sols.ai", url: SITE_URL, logo: `${SITE_URL}/brand/icon-512.png` },
    { "@type": "WebSite", name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#org` } },
    {
      "@type": "SoftwareApplication",
      name: "Neptune",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free during early access" },
    },
  ],
};

const deco = "art pointer-events-none absolute select-none hidden md:block";

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <Fireflies />
      <header className="sticky top-0 z-40 border-b border-white/50 bg-cream-50/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 md:px-8">
          <BrandLockup />
          <ul className="hidden items-center gap-8 text-[15px] font-medium text-ink lg:flex">
            {NAV.map(([label, href], i) => (
              <li key={label}>
                <a href={href} className="relative py-2">
                  {label}
                  {i === 0 && <span className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-terracotta-500" />}
                </a>
              </li>
            ))}
            <ResourcesMenu />
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden min-h-11 items-center px-3 font-medium sm:flex">Log in</Link>
            <Link href="/signup" className="hidden min-h-11 items-center gap-1.5 rounded-full bg-forest-800 px-5 font-semibold text-cream-50 hover:bg-forest-700 sm:flex">
              Start Free <ArrowRight size={16} />
            </Link>
            <MobileMenu />
          </div>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="relative">
          <Image src="/art/leaf-hero-left.png" alt="" width={152} height={848} className={`${deco} fade-l left-0 top-0 h-full w-auto`} />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:pl-24">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest-800">AI SEO Platform</p>
              <h1 className="mt-5 font-display text-[clamp(2.4rem,4.2vw,3.6rem)] font-semibold leading-[1.02] text-forest-800">
                Turn<br />Search&nbsp;Visibility<br />into <span className="text-terracotta-500">Growth.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-ink/80">
                Track, analyze, and optimize your brand&apos;s presence in AI answers, starting with ChatGPT.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-800 px-7 font-semibold text-cream-50 hover:bg-forest-700">
                  Start Free <ArrowRight size={17} />
                </Link>
                <a href="#how" className="glass flex min-h-12 items-center justify-center gap-2 rounded-full px-7 font-semibold text-ink">
                  See How It Works <ChevronDown size={18} />
                </a>
              </div>
              <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest-500/10 px-4 py-2 text-sm font-medium text-forest-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Now in early access · ChatGPT tracking live
              </p>
            </Reveal>
            <HeroScene />
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="relative z-10 mx-auto mt-8 max-w-7xl px-4 md:px-8">
          <div className="glass grid gap-6 rounded-2xl px-6 py-5 md:grid-cols-3 md:divide-x md:divide-line">
            {VALUE_PROPS.map(([Icon, title, body]) => (
              <div key={title} className="flex items-center gap-4 md:px-6 first:md:pl-0">
                <Icon size={30} strokeWidth={1.6} className="shrink-0 text-forest-800" />
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCT VISUAL */}
        <section id="product" className="relative mt-16 py-16">
          <Image src="/art/leaf-s2-left.png" alt="" width={116} height={430} className={`${deco} fade-l left-0 top-0 w-[7vw] max-w-[116px]`} />
          <Image src="/art/village-s2.png" alt="" width={636} height={122} className={`${deco} fade-t bottom-0 left-0 w-[36vw] max-w-[636px]`} />
          <Image src="/art/leaf-s2-right.png" alt="" width={124} height={596} className={`${deco} fade-r right-0 top-0 h-full w-auto`} />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:pl-24">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,3.3vw,3rem)] font-semibold leading-[1.08] text-forest-800">
                Your Brand<br />in AI Answers.<br /><span className="text-terracotta-500">Clearly&nbsp;Visualized.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg text-ink/80">
                See exactly how your brand is mentioned in ChatGPT, what questions drive visibility, and where you can improve — all in one place.
              </p>
              <Link href="/signup" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-800 px-7 font-semibold text-cream-50 hover:bg-forest-700">
                Start Free <ArrowRight size={17} />
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="relative py-16">
          <Image src="/art/village-s3.png" alt="" width={184} height={316} className={`${deco} fade-l left-0 top-4 w-[7vw] max-w-[184px]`} />
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:pl-24">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold text-forest-800">How Neptune Works</h2>
            </Reveal>
            <div className="relative mt-10">
              <svg className="absolute left-0 top-7 hidden h-8 w-full lg:block" viewBox="0 0 1000 30" preserveAspectRatio="none" aria-hidden>
                <path d="M40,15 C140,-5 180,35 240,15 S380,-5 440,15 S580,35 640,15 S780,-5 840,15 S940,30 980,15" fill="none" stroke="#1d5244" strokeOpacity="0.35" strokeWidth="1.5" />
              </svg>
              <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {STEPS.map(([Icon, title, body], i) => (
                  <Reveal key={title} delay={i * 0.08}>
                    <li className="flex flex-col items-start lg:items-center lg:text-center">
                      <span className="glass flex h-14 w-14 items-center justify-center rounded-full text-forest-800">
                        <Icon size={24} strokeWidth={1.7} />
                      </span>
                      <p className="mt-4 text-lg font-semibold text-ink">
                        <span className="mr-2 font-normal text-muted">0{i + 1}</span>{title}
                      </p>
                      <p className="mt-1 text-muted">{body}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* WHAT YOU CAN DO + EVIDENCE PROMISE */}
        <section className="relative py-16">
          <Image src="/art/leaf-s4-left.png" alt="" width={160} height={170} className={`${deco} fade-l bottom-0 left-0 w-24`} />
          <Image src="/art/leaf-s4-right.png" alt="" width={128} height={170} className={`${deco} fade-r bottom-0 right-0 w-20`} />
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold text-forest-800">What You Can Do</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.8fr_1fr]">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {FEATURES.map(([Icon, title, body, tone], i) => (
                  <Reveal key={title} delay={i * 0.07}>
                    <div className="glass flex h-full flex-col rounded-2xl p-5 transition hover:-translate-y-1">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon size={24} strokeWidth={1.7} /></span>
                      <h3 className="mt-5 font-semibold text-ink">{title}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted">{body}</p>
                      <Link href="/signup" aria-label={`Start with ${title}`} className="mt-4 flex h-9 w-9 items-center justify-center self-end rounded-full border border-line bg-white/70">
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2} className="relative overflow-hidden rounded-3xl bg-[url(/art/cta-sailboat.png)] bg-cover bg-center p-4 dark:bg-[#4a5a70] dark:bg-blend-multiply">
                <div className="glass flex h-full flex-col rounded-2xl bg-white/80! p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-500">Our promise</p>
                  <h3 className="mt-3 font-display text-2xl leading-snug text-ink">Every recommendation shows its evidence.</h3>
                  <ul className="mt-5 space-y-3 text-ink/85">
                    {["The exact prompt we asked ChatGPT", "The full answer it gave", "Which brands it cited — and how often"].map((t) => (
                      <li key={t} className="flex items-start gap-2.5"><CircleCheck size={19} className="mt-0.5 shrink-0 text-forest-700" /> {t}</li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-5 text-sm text-muted">No black-box scores. You see what we see.</p>
                </div>
              </Reveal>
            </div>

            {/* COVERAGE + EARLY ACCESS */}
            <div id="coverage" className="mt-5 grid gap-5 lg:grid-cols-[1.8fr_1fr]">
              <Reveal className="glass grid gap-6 rounded-2xl p-6 md:grid-cols-[0.8fr_1.2fr] md:divide-x md:divide-line">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-forest-800">Platform Coverage</h3>
                  <div className="mt-4 flex items-center gap-3">
                    <Image src="/art/chatgpt.png" alt="ChatGPT" width={94} height={86} className="h-12 w-auto rounded-xl" />
                    <div>
                      <p className="font-semibold">ChatGPT</p>
                      <p className="text-sm font-medium text-forest-600">Live in MVP</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">Track your brand visibility in ChatGPT answers now.</p>
                </div>
                <div className="md:pl-6">
                  <p className="text-sm font-medium text-forest-700">Coming Soon</p>
                  <ul className="mt-3 grid max-w-md grid-cols-3 gap-3 sm:grid-cols-6">
                    {["Google", "Perplexity", "Gemini", "YouTube", "Reddit", "LinkedIn"].map((p) => (
                      <li key={p} className="flex flex-col items-center gap-1 text-[11px] text-muted">
                        <Image src={`/art/logo-${p.toLowerCase()}.png`} alt="" width={120} height={120} className="h-12 w-12 rounded-xl shadow-sm" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">More platforms are on our roadmap. Be the first to know.</p>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="glass relative rounded-2xl bg-forest-500/10 p-6">
                <Send size={34} strokeWidth={1.5} className="absolute right-6 top-6 -rotate-12 text-forest-800" />
                <h3 className="font-display text-2xl font-semibold text-forest-800">Early Access Benefits</h3>
                <ul className="mt-4 space-y-3">
                  {["Shape the product roadmap", "Get early feature access", "Founding user pricing"].map((b) => (
                    <li key={b} className="flex items-center gap-2.5"><CircleCheck size={19} className="text-forest-700" /> {b}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ROADMAP — mirrors prd.md Section 6 */}
        <section id="roadmap" className="relative py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-semibold text-forest-800">Roadmap</h2>
              <p className="mt-2 text-muted">Where Neptune is today and what&apos;s planned next. Plans may change based on early-access feedback.</p>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {ROADMAP.map(([stage, tag, items, tone], i) => (
                <Reveal key={stage} delay={i * 0.08}>
                  <div className="glass h-full rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl font-semibold text-forest-800">{stage}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{tag}</span>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {items.map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-ink/85"><CircleCheck size={18} className="mt-0.5 shrink-0 text-forest-700" /> {it}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="relative pb-16">
          <div className="mx-auto max-w-3xl px-4 md:px-8">
            <Reveal className="glass rounded-3xl p-8 text-center md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-500">Pricing</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold text-forest-800">Free during early access</h2>
              <p className="mx-auto mt-3 max-w-xl text-muted">
                Neptune is in early access. Everything available today is free to use. Paid plans for growing teams will be announced to early-access users first.
              </p>
              <ul className="mx-auto mt-6 grid max-w-xl gap-3 text-left sm:grid-cols-2">
                {["ChatGPT visibility tracking", "Competitor & citation analysis", "Gap detection", "Evidence-backed recommendations", "Before/after measurement", "No credit card required"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5"><CircleCheck size={18} className="shrink-0 text-forest-700" /> {f}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-800 px-8 font-semibold text-cream-50 hover:bg-forest-700">
                Start Free <ArrowRight size={17} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* CTA BAND */}
        <section id="cta" className="relative mt-6 overflow-hidden bg-[#0e372d]">
          <Image src="/art/cta-lemon.png" alt="" width={290} height={234} className={`${deco} fade-l left-0 top-0 h-full w-auto`} />
          <Image src="/art/cta-sailboat.png" alt="" width={384} height={234} className={`${deco} right-0 top-0 h-full w-auto [mask-image:linear-gradient(to_right,transparent,black_30%)]`} />
          <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-14 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">From Search to AI Answers</p>
              <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-semibold text-[#fbf4e3]">Be Found Where People Ask.</h2>
              <p className="mt-2 text-[#f6ecd5]/90">Join early and start tracking your brand in ChatGPT.</p>
            </div>
            <div className="text-center">
              <Link href="/signup" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#fbf4e3] px-10 font-semibold text-[#0e372d] hover:bg-[#fffaf0]">
                Start Free <ArrowRight size={17} />
              </Link>
              <p className="mt-2 text-sm text-[#f6ecd5]/80">No credit card required.</p>
            </div>
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative py-16">
          <Image src="/art/faq-branch.png" alt="" width={190} height={374} className={`${deco} fade-l bottom-0 left-0 w-24`} />
          <Image src="/art/faq-lemons.png" alt="" width={184} height={220} className={`${deco} fade-r bottom-0 right-0 w-28`} />
          <div className="mx-auto max-w-5xl px-4 md:px-8">
            <h2 className="mb-6 font-display text-[clamp(1.8rem,3.4vw,2.5rem)] font-semibold text-forest-800">Frequently Asked Questions</h2>
            <Faq />
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-cream-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <BrandLockup />
            <p className="mt-2 text-sm text-muted">AI search visibility for the next generation of brands.</p>
          </div>
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            {[["Product", "#product"], ["Pricing", "#pricing"], ["Roadmap", "#roadmap"], ["FAQ", "#faq"]].map(([l, h]) => (
              <li key={l}><a href={h} className="py-2">{l}</a></li>
            ))}
          </ul>
          <p className="text-sm text-muted">© {new Date().getFullYear()} 99sols.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
