import { test, expect } from "@playwright/test";
import { PGlite } from "@electric-sql/pglite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { emptyListing } from "../lib/cars";
import { fileStore } from "../lib/store/file";
import { postgresStore } from "../lib/store/postgres";
import type { Store } from "../lib/store/types";

// The same behaviour is required of the local file store and of Postgres,
// which runs here in-process through PGlite.
const backends: [string, () => Promise<[Store, () => Promise<void>]>][] = [
  [
    "file",
    async () => {
      const dir = mkdtempSync(join(tmpdir(), "lh-store-"));
      return [fileStore(dir), async () => rmSync(dir, { recursive: true })];
    },
  ],
  [
    "postgres",
    async () => {
      const db = new PGlite();
      const store = postgresStore(async (text, params) => {
        const result = await db.query<Record<string, unknown>>(text, params);
        return result.rows;
      });
      return [store, () => db.close()];
    },
  ],
];

for (const [name, open] of backends) {
  test(`${name} store keeps listings`, async () => {
    const [store, close] = await open();
    const draft = await store.createListing({
      ...emptyListing(),
      make: "BYD",
      model: "Seal",
    });
    expect(draft).toMatchObject({
      id: 1,
      status: "draft",
      make: "BYD",
      publishedAt: null,
    });
    const live = await store.updateListing(draft.id, {
      ...draft,
      status: "available",
      price: 30000,
    });
    expect(live?.publishedAt).toBeTruthy();
    expect(live?.price).toBe(30000);
    const hidden = await store.updateListing(draft.id, {
      ...live!,
      status: "draft",
    });
    expect(hidden?.publishedAt).toBe(live?.publishedAt);
    const second = await store.createListing({
      ...emptyListing(),
      status: "sold",
      make: "Zeekr",
      model: "001",
    });
    expect((await store.listListings()).map((l) => l.id)).toEqual([
      second.id,
      draft.id,
    ]);
    expect((await store.getListing(second.id))?.model).toBe("001");
    expect(await store.updateListing(999, emptyListing())).toBeNull();
    expect(await store.deleteListing(draft.id)).toBe(true);
    expect(await store.deleteListing(draft.id)).toBe(false);
    expect(await store.getListing(draft.id)).toBeNull();
    await close();
  });

  test(`${name} store drafts and publishes texts`, async () => {
    const [store, close] = await open();
    const row = async (key: string) =>
      (await store.getTexts()).find((r) => r.key === key && r.locale === "ka");
    await store.saveTextDrafts([
      { key: "A", locale: "ka", value: "first" },
      { key: "A", locale: "ka", value: "second" },
      { key: "B", locale: "ka", value: null },
    ]);
    expect(await row("A")).toMatchObject({
      draft: "second",
      hasDraft: true,
      published: null,
    });
    expect(await row("B")).toBeUndefined();
    expect(await store.publishTexts()).toBe(1);
    expect(await row("A")).toMatchObject({
      published: "second",
      hasDraft: false,
    });
    // Saving the published value again is not a change.
    await store.saveTextDrafts([{ key: "A", locale: "ka", value: "second" }]);
    expect((await row("A"))?.hasDraft).toBe(false);
    // Back to the original wording, then discarded: the edit stays live.
    await store.saveTextDrafts([{ key: "A", locale: "ka", value: null }]);
    expect(await row("A")).toMatchObject({
      draft: null,
      hasDraft: true,
      published: "second",
    });
    expect(await store.discardTextDrafts()).toBe(1);
    expect(await row("A")).toMatchObject({
      published: "second",
      hasDraft: false,
    });
    // Published as the original wording, the row disappears.
    await store.saveTextDrafts([{ key: "A", locale: "ka", value: null }]);
    await store.publishTexts();
    expect(await store.getTexts()).toEqual([]);
    await close();
  });

  test(`${name} store drafts and publishes site photos`, async () => {
    const [store, close] = await open();
    const photo = {
      url: "/api/uploads/00000000-0000-0000-0000-000000000000.webp",
      width: 2560,
      height: 1440,
      focusX: 40,
      focusY: 60,
      alt: { en: "Cars at the port" },
    };
    const row = async () =>
      (await store.getSitePhotos()).find((p) => p.slot === "hero");
    await store.saveSitePhotoDrafts([
      { slot: "hero", photo },
      { slot: "buyer", photo: null },
    ]);
    expect(await row()).toMatchObject({
      draft: photo,
      hasDraft: true,
      published: null,
    });
    expect((await store.getSitePhotos()).length).toBe(1);
    expect(await store.publishSitePhotos()).toBe(1);
    expect(await row()).toMatchObject({ published: photo, hasDraft: false });
    // Same photo again is not a change; a new focus point is.
    await store.saveSitePhotoDrafts([{ slot: "hero", photo }]);
    expect((await row())?.hasDraft).toBe(false);
    await store.saveSitePhotoDrafts([
      { slot: "hero", photo: { ...photo, focusX: 10 } },
    ]);
    expect((await row())?.draft?.focusX).toBe(10);
    expect(await store.discardSitePhotoDrafts()).toBe(1);
    expect((await row())?.published?.focusX).toBe(40);
    // Back to the built-in photo, published: the row disappears.
    await store.saveSitePhotoDrafts([{ slot: "hero", photo: null }]);
    await store.publishSitePhotos();
    expect(await store.getSitePhotos()).toEqual([]);
    await close();
  });
}
