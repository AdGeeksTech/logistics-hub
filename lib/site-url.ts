// The site's public address, for the sitemap, robots.txt, canonical links
// and link previews. On Vercel it is the production domain: once a custom
// domain is connected, the next deployment uses it instead of the
// .vercel.app address. SITE_URL overrides it (for example to prefer www).
export function siteUrl() {
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(
    process.env.SITE_URL ||
      (production
        ? `https://${production}`
        : `http://localhost:${process.env.PORT || 3000}`),
  );
}
