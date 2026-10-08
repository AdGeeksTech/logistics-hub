import type { MetadataRoute } from "next";
import { listingSlug } from "@/lib/cars";
import { localizedPath, locales } from "@/lib/i18n";
import { getPublicListings } from "@/lib/listings";
import { siteUrl } from "@/lib/site-url";

// Built on each request (from the cached listings), so new cars appear as
// soon as they are published.
export const dynamic = "force-dynamic";

const pages = ["/", "/cars", "/dealers", "/calculator"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const url = (path: string) => new URL(path, base).href;
  // One entry per language, each listing the other languages.
  const entries = (
    path: string,
    extra: Partial<MetadataRoute.Sitemap[number]> = {},
  ) => {
    const languages = {
      ...Object.fromEntries(
        locales.map((locale) => [locale, url(localizedPath(locale, path))]),
      ),
      "x-default": url(path),
    };
    return locales.map((locale) => ({
      url: url(localizedPath(locale, path)),
      alternates: { languages },
      ...extra,
    }));
  };
  // Sold cars stay reachable by link but are not offered to search engines.
  const cars = (await getPublicListings()).filter((l) => l.status !== "sold");
  return [
    ...pages.flatMap((path) => entries(path)),
    ...cars.flatMap((listing) =>
      entries(`/cars/${listingSlug(listing)}`, {
        lastModified: listing.updatedAt,
        images: listing.photos.slice(0, 1).map((photo) => url(photo.url)),
      }),
    ),
  ];
}
