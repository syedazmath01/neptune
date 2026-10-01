// Feature 1.6 — which page types competitors get cited for that the company's site lacks.
import { chain, db, loadBrands, must, pipelineStep, roundCitations } from "../_shared/runtime.ts";
import { detectContentGaps, parseSitemap } from "../_shared/gaps.ts";

const MAX_BYTES = 2_000_000;
const MAX_CHILD_SITEMAPS = 5;

// SSRF guard: only https to the company's own (onboarding-validated) public hostname.
function safeUrl(raw: string, domain: string): URL | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const ok =
      u.protocol === "https:" &&
      (host === domain || host === `www.${domain}`) &&
      !/^[\d.]+$|^\[|localhost/.test(host);
    return ok ? u : null;
  } catch {
    return null;
  }
}

async function fetchText(url: URL, domain: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: "follow" });
    if (!res.ok || !safeUrl(res.url, domain)) return null;
    const text = await res.text();
    return text.length > MAX_BYTES ? text.slice(0, MAX_BYTES) : text;
  } catch {
    return null;
  }
}

async function sitemapUrls(domain: string): Promise<string[]> {
  const root = safeUrl(`https://${domain}/sitemap.xml`, domain);
  const xml = root && (await fetchText(root, domain));
  if (!xml) return [];
  const locs = parseSitemap(xml);
  if (!/<sitemapindex/i.test(xml)) return locs;
  const children = await Promise.all(
    locs
      .map((l) => safeUrl(l, domain))
      .filter((u): u is URL => !!u)
      .slice(0, MAX_CHILD_SITEMAPS)
      .map((u) => fetchText(u, domain)),
  );
  return children.flatMap((c) => (c ? parseSitemap(c) : []));
}

pipelineStep("map-content-gaps", async ({ company_id, round }) => {
  const sb = db();
  const companyId = company_id as string;
  const { name, domain } = await loadBrands(sb, companyId);

  const competitorUrls = (await roundCitations(sb, companyId, round as number))
    .filter((c) => c.entity_type === "competitor" && c.url)
    .map((c) => c.url as string);

  if (competitorUrls.length) {
    const gaps = detectContentGaps(competitorUrls, await sitemapUrls(domain), name);
    if (gaps.length) must(await sb.from("gaps").insert(gaps.map((g) => ({ company_id: companyId, ...g }))).select("id"), "insert content gaps");
  }

  await chain("generate-recommendations", { company_id, round });
});
