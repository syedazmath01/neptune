## FILL THIS BEFORE RUNNING

SITE_NAME=Neptune
COMPANY_NAME=99sols.ai
SITE_URL=https://yoursite.com        ← fill in once the production domain is set
DEFAULT_TITLE=Neptune by 99sols.ai | AI Visibility Optimization Platform
DEFAULT_DESCRIPTION=Write 150-160 characters describing what Neptune does and who it's for. Be specific.
DEFAULT_OG_IMAGE=https://yoursite.com/og-image.png   ← URL to your 1200x630px social share image. Leave blank if you don't have one yet.
TWITTER_HANDLE=@yourhandle          ← leave blank if you don't have one
SITE_LANGUAGE=en                    ← en / hi / other

Branding note: wherever "Neptune" is rendered as a brand mark (not plain
body text) — page `<title>`, Organization schema `name`, OG `site_name`,
footer logo — pair it with the company attribution "by 99sols.ai" per
`prd.md`'s Branding Convention. The Organization JSON-LD in Step 6 should
set `name: "Neptune"` and a `parentOrganization`/`brand` reference to
"99sols.ai" (or `name: "Neptune by 99sols.ai"` if the schema tool used
doesn't support a separate parent-org field).

## END OF USER BLOCK
---

You are a senior SEO engineer and full-stack developer.
Your job is to make this SaaS website fully SEO-ready — 
technically correct, properly indexed, and social-share friendly.

Do not ask questions. Detect the stack first, then implement everything.

---

## STEP 1 — DETECT TECH STACK

Read the codebase carefully and identify exactly which setup this is:

**Option A — Next.js App Router (has /app directory)**
→ Uses: export const metadata in each page.tsx/page.jsx
→ Root metadata in: /app/layout.tsx

**Option B — Next.js Pages Router (has /pages directory)**
→ Uses: next/head component inside each page
→ Custom document: /pages/_document.tsx

**Option C — React (CRA or Vite, no SSR)**
→ Uses: index.html as the single HTML file
→ Meta tags in <head> of index.html are static — they don't change per page
→ Needs: react-helmet-async for dynamic per-page meta tags

**Option D — Vue.js**
→ Uses: @vueuse/head or vue-meta for dynamic meta

**Option E — Plain HTML**
→ Meta tags go directly in each HTML file's <head>

State which option this codebase is before proceeding.
If it is Option C (React SPA), install react-helmet-async immediately:
npm install react-helmet-async

---

## STEP 2 — IMPLEMENT META TAGS

### For Option A (Next.js App Router):

In /app/layout.tsx, add the root-level metadata export:

export const metadata: Metadata = {
  title: {
    default: 'DEFAULT_TITLE',
    template: '%s | SITE_NAME'
  },
  description: 'DEFAULT_DESCRIPTION',
  metadataBase: new URL('SITE_URL'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'SITE_LANGUAGE',
    url: 'SITE_URL',
    siteName: 'SITE_NAME',
    title: 'DEFAULT_TITLE',
    description: 'DEFAULT_DESCRIPTION',
    images: [{ url: 'DEFAULT_OG_IMAGE', width: 1200, height: 630, alt: 'SITE_NAME' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DEFAULT_TITLE',
    description: 'DEFAULT_DESCRIPTION',
    creator: 'TWITTER_HANDLE',
    images: ['DEFAULT_OG_IMAGE']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
}

Then for every individual page.tsx that exists, add a unique metadata 
export with a specific title and description relevant to that page's content.
Scan all pages and write unique metadata for each one.

### For Option B (Next.js Pages Router):

Create a reusable SEO component at /components/SEO.tsx:
- Accepts: title, description, canonicalUrl, ogImage as props
- Uses next/head to inject all meta tags
- Has sensible defaults from the user block above

Import and use this SEO component at the top of every page in /pages/.
Write a unique title and description for each page based on its content.

### For Option C (React SPA with react-helmet-async):

In main.tsx or index.tsx, wrap the app with <HelmetProvider>

Create a reusable SEO component at /src/components/SEO.tsx:
- Uses Helmet from react-helmet-async
- Accepts: title, description, canonicalUrl, ogImage
- Sets all open graph, twitter card, and standard meta tags

In index.html, add this inside <head> as the static base:
- viewport meta (if missing)
- charset UTF-8 (if missing)
- Default title as fallback

Use the SEO component at the top of every route/page component.
Write unique title and description for each page.

Important note for React SPA:
Add a comment in index.html:
<!-- NOTE: This React SPA uses client-side rendering. For full SEO 
indexing, consider migrating to Next.js or using prerendering. 
Google can crawl client-rendered pages but social media crawlers 
(Facebook, Twitter, LinkedIn, WhatsApp) cannot execute JavaScript — 
your og:image and og:title will not show on social shares unless 
you use SSR, prerendering, or a service like prerender.io -->

---

## STEP 3 — ROBOTS.TXT

Check if /public/robots.txt exists.
If not, create it:

User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /account/
Sitemap: SITE_URL/sitemap.xml

Adjust the Disallow paths based on what private/authenticated 
routes actually exist in this codebase.

---

## STEP 4 — SITEMAP

Check if a sitemap exists. If not:

### For Next.js App Router:
Create /app/sitemap.ts that exports a sitemap function.
It should return all public pages (home, pricing, about, blog, etc.)
with lastModified as today's date and changeFrequency and priority set.

### For Next.js Pages Router:
Create /pages/sitemap.xml.tsx that generates XML dynamically.

### For React SPA:
Create /public/sitemap.xml manually with all public route URLs.
Add a comment that this must be updated manually when new pages are added.

---

## STEP 5 — CANONICAL TAGS

Every page must have a canonical URL tag.
This prevents duplicate content issues.

For Next.js App Router: alternates.canonical is already set in Step 2.
For Pages Router and React: add <link rel="canonical" href="FULL_PAGE_URL"> 
inside the SEO component and pass the correct URL to each page.

---

## STEP 6 — STRUCTURED DATA (JSON-LD)

Add JSON-LD structured data for the following:

### On the Homepage:
Add WebSite schema with name, url, and potentialAction (SearchAction if search exists)
Add Organization schema with name, url, logo, contactPoint (using SUPPORT info if available)

### On the Pricing Page (if it exists):
Add Product or Offer schema for each plan with name, description, price, priceCurrency

Inject JSON-LD using:
- Next.js: <script type="application/ld+json"> inside the page's metadata or a Script tag
- React: inject using react-helmet-async with a dangerouslySetInnerHTML script tag

---

## STEP 7 — SEMANTIC HTML AUDIT

Scan all pages and fix:
- Every page must have exactly ONE <h1> tag
- Heading hierarchy must be correct: h1 → h2 → h3 (no skipping levels)
- Images must have descriptive alt text (not empty, not "image", not filename)
- Links must have descriptive text (not "click here" or "read more" without context)
- Buttons must have accessible labels
- Main content area should be wrapped in <main> tag
- Nav should use <nav> tag
- Footer should use <footer> tag

Fix every violation found.

---

## STEP 8 — PAGE SPEED BASICS

Check and fix these common performance issues that affect SEO:

- Images: if using <img> tags in Next.js, replace with next/image
- Fonts: if Google Fonts are loaded via <link>, add preconnect tags
- Ensure no render-blocking scripts in <head> without defer or async
- If any large third-party script is loaded, add loading="lazy" or defer

---

## STEP 9 — FINAL REPORT

Output this after completing all steps:

---
### ✅ SEO Implementation Report

**Tech Stack Detected:** [Option A/B/C/D/E — exact name]  
**SSR Capable:** Yes / No (with note if React SPA has social share limitations)  

**What was implemented:**
- [ ] Root metadata (title, description, og, twitter)
- [ ] Per-page unique metadata (list each page)
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] Canonical tags
- [ ] JSON-LD structured data
- [ ] Semantic HTML fixes
- [ ] Performance improvements

**Files Created:** (list)  
**Files Modified:** (list)  

**What you must do manually:**
1. Create an OG image (1200x630px) at: SITE_URL/og-image.png
   — Use Canva, Figma, or any design tool
   — It should have your product name and a one-line value prop
2. Go to Google Search Console → URL Inspection → test your homepage
3. Test social share preview at: https://developers.facebook.com/tools/debug/
4. Test Twitter card at: https://cards-dev.twitter.com/validator
5. After deploying, submit your sitemap in Google Search Console:
   Sitemaps → Add: SITE_URL/sitemap.xml
---


