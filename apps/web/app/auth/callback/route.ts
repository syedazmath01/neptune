import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/overview";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    // Supabase only issues a code after the email link verified, so the account is confirmed.
    // The exchange fails when the link is opened in another browser/device (no PKCE verifier there).
    return NextResponse.redirect(`${origin}/login?confirmed=1&next=${encodeURIComponent(next)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
