# Logistic Hub

A responsive Next.js automotive sourcing website built from the supplied English content package, with Mobbin design research. Includes a homepage, dedicated dealer page, sourcing tabs, six-step process, FAQs, mobile navigation and an inquiry workflow.

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

Playwright tests expect the site at `http://localhost:3001`; edit `playwright.config.ts` if using a different port. Install the browser with `npx playwright install chromium` if needed. Tests use synthetic data; no real email is sent.

## Inquiry delivery

Without email configuration the form validates inputs, prepares a summary and offers a text-file download. It explicitly tells visitors nothing has been sent. No personal data is stored on the server.

To enable delivery, copy `.env.example` to `.env.local` and supply a Resend API key, recipient email and verified sender email. Rebuild after configuring them. The server validates payloads, rejects cross-origin browser submissions and honeypot entries, and handles provider errors and timeouts without clearing form fields. Before a public campaign, configure rate limiting/bot protection with the deployment provider. No keys belong in browser code or source control.

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
- `app/page.tsx` — homepage; `app/dealers/page.tsx` — dealer page.
- `components/inquiry.tsx` — progressive inquiry workflow.
- `app/api/inquiry/route.ts` — optional email delivery.
- `public/images/SOURCES.md` — photographic provenance.
- `.impeccable/review/` — desktop/mobile screenshots and detector findings.

Fonts: self-hosted Barlow Condensed (display) and Manrope (body). Photography uses Next Image. Most content renders on the server; only navigation, region selection and the inquiry form are interactive client components.

Mobbin reference: [Rivian automotive section](https://mobbin.com/sites/sections/0a91dbdc-148e-4b04-91fd-c76cf43e4262). Also reviewed United Carriers and Aurora photographic hero references through Mobbin MCP. References informed hierarchy and imagery, not copied layouts or business claims.

## Hosted client preview

Sites hosts the Next.js static export from `npm run build:preview`. The export adapter builds in an ignored staging directory, preserving the server-ready application and email API in the main source. Region links and query prefill work in the browser. Hosted preview inquiries are download-only; enabling email delivery requires a server-capable deployment of the main application.

The Site identity and static output directory are recorded in `.openai/hosting.json`. Reuse this Site for future publishes.
