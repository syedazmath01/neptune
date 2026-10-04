import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Sign in", alternates: { canonical: "/login" } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirmed?: string; error?: string }>;
}) {
  const { next, confirmed, error } = await searchParams;
  const notice = confirmed
    ? "Your email is confirmed. Sign in to continue."
    : error === "auth"
      ? "That sign-in link has expired or was already used. Sign in below, or request a new confirmation email."
      : undefined;
  return <AuthForm mode="login" next={next} notice={notice} />;
}
