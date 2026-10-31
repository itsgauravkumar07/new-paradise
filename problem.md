# Developer Fix Note — paradiseyatra.com SEO
**From:** SEO audit, 19 Oct 2026 · **Site stack:** Next.js
**How to use:** Work top to bottom (priority order). Each task has the problem, the fix, and a quick verify step. Tick them off and reply when done — a re-audit will be run to confirm.

---

## P0 — CRITICAL (fix first, everything else depends on these)

### 1. SEO tags are rendering inside `<body>`, not `<head>`
- **Where:** every `/package/[slug]` and `/blog/[slug]` page.
- **Problem:** `<head>` contains no `<title>` at all. Title, meta description, canonical and OG tags are emitted inside `<body>` (Next.js MetadataBoundary artefact). Social previews, WhatsApp unfurls and non-JS scrapers see nothing.
- **Fix:** Correct the Next.js metadata implementation so all metadata is server-rendered inside `<head>`.
- **Verify:** Open any package page → View Source → `<title>` appears inside `<head>`. Also paste the URL into WhatsApp/Telegram and confirm a link preview appears.

### 2. Canonical + og:url point to `http://localhost:3000`
- **Where:** every `/package/[slug]` and `/blog/[slug]` page.
- **Problem:** Canonical and `og:url` read `http://localhost:3000/...` — Google is told the official page lives on a dev machine.
- **Fix:** Set `metadataBase` (and any canonical/OG URL builder) to `https://paradiseyatra.com` in production config / env. Likely the same root cause as #1 — fix together.
- **Verify:** View Source on one package page + one blog page → canonical = full `https://paradiseyatra.com/...` URL.

---

## P1 — HIGH

### 3. Homepage title + meta description (currently placeholders)
- **Where:** `/`
- **Problem:** Title is just "Paradise Yatra"; meta description is literally "test description".
- **Fix:** Replace with this exact copy:
  - **Title:** `Paradise Yatra | India & International Tour Packages`
  - **Meta description:** `Book India & international tour packages with Paradise Yatra — Char Dham, Kerala, Kashmir, honeymoons & group tours. Trusted travel experts. Enquire today!`
- **Verify:** View Source on `/` shows the new title/description inside `<head>`.

### 4. Dead & malformed URLs in sitemap.xml
- **Where:** sitemap lists:
  - `/blog/goa-or-kerala:-which-is-better-for-your-vacation-in-india-?` → renders soft-404 "Blog post not found."
  - `/blog/chardham-yatra-tour-2025:-a-divine-journey-to-the-abode-of-gods` → unescaped `:` in slug.
- **Fix:** Rename both slugs to clean versions (lowercase, hyphens only, no `:` or `?`), add **301 redirects** from the old URLs, remove dead entries, regenerate `sitemap.xml`.
- **Verify:** Old URLs return 301 → new clean URLs; sitemap contains only live 200 URLs.

### 5. Leftover dev slug serving live content
- **Where:** `/fixed-departures/deployment-package` (serves a Manali group tour page).
- **Fix:** Rename slug to `/fixed-departures/manali-group-tour-3n-4d`, 301-redirect the old URL, update sitemap.
- **Verify:** Old URL 301s to the new one; new slug appears in sitemap.

### 6. /destinations renders "No destinations found"
- **Where:** `/destinations` on initial load.
- **Problem:** Listing fails to render server-side → Google may index an empty page.
- **Fix:** Fix the data-loading so destinations render server-side (SSR), or at minimum ship real fallback content. Page must contain destination names/links in the initial HTML.
- **Verify:** View Source on `/destinations` contains destination content without executing JS.

### 7. Core Web Vitals FAILED — mobile PageSpeed 74/100
- **Where:** Sitewide (homepage measured).
- **Fix:**
  - Convert images to WebP/AVIF, serve responsive sizes, set explicit width/height (CLS).
  - Lazy-load below-the-fold images; preload the hero/LCP image.
  - Defer/remove non-critical JS; audit third-party scripts.
- **Verify:** Re-run PageSpeed Insights (mobile) → Performance ≥ 90 target, CWV assessment passing.

---

## P2 — MEDIUM / LOW

### 8. Add JSON-LD structured data (missing on 7 of 8 pages tested)
- **Package pages:** `TouristTrip` (or `Product`) with `offers.price`, `aggregateRating` where reviews exist.
- **Blog posts with FAQs:** `FAQPage` (one sample post already has BlogPosting + FAQPage — replicate the pattern).
- **Sitewide:** `Organization` + `LocalBusiness` (name: Paradise Yatra; address: 108, Tagore Villa, Near Natraj Cinema, Chakrata Road, Dehradun, Uttarakhand 248001; phone: use ONE canonical number — confirm with site owner, footer currently shows conflicting numbers) + `BreadcrumbList`.
- **Verify:** Each template passes https://validator.schema.org with no errors.

### 9. Heading order faults (template-level)
- Homepage and package template jump H1 → H3; `/contact` contains an **empty H2**.
- **Fix:** One H1 per page; H2 → H3 in sequence, no gaps; delete the empty H2 on `/contact`.

### 10. Cookie banner text inside indexable content
- **Where:** Banner copy ("We use cookies…") renders inside the page's main content HTML.
- **Fix:** Render the banner outside the main content landmark, or load it client-side only after hydration.

### 11. WhatsApp link has unencoded spaces
- **Where:** Sitewide wa.me link (validator: "Illegal character in query").
- **Fix:** URL-encode the prefilled message (`%20` for spaces).

### 12. Invalid HTML
- `<div>` nested inside the logo `<button>` (sitewide header).
- `/contact` map iframe uses `width="100%"` + obsolete `frameborder`/`scrolling` attributes.
- **Fix:** Use a `<span>` inside the button; size the iframe via CSS; remove obsolete attributes.

### 13. Console errors + broken videos
- Homepage logs console errors (seen in PageSpeed run).
- `/about` has two videos failing with "Unable to play media."
- **Fix:** Resolve the JS errors; fix video sources/encoding so both videos play.

### 14. Tag length guardrails (apply in CMS/templates)
- Titles ≤ 60 chars, meta descriptions 140–160 chars. Current violations to correct in content: `/about` description is 165 chars; sample blog title is 128 chars; sample package description ~188 chars.

---

## Done? Reply with
- [ ] P0 #1–#2 fixed and verified in View Source
- [ ] P1 #3–#7 done
- [ ] P2 #8–#14 done
- Any task you could NOT do, and why

A full re-audit will be run after your reply to confirm every fix landed.
