import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/ui";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const company = await requireCompany();
  const supabase = await createClient();
  const { data: competitors } = await supabase
    .from("competitors")
    .select("id, name, domain")
    .eq("company_id", company.id)
    .order("created_at");

  return (
    <>
      <PageHeader title="Settings" />
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Company</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div><dt className="text-sm text-muted">Name</dt><dd className="font-medium">{company.name}</dd></div>
          <div><dt className="text-sm text-muted">Domain</dt><dd className="font-medium">{company.domain}</dd></div>
          <div><dt className="text-sm text-muted">Industry</dt><dd className="font-medium capitalize">{company.industry.replace("_", " ")}</dd></div>
        </dl>
      </section>
      <section className="mt-6 glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Tracked competitors</h2>
        <ul className="mt-4 divide-y divide-line">
          {competitors?.map((c) => (
            <li key={c.id} className="flex justify-between py-3">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted">{c.domain}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
