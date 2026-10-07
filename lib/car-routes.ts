import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  fuelTypes,
  listingIdFromSlug,
  listingSlug,
  listingTitle,
} from "./cars";
import { groupDigits, money } from "./format";
import { alternatePaths, localizedPath, type Locale } from "./i18n";
import { getVisibleListing } from "./listings";
import { getT } from "./site-texts";

// Shared by the English and translated catalogue routes.
export async function carsMetadata(locale: Locale): Promise<Metadata> {
  const t = await getT(locale);
  return {
    title: t("Cars from China"),
    description: t(
      "Cars we have selected in China, with clear prices and delivery to Tbilisi arranged by our team. New offers appear here as soon as we find them.",
    ),
    alternates: {
      canonical: localizedPath(locale, "/cars"),
      languages: alternatePaths("/cars"),
    },
  };
}

// Finds the listing for a URL, redirecting old or shortened slugs to the
// current one, so links keep working after a make or model is corrected.
export async function loadCar(locale: Locale, slug: string) {
  const id = listingIdFromSlug(slug);
  const listing = id ? await getVisibleListing(id) : null;
  if (!listing) notFound();
  const canonical = listingSlug(listing);
  if (slug !== canonical)
    permanentRedirect(localizedPath(locale, `/cars/${canonical}`));
  return listing;
}

export async function carMetadata(
  locale: Locale,
  slug: string,
): Promise<Metadata> {
  const id = listingIdFromSlug(slug);
  const listing = id ? await getVisibleListing(id) : null;
  if (!listing) return {};
  const t = await getT(locale);
  const name = `${listingTitle(listing)} ${listing.year}`;
  const path = `/cars/${listingSlug(listing)}`;
  const description = [
    listing.trim,
    `${groupDigits(listing.mileage, locale)} ${t("km")}`,
    t(fuelTypes[listing.fuel]),
    listing.price !== null && money(listing.price, locale),
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    title: name,
    description,
    alternates: {
      canonical: localizedPath(locale, path),
      languages: alternatePaths(path),
    },
    openGraph: {
      title: name,
      description,
      images: listing.photos.slice(0, 1).map((p) => ({
        url: p.url,
        width: p.width,
        height: p.height,
      })),
    },
  };
}
