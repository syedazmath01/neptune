// AI answer engines. Both speak the OpenAI chat API; an engine is active when its key is set,
// so adding ChatGPT later is `supabase secrets set OPENAI_API_KEY=...` — no code change.
import OpenAI from "npm:openai@4";
import { ENGINES, type Engine } from "./types.ts";

type Msg = { role: "system" | "user"; content: string };

const CONFIG: Record<Engine, { key: string; model: string; defaultModel: string; baseURL?: string }> = {
  grok: { key: "XAI_API_KEY", model: "XAI_MODEL", defaultModel: "grok-4.3", baseURL: "https://api.x.ai/v1" },
  chatgpt: { key: "OPENAI_API_KEY", model: "OPENAI_MODEL", defaultModel: "gpt-4-turbo" },
};

const clients = new Map<Engine, OpenAI>();

export function activeEngines(): Engine[] {
  const on = ENGINES.filter((e) => Deno.env.get(CONFIG[e].key));
  if (!on.length) throw new Error("no AI engine configured: set XAI_API_KEY and/or OPENAI_API_KEY");
  return on;
}

// SDK retries 429/5xx twice with backoff by default.
export async function ask(engine: Engine, messages: Msg[], json = false): Promise<{ text: string; model: string }> {
  const c = CONFIG[engine];
  let client = clients.get(engine);
  if (!client) clients.set(engine, (client = new OpenAI({ apiKey: Deno.env.get(c.key), baseURL: c.baseURL })));
  const r = await client.chat.completions.create({
    model: Deno.env.get(c.model) ?? c.defaultModel,
    messages,
    temperature: json ? 0.7 : 0.2,
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return { text: r.choices[0]?.message?.content ?? "", model: r.model };
}
