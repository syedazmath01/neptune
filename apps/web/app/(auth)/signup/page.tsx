import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Create account", alternates: { canonical: "/signup" } };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
