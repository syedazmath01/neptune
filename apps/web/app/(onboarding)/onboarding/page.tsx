import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCompany } from "@/lib/company";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { OnboardingForm } from "./OnboardingForm";

export const metadata: Metadata = { title: "Get started", robots: { index: false, follow: false } };

export default async function OnboardingPage() {
  if (await getCurrentCompany()) redirect("/overview");

  return (
    <main className="flex min-h-screen flex-col items-center scenic px-4 py-10">
      <BrandLockup size="lg" />
      <div className="mt-10 flex w-full justify-center">
        <OnboardingForm />
      </div>
    </main>
  );
}
