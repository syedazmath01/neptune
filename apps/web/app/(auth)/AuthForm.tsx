"use client";

import { useActionState, useId, useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { login, resendConfirmation, signup, type AuthState } from "./actions";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? login : signup,
    {},
  );

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/overview")}`,
      },
    });
  }

  const input =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md glass rounded-3xl p-8"
    >
      <h1 className="font-display text-3xl text-forest-800">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Sign in to see how your brand shows up in AI answers."
          : "Start tracking your brand's visibility in AI answers."}
      </p>

      {/* Shown only once the Google provider is enabled in Supabase Auth. */}
      {process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true" ? (
        <>
          <button
            type="button"
            onClick={google}
            className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 font-medium text-ink transition hover:bg-cream-100"
          >
            Continue with Google
          </button>
          <div className="my-6 flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : (
        <div className="mt-6" />
      )}

      <form action={action} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Full name</span>
            <input name="full_name" autoComplete="name" className={input} />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Work email</span>
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <PasswordField mode={mode} className={input} />

        {state.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
        {state.unconfirmed && <ResendConfirmation email={state.unconfirmed} />}
        {state.message && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{state.message}</p>}

        <button
          disabled={pending}
          className="min-h-11 w-full rounded-xl bg-forest-700 px-4 py-3 font-semibold text-cream-50 transition hover:bg-forest-800 disabled:opacity-60"
        >
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        {mode === "signup" && (
          <p className="text-center text-xs text-muted">
            By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>New to Neptune? <Link href="/signup" className="font-semibold text-forest-700">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="font-semibold text-forest-700">Sign in</Link></>
        )}
      </p>
    </motion.div>
  );
}

function PasswordField({ mode, className }: { mode: "login" | "signup"; className: string }) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">Password</label>
      <div className="relative">
        <input
          id={id}
          name="password"
          type={show ? "text" : "password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={`${className} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-muted hover:text-ink"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {mode === "signup" && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}
    </div>
  );
}

function ResendConfirmation({ email }: { email: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<AuthState>({});
  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await resendConfirmation(email)))}
        className="min-h-11 text-sm font-semibold text-forest-700 underline disabled:opacity-60"
      >
        {pending ? "Sending…" : "Resend confirmation email"}
      </button>
      {result.error && <p className="text-sm text-danger">{result.error}</p>}
      {result.message && <p className="text-sm text-success">{result.message}</p>}
    </div>
  );
}
