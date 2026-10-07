import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Listing } from "../cars";
import type { Store, TextRow } from "./types";

// Local development store: one JSON file, rewritten atomically. Production
// uses Postgres (see ./postgres.ts); this keeps `npm run dev` working with
// no database to set up.
type Data = { nextId: number; listings: Listing[]; texts: TextRow[] };

export function fileStore(directory: string): Store {
  const file = join(directory, "store.json");
  let queue: Promise<unknown> = Promise.resolve();
  async function load(): Promise<Data> {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT")
        return { nextId: 1, listings: [], texts: [] };
      throw error;
    }
  }
  // Writes run one at a time so concurrent saves cannot lose each other.
  function update<T>(change: (data: Data) => T): Promise<T> {
    const next = queue.then(async () => {
      const data = await load();
      const result = change(data);
      await mkdir(directory, { recursive: true });
      await writeFile(`${file}.tmp`, JSON.stringify(data, null, 2));
      await rename(`${file}.tmp`, file);
      return result;
    });
    queue = next.catch(() => {});
    return next;
  }
  const clean = (data: Data) => {
    data.texts = data.texts.filter((t) => t.published !== null || t.hasDraft);
  };
  const now = () => new Date().toISOString();
  return {
    async listListings() {
      const { listings } = await load();
      return listings.sort(
        (a, b) =>
          (b.publishedAt ?? b.createdAt).localeCompare(
            a.publishedAt ?? a.createdAt,
          ) || b.id - a.id,
      );
    },
    async getListing(id) {
      return (await load()).listings.find((l) => l.id === id) ?? null;
    },
    createListing(fields) {
      return update((data) => {
        const time = now();
        const listing: Listing = {
          ...fields,
          id: data.nextId++,
          createdAt: time,
          updatedAt: time,
          publishedAt: fields.status === "draft" ? null : time,
        };
        data.listings.push(listing);
        return listing;
      });
    },
    updateListing(id, fields) {
      return update((data) => {
        const index = data.listings.findIndex((l) => l.id === id);
        if (index < 0) return null;
        const old = data.listings[index];
        const time = now();
        data.listings[index] = {
          ...fields,
          id,
          createdAt: old.createdAt,
          updatedAt: time,
          publishedAt:
            fields.status === "draft"
              ? old.publishedAt
              : (old.publishedAt ?? time),
        };
        return data.listings[index];
      });
    },
    deleteListing(id) {
      return update((data) => {
        const before = data.listings.length;
        data.listings = data.listings.filter((l) => l.id !== id);
        return data.listings.length < before;
      });
    },
    async getTexts() {
      return (await load()).texts;
    },
    saveTextDrafts(changes) {
      return update((data) => {
        for (const { key, locale, value } of changes) {
          let row = data.texts.find(
            (t) => t.key === key && t.locale === locale,
          );
          if (!row) {
            row = {
              key,
              locale,
              published: null,
              draft: null,
              hasDraft: false,
              updatedAt: now(),
            };
            data.texts.push(row);
          }
          row.hasDraft = row.published !== value;
          row.draft = row.hasDraft ? value : null;
          row.updatedAt = now();
        }
        clean(data);
      });
    },
    publishTexts() {
      return update((data) => {
        const pending = data.texts.filter((t) => t.hasDraft);
        for (const row of pending)
          Object.assign(row, {
            published: row.draft,
            draft: null,
            hasDraft: false,
            updatedAt: now(),
          });
        clean(data);
        return pending.length;
      });
    },
    discardTextDrafts() {
      return update((data) => {
        const pending = data.texts.filter((t) => t.hasDraft);
        for (const row of pending)
          Object.assign(row, {
            draft: null,
            hasDraft: false,
            updatedAt: now(),
          });
        clean(data);
        return pending.length;
      });
    },
  };
}
