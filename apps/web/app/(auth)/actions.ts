"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; /** Email that still needs confirming (offer a resend). */ unconfirmed?: string };

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/overview";
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    return { error: "Please confirm your email first — check your inbox (and spam) for the link from Neptune.", unconfirmed: email };
  }
  if (error) return { error: "Invalid email or password." };

  redirect(safeNext(formData.get("next")));
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { error: error.message };

  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }
  redirect("/onboarding");
}

export async function resendConfirmation(email: string): Promise<AuthState> {
  const clean = String(email).trim().slice(0, 254);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { error: "Enter a valid email." };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  // Supabase rate-limits resends per address, so this can't be used to flood an inbox.
  const { error } = await supabase.auth.resend({ type: "signup", email: clean, options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` } });
  if (error) return { error: /rate|seconds/i.test(error.message) ? "Please wait a minute before requesting another email." : "Couldn't resend the email. Please try again shortly." };
  return { message: "Confirmation email sent — check your inbox (and spam)." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
