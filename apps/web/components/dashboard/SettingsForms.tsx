"use client";

import { useActionState } from "react";
import { addCompetitor, removeCompetitor, updateCompany, type SettingsState } from "@/lib/actions/settings";
import { DOMAIN_PATTERN } from "@/lib/domain";

const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20";
const primary = "min-h-11 rounded-full bg-forest-800 px-6 font-semibold text-cream-50 transition hover:bg-forest-700 disabled:opacity-60";

function Feedback({ state }: { state: SettingsState }) {
  if (state.error) return <p className="text-sm text-danger" role="alert">{state.error}</p>;
  if (state.message) return <p className="text-sm text-success" role="status">{state.message}</p>;
  return null;
}

type Company = { name: string; domain: string; industry: string; products_services: string[] | null; business_goals: string | null };

export function CompanyForm({ company }: { company: Company }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateCompany, {});

  return (
    <form action={action} className="glass mt-6 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-ink">Company</h2>
      <p className="mt-1 text-sm text-muted">What Neptune analyzes. Changes apply from your next analysis.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Company name</span>
          <input name="name" required maxLength={120} defaultValue={company.name} className={input} />
          <span className="mt-1 block text-xs text-muted">Use the name people write in reviews and AI answers.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Website</span>
          <input name="domain" required defaultValue={company.domain} pattern={DOMAIN_PATTERN} title="Enter your website address, e.g. acme.com" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Industry</span>
          <select name="industry" defaultValue={company.industry} className={input}>
            <option value="saas">SaaS</option>
            <option value="professional_services">Professional Services</option>
            <option value="ecommerce">E-commerce</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Main product or service</span>
          <textarea name="product" rows={3} maxLength={1000} defaultValue={company.products_services?.[0] ?? ""} className={input} />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-medium">Goals and pain points</span>
          <textarea name="goals" rows={2} maxLength={1200} defaultValue={company.business_goals ?? ""} className={input} />
          <span className="mt-1 block text-xs text-muted">Neptune uses this to choose which customer questions to ask.</span>
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={pending} className={primary}>{pending ? "Saving…" : "Save changes"}</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function CompetitorsEditor({ competitors }: { competitors: { id: string; name: string; domain: string }[] }) {
  const [added, addAction, adding] = useActionState<SettingsState, FormData>(addCompetitor, {});
  const [removed, removeAction, removing] = useActionState<SettingsState, FormData>(removeCompetitor, {});
  const atMin = competitors.length <= 2;

  return (
    <section className="glass mt-6 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-ink">Tracked competitors</h2>
      <p className="mt-1 text-sm text-muted">
        Neptune checks whether AI recommends these companies instead of you. Use the brand name people actually write — e.g. &ldquo;SE Ranking&rdquo;, not
        &ldquo;Seranking&rdquo; — because that&apos;s what Neptune looks for in answers. Track 2–5.
      </p>

      <ul className="mt-4 divide-y divide-line">
        {competitors.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span>
              <span className="font-medium text-ink">{c.name}</span> <span className="text-muted">· {c.domain}</span>
            </span>
            <form action={removeAction}>
              <input type="hidden" name="id" value={c.id} />
              <button
                disabled={removing || atMin}
                title={atMin ? "Keep at least 2 competitors" : undefined}
                className="min-h-11 rounded-full px-4 text-sm font-semibold text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      <Feedback state={removed} />

      {competitors.length < 5 ? (
        <form action={addAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input name="name" maxLength={80} placeholder="Brand name, e.g. SE Ranking" aria-label="Competitor brand name" className={input} />
          <input
            name="domain"
            required
            pattern={DOMAIN_PATTERN}
            title="Enter the competitor's website address, e.g. seranking.com"
            placeholder="Website, e.g. seranking.com"
            aria-label="Competitor website"
            className={input}
          />
          <button disabled={adding} className={primary}>{adding ? "Adding…" : "Add"}</button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-muted">You&apos;re tracking the maximum of 5 competitors. Remove one to add another.</p>
      )}
      <div className="mt-2"><Feedback state={added} /></div>
      <p className="mt-3 text-xs text-muted">To fix a competitor&apos;s name, remove it and add it again with the right name.</p>
    </section>
  );
}
