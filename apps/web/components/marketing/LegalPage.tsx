import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { CONTACT_EMAIL } from "@/lib/site";

/** Shared shell for the privacy and terms pages. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream-50">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 md:px-8">
          <BrandLockup />
          <Link href="/" className="py-2 text-sm font-medium text-forest-700">← Back to home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <h1 className="font-display text-4xl text-forest-800">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
        <article className="legal mt-8 space-y-4 text-ink/90">{children}</article>
        <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
          Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-forest-700 underline">{CONTACT_EMAIL}</a>.
        </p>
      </main>
    </div>
  );
}
