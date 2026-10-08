import type { Locale } from "./i18n";

// The site's own photos (outside car listings) that the admin can replace.
// Each spot keeps its built-in photo until a replacement is published.
export type SitePhoto = {
  url: string;
  width: number;
  height: number;
  // The point that must stay visible when the photo is cropped, in percent.
  focusX: number;
  focusY: number;
  alt: Partial<Record<Locale, string>>;
};

export const sitePhotoSlots = {
  hero: {
    title: "Homepage banner",
    where: "The large photo at the top of the homepage, behind the headline.",
    advice:
      "A wide landscape photo, at least 2400 pixels across. Keep the left side calm and dark: the white headline sits there.",
    src: "/images/hero-porsche.jpg",
    width: 2400,
    height: 1600,
    altKey: "A dark Porsche travelling on an open road",
    // Below this width a replacement may look soft on large screens.
    minWidth: 1600,
    // Crop shapes as width / height, on a computer and on a phone, and the
    // built-in photo's crop (see globals.css).
    desktop: 1440 / 670,
    phone: 390 / 690,
    builtInFocus: { desktop: "50% 57%", phone: "62% 50%" },
    // The darkening the site lays over the photo, mirrored in the preview.
    shade: "hero",
  },
  buyer: {
    title: "Private buyers photo",
    where:
      "The homepage block “For private buyers”, with a caption over the bottom of the photo.",
    advice:
      "Landscape or square, at least 1400 pixels across. The bottom of the photo is darkened for the caption.",
    src: "/images/vehicle-detail.jpg",
    width: 1400,
    height: 827,
    altKey: "A silver sports car in an automotive showroom",
    minWidth: 1000,
    desktop: 626 / 560,
    phone: 342 / 350,
    builtInFocus: { desktop: "65% 50%", phone: "65% 50%" },
    shade: "bottom",
  },
  dealer: {
    title: "Dealers page photo",
    where: "The photo beside the headline at the top of the dealers page.",
    advice: "Landscape or square, at least 1400 pixels across.",
    src: "/images/vehicle-detail.jpg",
    width: 1400,
    height: 827,
    altKey: "Vehicles in an automotive showroom; illustrative photography",
    minWidth: 1000,
    desktop: 600 / 470,
    phone: 342 / 320,
    builtInFocus: { desktop: "65% 50%", phone: "65% 50%" },
    shade: null,
  },
  // The image in link previews (WhatsApp, Facebook…), cropped to 1200 × 630
  // by app/share/[file]/route.ts. Built in: a card per language, made by
  // scripts/share-images.mjs.
  share: {
    title: "Link preview image",
    where:
      "Shown when a link to the homepage, the dealers page, the calculator or the car catalogue is shared on WhatsApp, Facebook, Telegram or X. Car pages show the car’s own photo.",
    advice:
      "A landscape photo at least 1200 pixels across. It is cropped to 1200 × 630 around the focus point, and some apps trim the edges a little, so keep text away from them.",
    src: "/images/share/logistic-hub-en.jpg",
    width: 1200,
    height: 630,
    altKey: "Your choice. Our responsibility.",
    minWidth: 1200,
    desktop: 1200 / 630,
    phone: null,
    builtInFocus: { desktop: "50% 50%", phone: "50% 50%" },
    shade: null,
  },
} as const;

export type SitePhotoSlot = keyof typeof sitePhotoSlots;
export const sitePhotoSlotNames = Object.keys(
  sitePhotoSlots,
) as SitePhotoSlot[];

// Uploaded site photos: Vercel Blob in production, /api/uploads locally.
export const sitePhotoUrl =
  /^(https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/site\/|\/api\/uploads\/)/;

export function isSitePhoto(value: unknown): value is SitePhoto {
  const p = value as Partial<SitePhoto> | null;
  const percent = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
  return Boolean(
    p &&
    typeof p.url === "string" &&
    sitePhotoUrl.test(p.url) &&
    Number.isInteger(p.width) &&
    Number.isInteger(p.height) &&
    percent(p.focusX) &&
    percent(p.focusY) &&
    p.alt &&
    typeof p.alt === "object" &&
    Object.entries(p.alt).every(
      ([locale, text]) =>
        ["en", "ru", "ka"].includes(locale) &&
        typeof text === "string" &&
        text.length <= 300,
    ),
  );
}
