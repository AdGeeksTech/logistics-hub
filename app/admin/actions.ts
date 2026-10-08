"use server";
import { updateTag } from "next/cache";
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import {
  endSession,
  passwordMatches,
  requireAdmin,
  startSession,
} from "@/lib/auth";
import { adminLangCookie, parseAdminLang } from "@/lib/admin-i18n";
import { parseListing, type FieldErrors, type Listing } from "@/lib/cars";
import { defaultText, isLocale } from "@/lib/i18n";
import { listingsTag } from "@/lib/listings";
import { deletePhotos } from "@/lib/photos";
import {
  isSitePhoto,
  sitePhotoSlots,
  sitePhotoUrl,
  type SitePhoto,
} from "@/lib/site-photo-slots";
import { sitePhotosTag } from "@/lib/site-photos";
import { textsTag } from "@/lib/site-texts";
import {
  getStore,
  type SitePhotoChange,
  type SitePhotoRow,
  type TextChange,
  type TextRow,
} from "@/lib/store";
import { textKeys } from "@/lib/text-catalog";

// Every action checks the session itself: server actions can be called
// directly, not only from the pages that render them.

export async function login(
  _state: { error?: string },
  form: FormData,
): Promise<{ error?: string }> {
  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "That password is not correct." };
  }
  await startSession();
  redirect("/admin/cars");
}

export async function logout() {
  await endSession();
  // Preview shows drafts; it must not outlast the session.
  (await draftMode()).disable();
  redirect("/admin/login");
}

export async function setAdminLanguage(lang: string) {
  (await cookies()).set(adminLangCookie, parseAdminLang(lang), {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
}

function storeOrError() {
  const store = getStore();
  if (!store) throw new Error("The database is not connected yet.");
  return store;
}

// Deletes photo files no remaining listing uses. Duplicated listings share
// photos until one of them changes its own.
async function deleteUnusedPhotos(urls: string[]) {
  if (!urls.length) return;
  const inUse = new Set(
    (await storeOrError().listListings()).flatMap((l) =>
      l.photos.map((p) => p.url),
    ),
  );
  await deletePhotos(urls.filter((url) => !inUse.has(url)));
}

export type SaveResult =
  | { ok: true; listing: Listing }
  | { ok: false; errors?: FieldErrors; error?: string };

export async function saveListing(
  id: number | null,
  input: unknown,
): Promise<SaveResult> {
  await requireAdmin();
  const parsed = parseListing(input);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  try {
    const store = storeOrError();
    let listing: Listing | null;
    if (id === null) listing = await store.createListing(parsed.value);
    else {
      const old = await store.getListing(id);
      if (!old) return { ok: false, error: "This listing no longer exists." };
      listing = await store.updateListing(id, parsed.value);
      const kept = new Set(parsed.value.photos.map((p) => p.url));
      await deleteUnusedPhotos(
        old.photos.map((p) => p.url).filter((url) => !kept.has(url)),
      );
    }
    updateTag(listingsTag);
    return listing
      ? { ok: true, listing }
      : { ok: false, error: "This listing no longer exists." };
  } catch (error) {
    console.error("Saving listing failed", error);
    return { ok: false, error: "The listing could not be saved. Try again." };
  }
}

export async function setListingStatus(id: number, status: string) {
  await requireAdmin();
  const store = storeOrError();
  const listing = await store.getListing(id);
  if (!listing) return { ok: false };
  const parsed = parseListing({ ...listing, status });
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  await store.updateListing(id, parsed.value);
  updateTag(listingsTag);
  return { ok: true };
}

export async function duplicateListing(id: number) {
  await requireAdmin();
  const store = storeOrError();
  const listing = await store.getListing(id);
  if (!listing) redirect("/admin/cars");
  const copy = await store.createListing({ ...listing, status: "draft" });
  redirect(`/admin/cars/${copy.id}?copied=1`);
}

export async function deleteListing(id: number) {
  await requireAdmin();
  const store = storeOrError();
  const listing = await store.getListing(id);
  if (listing) {
    await store.deleteListing(id);
    await deleteUnusedPhotos(listing.photos.map((p) => p.url));
    updateTag(listingsTag);
  }
  redirect("/admin/cars?deleted=1");
}

export type TextsResult =
  { ok: true; rows: TextRow[]; count?: number } | { ok: false; error: string };

// Saves edits as drafts. Drafts show only in preview until published.
export async function saveTexts(changes: unknown): Promise<TextsResult> {
  await requireAdmin();
  if (!Array.isArray(changes) || changes.length > 2000)
    return { ok: false, error: "Nothing to save." };
  const valid: TextChange[] = [];
  for (const change of changes) {
    const { key, locale, value } = (change ?? {}) as Record<string, unknown>;
    if (
      typeof key !== "string" ||
      !textKeys.has(key) ||
      typeof locale !== "string" ||
      !isLocale(locale) ||
      (value !== null && typeof value !== "string") ||
      (typeof value === "string" && value.length > 3000)
    )
      return {
        ok: false,
        error: "Some texts could not be saved. Reload the page and try again.",
      };
    const text = typeof value === "string" ? value.trim() : "";
    // Empty, or back to the built-in wording, means "use the original".
    valid.push({
      key,
      locale,
      value: !text || text === defaultText(locale, key) ? null : text,
    });
  }
  try {
    const store = storeOrError();
    await store.saveTextDrafts(valid);
    return { ok: true, rows: await store.getTexts() };
  } catch (error) {
    console.error("Saving texts failed", error);
    return { ok: false, error: "The texts could not be saved. Try again." };
  }
}

export async function publishTexts(): Promise<TextsResult> {
  await requireAdmin();
  try {
    const store = storeOrError();
    const count = await store.publishTexts();
    updateTag(textsTag);
    return { ok: true, rows: await store.getTexts(), count };
  } catch (error) {
    console.error("Publishing texts failed", error);
    return { ok: false, error: "The texts could not be published. Try again." };
  }
}

export async function discardTexts(): Promise<TextsResult> {
  await requireAdmin();
  try {
    const store = storeOrError();
    const count = await store.discardTextDrafts();
    return { ok: true, rows: await store.getTexts(), count };
  } catch (error) {
    console.error("Discarding drafts failed", error);
    return {
      ok: false,
      error: "The drafts could not be discarded. Try again.",
    };
  }
}

export type SitePhotosResult =
  | { ok: true; rows: SitePhotoRow[]; count?: number }
  | { ok: false; error: string };

const photoUrls = (
  rows: SitePhotoRow[],
  which: "draft" | "published" | "both",
) =>
  rows.flatMap((r) =>
    [
      which !== "published" && r.hasDraft ? r.draft : null,
      which !== "draft" ? r.published : null,
    ].flatMap((p) => (p ? [p.url] : [])),
  );

// Deletes uploaded site photos that no spot uses any more, as a draft or
// live. Locally site and listing photos share a folder, so listing photos
// are always kept.
async function deleteUnusedSitePhotos(urls: string[]) {
  const store = storeOrError();
  const candidates = urls.filter((url) => sitePhotoUrl.test(url));
  if (!candidates.length) return;
  const inUse = new Set([
    ...photoUrls(await store.getSitePhotos(), "both"),
    ...(await store.listListings()).flatMap((l) => l.photos.map((p) => p.url)),
  ]);
  await deletePhotos(candidates.filter((url) => !inUse.has(url)));
}

// Saves replaced photos as drafts. `abandoned` lists photos uploaded in the
// editor and then replaced or restored before saving, so their files go too.
export async function saveSitePhotos(
  changes: unknown,
  abandoned: unknown = [],
): Promise<SitePhotosResult> {
  await requireAdmin();
  const invalid = {
    ok: false as const,
    error: "Some photos could not be saved. Reload the page and try again.",
  };
  if (
    !Array.isArray(changes) ||
    changes.length > Object.keys(sitePhotoSlots).length ||
    !Array.isArray(abandoned) ||
    abandoned.length > 50 ||
    !abandoned.every((url) => typeof url === "string")
  )
    return invalid;
  const valid: SitePhotoChange[] = [];
  for (const change of changes) {
    const { slot, photo } = (change ?? {}) as Record<string, unknown>;
    if (
      typeof slot !== "string" ||
      !Object.hasOwn(sitePhotoSlots, slot) ||
      (photo !== null && !isSitePhoto(photo))
    )
      return invalid;
    const p = photo as SitePhoto | null;
    valid.push({
      slot: slot as SitePhotoChange["slot"],
      photo: p && {
        url: p.url,
        width: p.width,
        height: p.height,
        focusX: Math.round(p.focusX),
        focusY: Math.round(p.focusY),
        alt: Object.fromEntries(
          Object.entries(p.alt).flatMap(([locale, text]) =>
            text?.trim() ? [[locale, text.trim()]] : [],
          ),
        ),
      },
    });
  }
  try {
    const store = storeOrError();
    const before = photoUrls(await store.getSitePhotos(), "draft");
    await store.saveSitePhotoDrafts(valid);
    await deleteUnusedSitePhotos([...before, ...(abandoned as string[])]);
    return { ok: true, rows: await store.getSitePhotos() };
  } catch (error) {
    console.error("Saving site photos failed", error);
    return { ok: false, error: "The photos could not be saved. Try again." };
  }
}

export async function publishSitePhotos(): Promise<SitePhotosResult> {
  await requireAdmin();
  try {
    const store = storeOrError();
    const before = photoUrls(await store.getSitePhotos(), "published");
    const count = await store.publishSitePhotos();
    updateTag(sitePhotosTag);
    await deleteUnusedSitePhotos(before);
    return { ok: true, rows: await store.getSitePhotos(), count };
  } catch (error) {
    console.error("Publishing site photos failed", error);
    return {
      ok: false,
      error: "The photos could not be published. Try again.",
    };
  }
}

export async function discardSitePhotos(
  abandoned: unknown = [],
): Promise<SitePhotosResult> {
  await requireAdmin();
  const extra = Array.isArray(abandoned)
    ? abandoned.filter((url) => typeof url === "string").slice(0, 50)
    : [];
  try {
    const store = storeOrError();
    const before = photoUrls(await store.getSitePhotos(), "draft");
    const count = await store.discardSitePhotoDrafts();
    await deleteUnusedSitePhotos([...before, ...extra]);
    return { ok: true, rows: await store.getSitePhotos(), count };
  } catch (error) {
    console.error("Discarding site photo drafts failed", error);
    return {
      ok: false,
      error: "The drafts could not be discarded. Try again.",
    };
  }
}
