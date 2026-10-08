import { neon } from "@neondatabase/serverless";
import { join } from "node:path";
import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import type { Store } from "./types";

export type {
  SitePhotoChange,
  SitePhotoRow,
  Store,
  TextChange,
  TextRow,
} from "./types";

const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Postgres when a database is connected; a local JSON file anywhere except
// on Vercel, whose filesystem is read-only; otherwise nothing, so the public
// site still renders its built-in texts and an empty catalogue.
export function storeKind(): "postgres" | "file" | null {
  if (databaseUrl()) return "postgres";
  return process.env.VERCEL ? null : "file";
}

let store: Store | null | undefined;
export function getStore(): Store | null {
  if (store !== undefined) return store;
  const kind = storeKind();
  if (kind === "postgres") {
    const sql = neon(databaseUrl()!);
    store = postgresStore(
      (text, params) =>
        sql.query(text, params) as Promise<Record<string, unknown>[]>,
    );
  } else if (kind === "file") {
    store = fileStore(localDataDir());
  } else store = null;
  return store;
}

export function localDataDir() {
  return process.env.LOCAL_DATA_DIR || join(process.cwd(), ".data");
}
