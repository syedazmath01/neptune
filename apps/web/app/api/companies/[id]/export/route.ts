import { createClient } from "@/lib/supabase/server";
import { loadBreakdown, loadRuns } from "@/lib/insights";

// Neutralise spreadsheet formula injection (AI answers and prompts are untrusted text).
function cell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // RLS: returns nothing unless the caller owns this company.
  const { data: company } = await supabase.from("companies").select("id, domain").eq("id", id).maybeSingle();
  if (!company) return new Response("Not found", { status: 404 });

  const last = (await loadRuns(supabase, company.id)).filter((r) => r.status === "completed").at(-1);
  if (!last) return new Response("No completed analysis yet", { status: 404 });

  const rows = await loadBreakdown(supabase, company.id, last.round_number);
  const csv = [
    ["Prompt", "Category", "Google rank", "You mentioned", "You recommended", "Competitors recommended", "Brands in answer"],
    ...rows.map((p) => [
      p.text,
      p.category,
      p.google_rank,
      p.youMentioned ? "yes" : "no",
      p.youRecommended ? "yes" : "no",
      p.competitorsRecommended.join("; "),
      p.cited.map((c) => `${c.name} (${c.context})`).join("; "),
    ]),
  ]
    .map((r) => r.map(cell).join(","))
    .join("\r\n");

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="neptune-${company.domain}-round-${last.round_number}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
