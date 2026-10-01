import OpenAI from "npm:openai@4";

type Msg = { role: "system" | "user"; content: string };

let client: OpenAI | null = null;

// SDK retries 429/5xx twice with backoff by default.
export async function ask(messages: Msg[], json = false): Promise<{ text: string; model: string }> {
  client ??= new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
  const r = await client.chat.completions.create({
    model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4-turbo",
    messages,
    temperature: json ? 0.7 : 0.2,
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  return { text: r.choices[0]?.message?.content ?? "", model: r.model };
}
