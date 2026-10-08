# Logistic Hub design system

## Direction
Automotive touring editorial: panoramic moving-car photography, condensed transport lettering, deep logo navy and ivory surfaces, signal-orange actions. Calm, precise and human. The visual signature is a large photographic opening followed by a three-region destination rail, then a deliberate shift into spacious explanatory content.

## Tokens
The palette follows the logo navy. Neutrals are ivory mixed with a little navy so light surfaces stay warm; every text pairing meets WCAG AA.

The implementation source is `app/globals.css`; fonts are registered in `components/document-layout.tsx`.

| CSS token | Value | Use |
| --- | --- | --- |
| `--navy` | `#16213a` | Logo colour; primary text, buttons and dark sections |
| `--deep` | `#0e1527` | Footer and dark button hover |
| `--ivory` | `#f5f5ef` | Page and navigation background |
| `--paper` | `#fcfcf8` | Form surface and text on dark backgrounds |
| `--orange` / `--orange-hover` | `#ef6a3a` / `#f7845a` | Primary conversion, accents and focus |
| `--muted` | `#4f586b` | Supporting text on light backgrounds |
| `--light-muted` | `#c3c9d6` | Supporting text on dark backgrounds |
| `--surface` / `--surface-hover` | `#e5e6e2` / `#dddedb` | Sourcing, inquiry and dealer strip surfaces |
| `--line` | `#d8d9d7` | Light-surface rules and input borders |
| `--navy-line` / `--muted-line` / `--footer-line` | `#4e5667` / `#a7abb0` / `#29324a` | Rules on their corresponding surfaces |
| `--error` | `#9c2c14` | Form errors |
| `--brand-gold` | `#f2a541` | Logo star only |
| `--radius` | `4px` | Buttons; inputs also use 4px corners |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero entrance and image hover |

- Display: self-hosted Barlow Condensed 600 via `--font-display`. Body and controls: self-hosted Manrope 400/700 via `--font-body`, with font-display swap.
- Body baseline: 15px with 1.7 line height. Desktop section headings scale from 42–62px; mobile section headings are generally 44px. Homepage display type scales from 66–98px on desktop, reaching 108px above 1600px; mobile uses `clamp(55px, 13.6vw, 88px)`.
- Spacing variables: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s6` 24, `--s8` 32, `--s12` 48, `--s16` 64, `--s24` 96, `--s32` 128px. Reuse these for section and component spacing.
- Desktop content width caps at 1280px with 64px minimum side gutters. Gutters become 32px at 1050px and 24px at 760px. Standard sections have 96px vertical padding, reducing to 64px on mobile.
- Images and editorial panels have 8px corners. Avoid ornamental cards, nested cards and icon tiles.
- Headings are sentence case except the condensed homepage display headline. No decorative eyebrows.

## Composition and responsive behavior
The homepage flows through the photographic hero, destination rail, buyer services and dealer link, sourcing tabs, six-step process, company experience, auction names, FAQ and inquiry. A dedicated `/dealers` page shares navigation, inquiry and footer styling and starts its inquiry in Dealer mode. The `/calculator` page reuses the dark dealer hero, then pairs a calculator form (auction, winning bid, Copart title type, live bid or pre-bid) with a dark fee breakdown that updates as the inputs change, followed by the inquiry preset to USA.

At 1200px and below (1360px and below in Georgian, whose labels are longer), navigation becomes a disclosure menu to accommodate translated labels and the full logo lockup; `components/header.tsx` mirrors both breakpoints. At desktop widths, labels stay on one line; resizing to desktop closes any open disclosure. Below 760px, paired content columns stack, form fields use one column, and the process retains two columns. The origin rail keeps three destinations with its introductory line above them. Hero crops and overlays change for narrow screens so the text remains readable. Check both 390px and 1440px when changing layout.

## Interaction and accessibility
- Keep interactive touch targets at least 44px. Standard buttons are 48px tall; form controls are at least 46px. Mobile text inputs, selects and textareas use 16px text to avoid focus zoom.
- Preserve the skip link, semantic navigation and heading order, associated form labels and native validation. Orange focus rings are 3px with a 5px offset; the audience selector has its own focus-within treatment.
- Region tabs use a roving tab stop, linked tab/panel semantics, Left/Right wrapping, and Home/End navigation. The selected region has an underline, not just a color change.
- Destination links include a region query and section anchor. The server resolves and validates `region` before rendering, then seeds the tabs and inquiry selection. Unknown or absent regions leave the inquiry at “Not sure yet” and the tabs at USA. An “Explore” link carries the currently selected tab into the inquiry.
- Mobile navigation exposes expanded state and closes on navigation or Escape. FAQs use native details/summary with a plus-to-minus indicator.
- Most hover feedback lasts 180ms, using small transforms or color changes. The hero enters over 700ms with opacity and a 14px translation; the buyer image scales to 1.025 over 600ms. Reduced-motion preferences disable animations, transitions and smooth scrolling.

## Inquiry states
Required fields are stated before the form; phone is explicitly optional. Native browser validation handles required fields, email format and text length before submission. Server validation errors appear inline as alerts and preserve entered values.

Email delivery is optional through Resend and requires `RESEND_API_KEY`, `INQUIRY_TO_EMAIL` and `INQUIRY_FROM_EMAIL`. With all three configured, the action reads “Send inquiry”; sending disables the button and shows a spinner, a successful provider response displays confirmation, and failure offers retry without erasing inputs.

Without delivery configuration, the action reads “Prepare my inquiry.” It prepares a downloadable text summary locally and explicitly states “Nothing has been sent.” Editing fields resets the prepared state. Never present a prepared download as a delivered inquiry or invent a contact destination.

## References
Mobbin Rivian section https://mobbin.com/sites/sections/0a91dbdc-148e-4b04-91fd-c76cf43e4262 : photographic detail and concise content, clear segmented controls. The initial Mobbin United Carriers and Aurora hero references informed panoramic transport imagery and large type; this site uses automotive sourcing content and its own composition.

## Auction fee calculator
Fee tables live in `lib/auction-fees.ts`, copied from the official Copart (standard licensed and public pricing, identical) and IAA (Standard Volume licensed) schedules for standard vehicles paid with secured funds. Each source URL and the date it was checked are shown on the page. When an auction publishes a new schedule, update the tiers, the fixed fees and `feeSources.checked`, then the unit test in `tests/calculator.spec.ts`. Fees without a published amount (IAA's EH&S and fuel surcharge) and situational fees (storage, late payment, title shipping, premium imagery) are listed as not included instead of estimated. Money and dates are formatted by hand, not with `Intl`, because Node and browsers ship different Georgian and Russian locale data and would break hydration. The client confirmed it passes auction fees on at the standard amount with no markup, so the summary states that beside the breakdown. Logistic Hub's own service fee and shipping are separate and not part of the calculator.

## Logo
The client-supplied quartered-circle logo is inlined in `Brand` (`components/header.tsx`) without its embedded metadata, so it can take `currentColor`: brand navy `--navy` (#16213a) in the header and paper in the dark footer, with the star always `--brand-gold` (#f2a541). It is 42px tall on desktop and 36px below 760px; the wordmark is small inside the lockup, so do not shrink it further. The favicon (`app/icon.svg`) is the round mark alone and switches to ivory in dark browser themes.

## Content and assets
Only substantiated claims from PRODUCT.md. Stock photography is illustrative, never current inventory or company operations; the only inventory photos are those the client uploads to car listings, and the footer says so. The auction row and the logistics partner use the companies' real logos in their own colours (sources and trademark note in `public/images/SOURCES.md`); the client chose to use them and should obtain permission where an owner's brand rules require it. The Lion Trans site uses its group mark ("Lion Auto Auction"), so the name "Lion Trans" stays beside it. Contact destination is configuration, with an honest downloadable inquiry fallback. Do not invent prices, delivery promises, testimonials, phone numbers or office details. Keep the voice direct and reassuring, with individual financial and dealer terms discussed with a manager.

## Languages
English keeps `/`, `/dealers` and `/calculator`; Russian uses `/ru`, `/ru/dealers` and `/ru/calculator`; Georgian uses `/ka`, `/ka/dealers` and `/ka/calculator`. Each root document declares its own HTML language and translated metadata with alternate-language links. The header language selector preserves the page, query string and section anchor. Brand and auction names remain unchanged. Locale dictionaries live in `lib/i18n/` and stable English values remain internal identifiers for regions and buyer types. Texts edited in the admin override the dictionaries per language; server components read them with `getT()` and client components with `useT()`.

Russian headlines use self-hosted Oswald with Cyrillic coverage; English headlines retain Barlow Condensed. Body Manrope now uses the complete variable font with Cyrillic coverage. Georgian uses self-hosted Noto Sans Georgian for display and body, with less condensed heading sizes and more line height. Localized mobile headline sizes are intentionally smaller to fit longer text. All localized forms, native validation overrides, statuses, error messages, image descriptions and downloaded inquiry summaries use the selected language. Phone remains optional. Language selection is URL-based; no geolocation or forced browser-language redirects.

## Cars from China
`/cars` pairs a sticky filter panel (make, body, fuel, location, price and year ranges, sold cars on request, sort) with a grid of flat listing cards: 4:3 photo, make and model with trim, year and mileage, fuel and gearbox, price in the display face, and location. Reserved, sold and (in preview) draft cars carry a small badge; sold photos are desaturated and sold cars always sort last. Filters are a GET form, so they work before JavaScript; with JavaScript, selects apply at once and empty values stay out of the URL. Below 760px the filters fold behind a "Filters" button showing the active count.

A car page follows the myauto pattern: gallery on the left (arrows, swipe, thumbnails, full-screen dialog with keyboard arrows), and a sticky price panel on the right spanning the specification table, grouped feature checklist and description below the gallery. Specifications show only fields that were filled in. The inquiry form below is preset to China with the car's name and ID in the message. Prices are US dollars, formatted by hand like the calculator; the price terms (in China, in Tbilisi before or after customs) always sit under the price, so a figure is never shown without saying where it applies. Listing URLs are `/cars/<id>-<make>-<model>-<year>`; any other spelling with the right ID redirects there.

The homepage shows the three newest available or reserved cars after the services section, and leaves the section out while there are none.

## Admin
`/admin` has its own root layout: a navy bar, ivory work area and paper cards in the site tokens, but body-font headings and 15px controls for long sessions. It is Georgian by default with an English switch, using `lib/i18n/admin-ka.json` plus the site dictionary for listing labels. The car form groups fields as myauto does (photos, main details, engine and drive, body and interior, features, price and location, description) and hides fields that do not apply to the fuel type. Status and saving sit in a sticky side panel, which becomes a bottom bar below 1050px. The text editor shows each text in Georgian, English and Russian side by side, marks unsaved, draft and edited fields, and publishes all drafts together after a preview.

Preview mode uses Next.js draft mode: an orange bar on the public site says unpublished texts and draft listings are visible, with links back to the admin and out of preview.

## Responsive rules
Text is never cut off or pushed off screen, in any language, from 320px up. Equal columns use `minmax(0, 1fr)` so a long Russian or Georgian word wraps instead of stretching its column, and single-column grids declare that column for the same reason. Forms switch to one column by their own width (a container query on `.form-wrap`), not the page width. Selects draw their own arrow so their text starts exactly where text fields start theirs. Choices with long labels use radio buttons, which wrap, rather than selects, which cannot. Headings shrink with `clamp()` on small phones, and `overflow-wrap: break-word` is the last resort for a word longer than its line.

`node scripts/audit-layout.mjs` (with `npm run dev:e2e` running and some listings saved) loads every public and admin page in all three languages and their interactive states, steps through 25 widths from 320 to 1920px, and lists clipped text, controls too narrow for their text, overlaps, sideways scrolling and unequal columns. Run it after layout or translation changes; it should report 0 issues.
