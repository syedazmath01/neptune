// Shared by onboarding and settings: one definition of a valid company / competitor website.
export const INDUSTRIES = ["saas", "professional_services", "ecommerce", "other"] as const;

/** "https://www.Acme.com/pricing" -> "acme.com"; null if it isn't a website address. */
export function normalizeDomain(raw: string) {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

/** "seranking.com" -> "Seranking" (users can rename in Settings). */
export const nameFromDomain = (d: string) => d.split(".")[0].replace(/^\w/, (c) => c.toUpperCase());

/** Browser-side check with the same shape normalizeDomain accepts (optional scheme/www/path, a dot, no spaces). */
export const DOMAIN_PATTERN = String.raw`(https?://)?(www\.)?[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+(/[^\s]*)?`;
