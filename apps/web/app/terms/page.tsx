import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="October 1, 2026">
      <p>
        These terms cover your use of Neptune, a product of 99sols.ai (&ldquo;we&rdquo;). By creating an account you agree to them.
      </p>

      <h2>Early access</h2>
      <p>
        Neptune is in early access. Features may change, and the service is provided &ldquo;as is&rdquo; without guarantees of
        availability.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Give accurate information and keep your password secure.</li>
        <li>Only analyze companies you own or are authorized to represent.</li>
        <li>Don&apos;t misuse the service: no attempts to break security, overload the system, scrape it, or resell access.</li>
      </ul>

      <h2>AI-generated results</h2>
      <p>
        Neptune&apos;s questions, answers, gaps and recommendations come from AI systems and automated analysis. They can be incomplete
        or wrong, and AI answers change over time. They are not a guarantee of any ranking, visibility or business result. You
        decide what to act on.
      </p>

      <h2>Your data</h2>
      <p>
        You own the information you enter. You allow us to process it to provide Neptune, as described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Trial and fees</h2>
      <p>
        New accounts get a 14-day free trial. After that, Neptune costs $29 per month or $290 per year (USD). We invoice paid plans
        directly and never charge you without your agreement. If you don&apos;t choose a plan, new analyses pause when the trial ends;
        your existing results stay available.
      </p>

      <h2>Ending your use</h2>
      <p>
        You can stop using Neptune at any time and ask us to delete your data. We may suspend accounts that break these terms.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to
        the amount you paid us in the 12 months before the claim.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update these terms and will post changes here. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
