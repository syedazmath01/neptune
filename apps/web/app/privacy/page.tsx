import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 1, 2026">
      <p>
        Neptune is a product of 99sols.ai (&ldquo;we&rdquo;). This policy explains what we collect when you use Neptune, why, and the
        choices you have.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your email address, password (stored hashed by our authentication provider) and name if you add one.</li>
        <li><strong>Company details you enter:</strong> company name, website, industry, product description, goals, competitor websites and any Google rankings you add.</li>
        <li><strong>Analysis data:</strong> the questions Neptune generates for your market, the AI answers to them, the brands and sources they mention, and the gaps, recommendations and results we derive.</li>
        <li><strong>Your actions in the app:</strong> for example which recommendations you approve or mark as implemented.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run your AI visibility analysis and show you the results.</li>
        <li>To re-measure your visibility after you implement a recommendation.</li>
        <li>To send account emails such as sign-up confirmation.</li>
      </ul>
      <p>We do not sell your data and we do not use advertising trackers.</p>

      <h2>Services that process your data</h2>
      <ul>
        <li><strong>AI providers:</strong> questions about your market, which can include your company and competitor names, are sent to xAI (Grok) and, when enabled, OpenAI (ChatGPT) to get their answers.</li>
        <li><strong>Supabase:</strong> database, sign-in and backend processing.</li>
        <li><strong>Vercel:</strong> hosting for this website.</li>
        <li><strong>Google (Gmail):</strong> delivery of account emails.</li>
      </ul>
      <p>Each provider handles data under its own terms and privacy policy.</p>

      <h2>Cookies and local storage</h2>
      <p>
        We use only the cookies needed to keep you signed in, plus a setting in your browser that remembers light or dark mode. No
        analytics or advertising cookies.
      </p>

      <h2>Security</h2>
      <p>
        Data is encrypted in transit, and every account can only access its own company data. That rule is enforced in the
        database itself, not just in the app.
      </p>

      <h2>How long we keep it, and your choices</h2>
      <p>
        We keep your data while your account is active. You can ask us to access, correct, export or delete your data at any time
        by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We delete it within 30 days of a deletion request.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy we&apos;ll update this page and the date above, and tell signed-in users about significant changes.</p>
    </LegalPage>
  );
}
