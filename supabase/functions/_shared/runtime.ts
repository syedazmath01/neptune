// Shared Edge Function plumbing: auth, admin client, background work, step chaining.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { Brand } from "./types.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

export type Body = Record<string, unknown>;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function db(): SupabaseClient {
  // service_role: pipeline writes bypass RLS; this client never leaves the server.
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

// Dedicated machine-to-machine secret (verify_jwt is off for these functions).
function authorized(req: Request): boolean {
  const secret = Deno.env.get("PIPELINE_SECRET") ?? "";
  const given = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (secret.length < 32 || given.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= secret.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

export function chain(fn: string, body: Body): Promise<void> {
  return fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/${fn}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("PIPELINE_SECRET")}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((r) => {
      if (!r.ok) console.error(`chain ${fn} -> HTTP ${r.status}`);
    })
    .catch((e) => console.error(`chain ${fn} failed:`, e instanceof Error ? e.message : e));
}

async function markFailed(companyId: string, round: number) {
  await db().from("measurement_runs").update({ status: "failed" }).eq("company_id", companyId).eq("round_number", round);
}

/** Validate + accept the request (202), then do the work in the background. */
export function pipelineStep(name: string, handler: (body: Body) => Promise<void>) {
  Deno.serve(async (req) => {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
    if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

    let body: Body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    if (body.company_id !== undefined && !UUID_RE.test(String(body.company_id))) return new Response("Invalid company_id", { status: 400 });
    if (body.round !== undefined && !(Number.isInteger(body.round) && (body.round as number) > 0)) return new Response("Invalid round", { status: 400 });

    const work = handler(body).catch(async (e) => {
      console.error(`[${name}]`, e instanceof Error ? e.message : e);
      if (typeof body.company_id === "string" && typeof body.round === "number") await markFailed(body.company_id, body.round);
    });
    EdgeRuntime.waitUntil(work);
    return Response.json({ accepted: true }, { status: 202 });
  });
}

export function must<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data === null) throw new Error(`${what}: not found`);
  return res.data;
}

export async function loadBrands(sb: SupabaseClient, companyId: string) {
  const company = must(
    await sb.from("companies").select("name, domain, competitors(name, domain)").eq("id", companyId).single(),
    "load company",
  ) as { name: string; domain: string; competitors: { name: string; domain: string }[] };
  const brands: Brand[] = [
    { name: company.name, domain: company.domain, kind: "own_company" },
    ...company.competitors.map((c) => ({ ...c, kind: "competitor" as const })),
  ];
  return { name: company.name, domain: company.domain, brands };
}

type RoundCitation = { prompt_id: string; domain: string; url: string | null; entity_type: string; context: string | null; brand_mentioned: string | null };

// ponytail: relies on PostgREST's 1000-row default; paginate if a round ever exceeds ~150 prompts.
export async function roundCitations(sb: SupabaseClient, companyId: string, round: number): Promise<RoundCitation[]> {
  const rows = must(
    await sb
      .from("citations")
      .select("domain, url, entity_type, context, brand_mentioned, responses!inner(prompt_id, measurement_round, prompts!inner(company_id))")
      .eq("responses.measurement_round", round)
      .eq("responses.prompts.company_id", companyId),
    "load citations",
  ) as unknown as (Omit<RoundCitation, "prompt_id"> & { responses: { prompt_id: string } })[];
  return rows.map(({ responses, ...c }) => ({ ...c, prompt_id: responses.prompt_id }));
}
