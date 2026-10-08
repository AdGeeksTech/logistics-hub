import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { localDataDir } from "./store";

// Listing photos live in Vercel Blob in production. Elsewhere they are
// written under the local data directory and served by /api/uploads.
export function photoStorageKind(): "blob" | "file" | null {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
    return "blob";
  return process.env.VERCEL ? null : "file";
}

export const photoTypes = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
} as const;
export type PhotoType = keyof typeof photoTypes;
const uploads = () => join(localDataDir(), "uploads");
const localName = /^\/api\/uploads\/([0-9a-f-]{36}\.(?:webp|jpg))$/;

// Listing photos go in cars/, the site's own photos in site/.
export async function savePhoto(
  bytes: Buffer,
  type: PhotoType,
  folder: "cars" | "site" = "cars",
) {
  const name = `${randomUUID()}.${photoTypes[type]}`;
  if (photoStorageKind() === "blob") {
    const blob = await put(`${folder}/${name}`, bytes, {
      access: "public",
      contentType: type,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }
  await mkdir(uploads(), { recursive: true });
  await writeFile(join(uploads(), name), bytes);
  return `/api/uploads/${name}`;
}

export async function readLocalPhoto(name: string) {
  if (!localName.test(`/api/uploads/${name}`)) return null;
  try {
    return await readFile(join(uploads(), name));
  } catch {
    return null;
  }
}

export async function deletePhotos(urls: string[]) {
  const blobs = urls.filter((url) =>
    /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(url),
  );
  try {
    if (blobs.length && photoStorageKind() === "blob") await del(blobs);
    for (const url of urls) {
      const match = localName.exec(url);
      if (match) await unlink(join(uploads(), match[1])).catch(() => {});
    }
  } catch (error) {
    // A leftover file costs a little storage; it must not block the save.
    console.error("Could not delete listing photos", error);
  }
}
