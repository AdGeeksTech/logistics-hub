# Logistic Hub design system

## Direction
Automotive touring editorial: panoramic moving-car photography, condensed transport lettering, deep evergreen and ivory surfaces, signal-orange actions. Calm, precise and human. The visual signature is a large photographic opening followed by a three-region destination rail, then a deliberate shift into spacious explanatory content.

## Tokens
The implementation source is `app/globals.css`; fonts are registered in `app/layout.tsx`.

| CSS token | Value | Use |
| --- | --- | --- |
| `--green` | `#132d2a` | Primary text, buttons and dark sections |
| `--deep` | `#10221f` | Footer and dark button hover |
| `--ivory` | `#f5f5ef` | Page and navigation background |
| `--paper` | `#fcfcf8` | Form surface and text on dark backgrounds |
| `--orange` / `--orange-hover` | `#ef6a3a` / `#f7845a` | Primary conversion, accents and focus |
| `--muted` | `#52635a` | Supporting text on light backgrounds |
| `--light-muted` | `#c5d2cc` | Supporting text on dark backgrounds |
| `--surface` / `--surface-hover` | `#e8ece3` / `#dde5d7` | Sourcing, inquiry and dealer strip surfaces |
| `--line` | `#d8ded5` | Light-surface rules and input borders |
| `--green-line` / `--muted-line` / `--footer-line` | `#47615b` / `#a7b8aa` / `#34504a` | Rules on their corresponding surfaces |
| `--error` | `#9c2c14` | Form errors |
| `--radius` | `4px` | Buttons; inputs also use 4px corners |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero entrance and image hover |

- Display: self-hosted Barlow Condensed 600 via `--font-display`. Body and controls: self-hosted Manrope 400/700 via `--font-body`, with font-display swap.
- Body baseline: 15px with 1.7 line height. Desktop section headings scale from 42–62px; mobile section headings are generally 44px. Homepage display type scales from 66–98px on desktop, reaching 108px above 1600px; mobile uses `clamp(55px, 13.6vw, 88px)`.
- Spacing variables: `--s1` 4, `--s2` 8, `--s3` 12, `--s4` 16, `--s6` 24, `--s8` 32, `--s12` 48, `--s16` 64, `--s24` 96, `--s32` 128px. Reuse these for section and component spacing.
- Desktop content width caps at 1280px with 64px minimum side gutters. Gutters become 32px at 1050px and 24px at 760px. Standard sections have 96px vertical padding, reducing to 64px on mobile.
- Images and editorial panels have 8px corners. Avoid ornamental cards, nested cards and icon tiles.
- Headings are sentence case except the condensed homepage display headline. No decorative eyebrows.

## Composition and responsive behavior
The homepage flows through the photographic hero, destination rail, buyer services and dealer link, sourcing tabs, six-step process, company experience, auction names, FAQ and inquiry. A dedicated `/dealers` page shares navigation, inquiry and footer styling and starts its inquiry in Dealer mode.

Below 760px, navigation becomes a disclosure menu, paired content columns stack, form fields use one column, and the process retains two columns. The origin rail keeps three destinations with its introductory line above them. Hero crops and overlays change for narrow screens so the text remains readable. Check both 390px and 1440px when changing layout.

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

## Content and assets
Only substantiated claims from PRODUCT.md. Stock photography is illustrative, never current inventory or company operations. Auction names are text labels, not fabricated partner logos. Contact destination is configuration, with an honest downloadable inquiry fallback. Do not invent prices, delivery promises, testimonials, phone numbers or office details. Keep the voice direct and reassuring, with individual financial and dealer terms discussed with a manager.
