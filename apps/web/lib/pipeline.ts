import "server-only";

type Step = "generate-prompts" | "run-chatgpt-batch" | "analyze-gaps" | "run-measurement";

// Kicks off a Supabase Edge Function pipeline step; it replies 202 and works in the background.
export async function runPipeline(step: Step, body: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.PIPELINE_SECRET;
  if (!url || !secret) throw new Error("Pipeline not configured: set PIPELINE_SECRET in apps/web/.env.local");

  const res = await fetch(`${url}/functions/v1/${step}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Pipeline step ${step} failed with HTTP ${res.status}`);
}
