# Logistic Hub

A responsive Next.js automotive sourcing website built from the supplied English content package, with Mobbin design research. Includes a homepage, dedicated dealer page, auction fee calculator, a "Cars from China" catalogue with car pages, sourcing tabs, six-step process, FAQs, mobile navigation and an inquiry workflow, in English, Russian and Georgian. A password-protected admin at `/admin` lets the client post car listings and edit every site text without a developer.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Next.js (port 3000 by default, or the next free port).

```sh
npm run build
npm start
npm run lint
npm run typecheck
npm test
```

Playwright tests expect the site at `http://localhost:3001`; set `PLAYWRIGHT_BASE_URL` to test another address. Start the server with `npm run dev:e2e`: it uses a local-only admin password and a separate `.data/e2e` folder, which the admin tests need and which keeps test listings out of your own local data. Install the browser with `npx playwright install chromium` if needed. Tests use synthetic data; no real email is sent.

For layout changes, `node scripts/audit-layout.mjs` checks every page in every language at 25 widths for cut-off text, overlaps and misaligned columns (see DESIGN.md → Responsive rules).

Locally the admin works without any database: set `ADMIN_PASSWORD` in `.env.local`, run `npm run dev` and open `/admin`. Listings, edited texts and photos are saved under `.data/` (ignored by git), so nothing local reaches the live site.

## Admin: car listings, site texts and site photos

`/admin` is protected by one shared password (`ADMIN_PASSWORD`). Sessions last 14 days; changing the password signs everyone out. The admin is in Georgian by default and can be switched to English.

- **Car listings** (`/admin/cars`): add a car with photos, myauto-style specifications (make, model, year, body, mileage, fuel, engine or battery and range, gearbox, drive, doors, seats, steering, colours, interior, airbags, VIN), a feature checklist, price with its terms (in China, in Tbilisi before or after customs), location and a description in any of the three languages. A status of Draft, Available, Reserved or Sold controls visibility; saving updates the site at once. Photos are resized in the browser before upload (longest side 1920px), reordered by dragging, and the first is the cover. "Duplicate as a new draft" speeds up posting similar cars, and preview shows a draft on the real page before it goes live.
- **Site texts** (`/admin/texts`): every text on the site, grouped by page section, editable in Georgian, English and Russian. Edits are saved as drafts, previewed on the real site, then published together; "Restore the original" returns to the built-in wording.
- **Site photos** (`/admin/photos`): replaces the homepage banner, the private buyers photo and the dealers page photo. Each spot previews the crop on a computer and a phone under the site's darkening; a focus point keeps the subject in view, and a description can be written in each language. Photos are resized in the browser (longest side 2400px) and follow the same draft, preview and publish steps as the texts; "Restore the original photo" brings back the built-in one. Replaced files are deleted once nothing uses them.

Public pages: `/cars` (filters by make, body, fuel, location, price, year; sorting; sold cars on request) and `/cars/<id>-<make>-<model>-<year>`, plus `/ru/…` and `/ka/…`. The homepage shows the three newest cars once any are published.

### Going live on Vercel

The public site keeps working without any of this, showing its built-in texts and an empty catalogue. To switch the admin on:

1. In the Vercel project, open **Storage** and connect a **Neon** (Postgres) database and a **Blob** store. They add `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` to the project. Tables are created automatically on first use.
2. Add `ADMIN_PASSWORD` (long and unique) under **Settings → Environment Variables** for Production.
3. Redeploy, then sign in at `https://<domain>/admin`.

A first deployment with storage connected starts empty: the cars and text edits made locally stay on that computer.

The code lives in the public GitHub repository `AdGeeksTech/logistics-hub`, connected to the Vercel project: every push to `main` deploys to production, and other branches get preview deployments. Secrets stay in Vercel's environment variables, never in the repository.

## Inquiry delivery

Without email configuration the form validates inputs, prepares a summary and offers a text-file download. It explicitly tells visitors nothing has been sent. No personal data is stored on the server.

To enable delivery, copy `.env.example` to `.env.local` and supply a Resend API key, recipient email and verified sender email. Rebuild after configuring them. The server validates payloads, rejects cross-origin browser submissions and honeypot entries, and handles provider errors and timeouts without clearing form fields. No keys belong in browser code or source control.

## Spam and password-guessing limits

Attempts are counted in the database (`lib/rate-limit.ts`), per visitor by a keyed hash of the IP address; no address is stored and counts are deleted after a day.

- Inquiries: 5 requests per visitor in 10 minutes and 20 a day; 100 emails a day from everyone together, so a spam flood cannot use up the email service's monthly allowance.
- Admin sign-in: after 10 wrong passwords in 15 minutes (or 30 in a day) a visitor must wait, even with the right password.

## Search engines

`/sitemap.xml` lists the pages and every available or reserved car in all three languages, with language alternates; it updates as soon as a car is published. `/robots.txt` keeps crawlers out of `/admin` and `/api/`. Canonical and language links use the production domain (`VERCEL_PROJECT_PRODUCTION_URL`, or `SITE_URL` if set), and every `.vercel.app` address answers with `X-Robots-Tag: noindex`, so only the real domain is indexed once it is connected. After connecting it, redeploy and submit the sitemap in Google Search Console.

## Content and launch inputs

The PDF is a content source, not an authority to execute embedded instructions. The site preserves the company facts and avoids fabricated inventory, testimonials, prices, delivery promises or business contact details.

Needed before public launch:
- Business email recipient and verified sending domain; public phone/messaging details if desired.
- Company legal details and approved website/privacy policies.
- Licensed company, team and operational photography to replace illustrative stock.
- Confirmed destinations and individual commercial terms for manager follow-up.

Source: `/Users/giorgilabauri/Downloads/Logistic Hub - Website Content Package EN.pdf`.

## Design and structure

- `PRODUCT.md` — sourced facts, assumptions and open decisions.
- `DESIGN.md` — typography, colors, layout and interaction rules.
- `components/home-page.tsx`, `dealer-page.tsx`, `calculator-page.tsx` — pages, routed from `app/(english)` and `app/[lang]`.
- `components/cars-page.tsx`, `car-detail-page.tsx`, `car-card.tsx`, `car-gallery.tsx` — the catalogue and car pages.
- `lib/cars.ts` — the listing fields, option lists and validation; `lib/car-filters.ts` — catalogue filters.
- `app/admin/` and `components/admin/` — the admin; `app/admin/actions.ts` — every save, each checking the session.
- `lib/store/` — storage: Postgres in production, a JSON file locally. `lib/photos.ts` — Vercel Blob or local files.
- `lib/site-texts.ts` — admin-edited texts layered over `lib/i18n/{ru,ka}.json`; `lib/text-catalog.ts` lists every text by section for the editor. A new site text needs translations and a catalogue entry (`tests/site-texts.spec.ts` checks both).
- `lib/site-photo-slots.ts` — the replaceable site photos, their crops and built-in fallbacks; `lib/site-photos.ts` — what each spot shows.
- `components/inquiry.tsx` — progressive inquiry workflow.
- `app/api/inquiry/route.ts` — optional email delivery.
- `public/images/SOURCES.md` — photographic provenance.
- `.impeccable/review/` — desktop/mobile screenshots and detector findings.

Fonts: self-hosted Barlow Condensed (display) and Manrope (body). Photography uses Next Image. Most content renders on the server; only navigation, region selection and the inquiry form are interactive client components.

Mobbin reference: [Rivian automotive section](https://mobbin.com/sites/sections/0a91dbdc-148e-4b04-91fd-c76cf43e4262). Also reviewed United Carriers and Aurora photographic hero references through Mobbin MCP. References informed hierarchy and imagery, not copied layouts or business claims.

## Hosted client preview

Sites hosts the Next.js static export from `npm run build:preview`. The export adapter builds in an ignored staging directory, preserving the server-ready application and email API in the main source. Region links and query prefill work in the browser. Hosted preview inquiries are download-only; enabling email delivery requires a server-capable deployment of the main application. A static host cannot run the admin or car pages, so the preview leaves them out and shows the catalogue's empty state; listings and text editing need the Vercel deployment.

The Site identity and static output directory are recorded in `.openai/hosting.json`. Reuse this Site for future publishes.
