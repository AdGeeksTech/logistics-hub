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
import { textsTag } from "@/lib/site-texts";
import { getStore, type TextChange, type TextRow } from "@/lib/store";
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
