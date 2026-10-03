import Link from "next/link";
import { ENGINE_LABEL, type Engine } from "@/lib/insights";

/** Switch which AI engine's results a page shows. Hidden until a second engine has data. */
export function EngineTabs({ engines, engine, path }: { engines: Engine[]; engine: Engine; path: string }) {
  if (engines.length < 2) return null;
  return (
    <nav aria-label="AI engine" className="glass mb-6 inline-flex rounded-full p-1 print:hidden">
      {engines.map((e) => (
        <Link
          key={e}
          href={`${path}?engine=${e}`}
          aria-current={e === engine ? "page" : undefined}
          className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold ${e === engine ? "bg-forest-600 text-cream-50" : "text-ink"}`}
        >
          {ENGINE_LABEL[e]}
        </Link>
      ))}
    </nav>
  );
}

/** Small "Grok" / "ChatGPT" chips showing which engine(s) a finding comes from. */
export function EngineChips({ engines }: { engines: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {engines.map((e) => (
        <span key={e} className="rounded-full bg-forest-500/10 px-2.5 py-1 text-xs font-semibold text-forest-700">
          {ENGINE_LABEL[e as Engine] ?? e}
        </span>
      ))}
    </span>
  );
}

/** Pill tabs that filter a page via its URL (?filter=…), so filtered views are linkable. */
export function FilterTabs({ items, label = "Filter" }: { items: { label: string; href: string; active: boolean; count?: number }[]; label?: string }) {
  return (
    <nav aria-label={label} className="mb-6 flex flex-wrap gap-2 print:hidden">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
            t.active ? "bg-forest-800 text-cream-50" : "glass text-ink hover:bg-white/70"
          }`}
        >
          {t.label}
          {t.count != null && <span className={`rounded-full px-1.5 text-xs ${t.active ? "bg-white/20" : "bg-cream-200"}`}>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
