import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { alternatePaths, locales, localizedPath, type Locale } from "./i18n";
import { getSharePhoto } from "./site-photos";
import { getT } from "./site-texts";

type T = (source: string) => string;
const ogLocales = { en: "en_US", ru: "ru_RU", ka: "ka_GE" } as const;

export const siteTitle = (t: T) =>
  `Logistic Hub — ${t("Your choice. Our responsibility.")}`;
export const siteDescription = (t: T) =>
  t(
    "Vehicle sourcing from the USA, Europe and China. Expert inspection, auction access and delivery support for private buyers and automotive dealers in Tbilisi.",
  );

// The preview image: the one chosen in the admin (Site photos), else the
// built-in card for the language, made by scripts/share-images.mjs.
async function shareImage(locale: Locale, alt: string) {
  const photo = await getSharePhoto();
  if (!photo)
    return {
      url: `/images/share/logistic-hub-${locale}.jpg`,
      width: 1200,
      height: 630,
      alt,
    };
  // A new name whenever the photo or its crop changes, so apps refetch it.
  const version = createHash("sha256")
    .update(`${photo.url} ${photo.focusX} ${photo.focusY}`)
    .digest("hex")
    .slice(0, 16);
  const { alt: described } = photo;
  return {
    url: `/share/${version}.jpg`,
    width: 1200,
    height: 630,
    alt:
      described[locale] || described.en || described.ka || described.ru || alt,
  };
}

// A page's language links and the preview shown when it is shared on
// WhatsApp, Facebook, Telegram or X. Car pages show their first photo.
export async function pageMetadata(
  locale: Locale,
  path: string,
  page: {
    title?: string;
    description?: string;
    images?: { url: string; width: number; height: number }[];
  } = {},
): Promise<Metadata> {
  const t = await getT(locale);
  const title = page.title ? `${page.title} | Logistic Hub` : siteTitle(t);
  const description = page.description ?? siteDescription(t);
  const url = localizedPath(locale, path);
  return {
    ...(page.title && { title: page.title }),
    description,
    alternates: { canonical: url, languages: alternatePaths(path) },
    openGraph: {
      type: "website",
      siteName: "Logistic Hub",
      url,
      title,
      description,
      locale: ogLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => ogLocales[other]),
      images: page.images ?? [await shareImage(locale, siteTitle(t))],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const homeMetadata = (locale: Locale) => pageMetadata(locale, "/");

export async function dealersMetadata(locale: Locale) {
  const t = await getT(locale);
  return pageMetadata(locale, "/dealers", {
    title: t("For automotive dealers"),
    description: t(
      "Access leading US vehicle auctions with expert lot review, bidding support, documentation and logistics from Logistic Hub.",
    ),
  });
}

export async function calculatorMetadata(locale: Locale) {
  const t = await getT(locale);
  return pageMetadata(locale, "/calculator", {
    title: t("Auction fee calculator"),
    description: t(
      "Estimate Copart and IAAI buyer, bid, gate and service fees on top of a winning bid, using each auction’s official schedule.",
    ),
  });
}
