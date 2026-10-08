import { createHash } from "node:crypto";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { cache } from "react";
import type { Locale } from "./i18n";
import {
  sitePhotoSlots,
  type SitePhoto,
  type SitePhotoSlot,
} from "./site-photo-slots";
import { getStore } from "./store";

export const sitePhotosTag = "site-photos";
type Replacements = Partial<Record<SitePhotoSlot, SitePhoto>>;

async function load(draft: boolean): Promise<Replacements> {
  const replaced: Replacements = {};
  for (const row of (await getStore()?.getSitePhotos()) ?? []) {
    const photo = draft && row.hasDraft ? row.draft : row.published;
    if (photo && row.slot in sitePhotoSlots) replaced[row.slot] = photo;
  }
  return replaced;
}
// Published photos are cached until the admin publishes; preview reads the
// database directly, like the texts (see lib/site-texts.ts).
const loadPublished = unstable_cache(() => load(false), ["site-photos"], {
  tags: [sitePhotosTag],
});

const getReplacements = cache(async (): Promise<Replacements> => {
  try {
    return (await draftMode()).isEnabled
      ? await load(true)
      : await loadPublished();
  } catch (error) {
    console.error("Could not load site photos", error);
    return {};
  }
});

// The replaced link-preview image, if any (drafts in preview mode).
export async function getSharePhoto() {
  return (await getReplacements()).share ?? null;
}
// Names the link-preview file after the photo and its crop, so a change
// gets a new address that apps fetch again.
export const shareFileName = (photo: SitePhoto) =>
  `${createHash("sha256")
    .update(`${photo.url} ${photo.focusX} ${photo.focusY}`)
    .digest("hex")
    .slice(0, 16)}.jpg`;

// The published one, for the image route, which has no preview mode.
export async function getPublishedSharePhoto() {
  try {
    return (await loadPublished()).share ?? null;
  } catch (error) {
    console.error("Could not load site photos", error);
    return null;
  }
}

// What a spot shows: the replacement, cropped around its focus point, or
// the built-in photo with its built-in crop (set in globals.css).
export async function sitePhoto(
  slot: SitePhotoSlot,
  locale: Locale,
  t: (source: string) => string,
) {
  const photo = (await getReplacements())[slot];
  if (!photo) {
    const builtIn = sitePhotoSlots[slot];
    return { src: builtIn.src, alt: t(builtIn.altKey), style: undefined };
  }
  const alt = photo.alt;
  return {
    src: photo.url,
    // Without a description the photo is treated as decorative.
    alt: alt[locale] || alt.en || alt.ka || alt.ru || "",
    style: { objectPosition: `${photo.focusX}% ${photo.focusY}%` },
  };
}
