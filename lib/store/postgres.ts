import type { Listing, ListingFields } from "../cars";
import type { Locale } from "../i18n";
import type { SitePhotoSlot } from "../site-photo-slots";
import type { Store, TextChange, TextRow } from "./types";

export type Query = (
  text: string,
  params?: unknown[],
) => Promise<Record<string, unknown>[]>;

// Each statement runs on its own: Neon's HTTP driver accepts one per query.
const schema = [
  `CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS site_texts (
    key TEXT NOT NULL,
    locale TEXT NOT NULL,
    published TEXT,
    draft TEXT,
    has_draft BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (key, locale)
  )`,
  `CREATE TABLE IF NOT EXISTS site_photos (
    slot TEXT PRIMARY KEY,
    published JSONB,
    draft JSONB,
    has_draft BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];
const json = (value: unknown) =>
  value == null ? null : typeof value === "string" ? JSON.parse(value) : value;

const iso = (value: unknown) =>
  value ? new Date(value as string | Date).toISOString() : null;
function toListing(row: Record<string, unknown>): Listing {
  const data = (
    typeof row.data === "string" ? JSON.parse(row.data) : row.data
  ) as Omit<ListingFields, "status">;
  return {
    ...data,
    id: Number(row.id),
    status: row.status as Listing["status"],
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
    publishedAt: iso(row.published_at),
  };
}
function split({ status, ...data }: ListingFields) {
  return [status, JSON.stringify(data)] as const;
}

export function postgresStore(query: Query): Store {
  let ready: Promise<void> | undefined;
  const run: Query = async (text, params) => {
    ready ??= (async () => {
      for (const statement of schema) await query(statement);
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
    await ready;
    return query(text, params);
  };
  const returning = "id, status, data, created_at, updated_at, published_at";
  return {
    async listListings() {
      const rows = await run(
        `SELECT ${returning} FROM listings ORDER BY COALESCE(published_at, created_at) DESC, id DESC`,
      );
      return rows.map(toListing);
    },
    async getListing(id) {
      const [row] = await run(
        `SELECT ${returning} FROM listings WHERE id = $1`,
        [id],
      );
      return row ? toListing(row) : null;
    },
    async createListing(fields) {
      const [status, data] = split(fields);
      const [row] = await run(
        `INSERT INTO listings (status, data, published_at)
         VALUES ($1, $2::jsonb, CASE WHEN $1 = 'draft' THEN NULL ELSE now() END)
         RETURNING ${returning}`,
        [status, data],
      );
      return toListing(row);
    },
    async updateListing(id, fields) {
      const [status, data] = split(fields);
      const [row] = await run(
        `UPDATE listings SET status = $2, data = $3::jsonb, updated_at = now(),
           published_at = CASE WHEN $2 = 'draft' THEN published_at
                               ELSE COALESCE(published_at, now()) END
         WHERE id = $1 RETURNING ${returning}`,
        [id, status, data],
      );
      return row ? toListing(row) : null;
    },
    async deleteListing(id) {
      const rows = await run(
        `DELETE FROM listings WHERE id = $1 RETURNING id`,
        [id],
      );
      return rows.length > 0;
    },
    async getTexts() {
      const rows = await run(
        `SELECT key, locale, published, draft, has_draft, updated_at FROM site_texts`,
      );
      return rows.map((row): TextRow => ({
        key: row.key as string,
        locale: row.locale as Locale,
        published: (row.published as string | null) ?? null,
        draft: (row.draft as string | null) ?? null,
        hasDraft: Boolean(row.has_draft),
        updatedAt: iso(row.updated_at)!,
      }));
    },
    async saveTextDrafts(changes: TextChange[]) {
      const unique = new Map(changes.map((c) => [`${c.locale}\n${c.key}`, c]));
      if (!unique.size) return;
      const list = [...unique.values()];
      await run(
        `INSERT INTO site_texts (key, locale, draft, has_draft)
         SELECT k, l, d, d IS NOT NULL FROM unnest($1::text[], $2::text[], $3::text[]) AS t(k, l, d)
         ON CONFLICT (key, locale) DO UPDATE SET
           has_draft = site_texts.published IS DISTINCT FROM EXCLUDED.draft,
           draft = CASE WHEN site_texts.published IS DISTINCT FROM EXCLUDED.draft
                        THEN EXCLUDED.draft END,
           updated_at = now()`,
        [
          list.map((c) => c.key),
          list.map((c) => c.locale),
          list.map((c) => c.value),
        ],
      );
      await run(
        `DELETE FROM site_texts WHERE published IS NULL AND NOT has_draft`,
      );
    },
    async publishTexts() {
      const rows = await run(
        `UPDATE site_texts SET published = draft, draft = NULL, has_draft = false,
           updated_at = now() WHERE has_draft RETURNING key`,
      );
      await run(
        `DELETE FROM site_texts WHERE published IS NULL AND NOT has_draft`,
      );
      return rows.length;
    },
    async discardTextDrafts() {
      const rows = await run(
        `UPDATE site_texts SET draft = NULL, has_draft = false, updated_at = now()
         WHERE has_draft RETURNING key`,
      );
      await run(
        `DELETE FROM site_texts WHERE published IS NULL AND NOT has_draft`,
      );
      return rows.length;
    },
    async getSitePhotos() {
      const rows = await run(
        `SELECT slot, published, draft, has_draft, updated_at FROM site_photos`,
      );
      return rows.map((row) => ({
        slot: row.slot as SitePhotoSlot,
        published: json(row.published),
        draft: json(row.draft),
        hasDraft: Boolean(row.has_draft),
        updatedAt: iso(row.updated_at)!,
      }));
    },
    async saveSitePhotoDrafts(changes) {
      for (const { slot, photo } of changes) {
        const value = photo === null ? null : JSON.stringify(photo);
        await run(
          `INSERT INTO site_photos (slot, draft, has_draft)
           VALUES ($1, $2::jsonb, $2::jsonb IS NOT NULL)
           ON CONFLICT (slot) DO UPDATE SET
             has_draft = site_photos.published IS DISTINCT FROM EXCLUDED.draft,
             draft = CASE WHEN site_photos.published IS DISTINCT FROM EXCLUDED.draft
                          THEN EXCLUDED.draft END,
             updated_at = now()`,
          [slot, value],
        );
      }
      await run(
        `DELETE FROM site_photos WHERE published IS NULL AND NOT has_draft`,
      );
    },
    async publishSitePhotos() {
      const rows = await run(
        `UPDATE site_photos SET published = draft, draft = NULL, has_draft = false,
           updated_at = now() WHERE has_draft RETURNING slot`,
      );
      await run(
        `DELETE FROM site_photos WHERE published IS NULL AND NOT has_draft`,
      );
      return rows.length;
    },
    async discardSitePhotoDrafts() {
      const rows = await run(
        `UPDATE site_photos SET draft = NULL, has_draft = false, updated_at = now()
         WHERE has_draft RETURNING slot`,
      );
      await run(
        `DELETE FROM site_photos WHERE published IS NULL AND NOT has_draft`,
      );
      return rows.length;
    },
  };
}
