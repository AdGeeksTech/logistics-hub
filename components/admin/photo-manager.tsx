"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
} from "lucide-react";
import { maxPhotos, type Photo } from "@/lib/cars";

// Resizes in the browser so phone photos (often 5–15 MB) upload quickly
// and stay under the upload limit. EXIF orientation is applied.
async function prepare(file: File, maxEdge: number) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, quality),
    );
  let blob = await encode("image/webp", 0.82);
  // Older Safari cannot encode WebP and silently returns PNG.
  if (!blob || blob.type !== "image/webp")
    blob = await encode("image/jpeg", 0.85);
  if (!blob) throw new Error("encode");
  return { blob, width, height };
}

// Listing photos keep 1920px; the full-width site photos 2400px.
export async function uploadPhoto(
  file: File,
  folder: "cars" | "site" = "cars",
): Promise<Photo> {
  const { blob, width, height } = await prepare(
    file,
    folder === "site" ? 2400 : 1920,
  );
  const body = new FormData();
  body.set("file", new File([blob], "photo", { type: blob.type }));
  body.set("width", String(width));
  body.set("height", String(height));
  body.set("folder", folder);
  const response = await fetch("/api/admin/photos", { method: "POST", body });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.error || "Upload failed. Try again.");
  return result as Photo;
}

// Decoding failures (e.g. HEIC in Chrome) surface as DOMException; a
// dropped connection as TypeError; the server sends its own message.
export const uploadError = (err: unknown) =>
  err instanceof DOMException ||
  (err instanceof Error && err.message === "encode")
    ? "This file could not be read. Use a JPG, PNG or WebP photo."
    : err instanceof TypeError || !(err instanceof Error)
      ? "Upload failed. Try again."
      : err.message;

type Pending = { key: string; name: string; error?: string };

export function PhotoManager({
  photos,
  onChange,
  t,
  enabled,
  error,
}: {
  photos: Photo[];
  onChange: (update: (photos: Photo[]) => Photo[]) => void;
  t: (source: string) => string;
  enabled: boolean;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const dragged = useRef<number | null>(null);
  // Selection order of every uploaded photo, by URL. Uploads finish in any
  // order; photos chosen together are kept in the order they were picked.
  const picked = useRef(new Map<string, number>());

  async function upload(file: File, key: string, order: number) {
    try {
      const result = await uploadPhoto(file);
      picked.current.set(result.url, order);
      onChange((list) => {
        const next = [...list, result];
        const slots = next.flatMap((p, i) =>
          picked.current.has(p.url) ? [i] : [],
        );
        const ordered = slots
          .map((i) => next[i])
          .sort(
            (a, b) => picked.current.get(a.url)! - picked.current.get(b.url)!,
          );
        slots.forEach((slot, k) => (next[slot] = ordered[k]));
        return next.slice(0, maxPhotos);
      });
      setPending((list) => list.filter((p) => p.key !== key));
    } catch (err) {
      setPending((list) =>
        list.map((p) =>
          p.key === key ? { ...p, error: uploadError(err) } : p,
        ),
      );
    }
  }

  async function add(files: FileList | File[]) {
    const room =
      maxPhotos - photos.length - pending.filter((p) => !p.error).length;
    const chosen = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    // A fresh batch: photos from earlier batches keep their places.
    picked.current = new Map();
    const items = chosen.map((file, order) => ({
      file,
      order,
      key: `${Date.now()}-${Math.random()}`,
    }));
    setPending((list) => [
      ...list.filter((p) => !p.error),
      ...items.map(({ file, key }) => ({ key, name: file.name })),
    ]);
    for (let i = 0; i < items.length; i += 3)
      await Promise.all(
        items
          .slice(i, i + 3)
          .map((item) => upload(item.file, item.key, item.order)),
      );
  }

  const move = (from: number, to: number) =>
    onChange((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });

  return (
    <div className="photo-manager">
      {!enabled && (
        <p className="admin-notice">
          {t(
            "Photo storage is not connected yet, so photos cannot be uploaded.",
          )}
        </p>
      )}
      <ul className="photo-grid" aria-label={t("Photos")}>
        {photos.map((photo, i) => (
          <li
            key={photo.url}
            draggable
            onDragStart={() => (dragged.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragged.current !== null) move(dragged.current, i);
              dragged.current = null;
            }}
            className={i === 0 ? "is-cover" : undefined}
          >
            <Image
              src={photo.url}
              alt={`${t("Photo")} ${i + 1}`}
              fill
              sizes="200px"
            />
            {i === 0 && <span className="cover-badge">{t("Cover")}</span>}
            <div className="photo-tools">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`${t("Move earlier")}: ${t("Photo")} ${i + 1}`}
              >
                <ArrowLeft size={16} />
              </button>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => move(i, 0)}
                  aria-label={`${t("Make cover photo")}: ${t("Photo")} ${i + 1}`}
                >
                  <Star size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === photos.length - 1}
                aria-label={`${t("Move later")}: ${t("Photo")} ${i + 1}`}
              >
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="photo-remove"
                onClick={() =>
                  onChange((list) => list.filter((p) => p.url !== photo.url))
                }
                aria-label={`${t("Remove")}: ${t("Photo")} ${i + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
        {pending.map((item) => (
          <li
            key={item.key}
            className={item.error ? "is-failed" : "is-uploading"}
          >
            {item.error ? (
              <p role="alert">
                <strong>{item.name}</strong>
                {t(item.error)}
              </p>
            ) : (
              <span role="status">
                <LoaderCircle className="spin" size={22} aria-hidden="true" />
                {t("Uploading…")}
              </span>
            )}
          </li>
        ))}
      </ul>
      {/* The whole box opens the file picker: phones cannot drag. The
          inner button keeps it reachable by keyboard. */}
      <div
        className={`photo-drop${dragOver ? " is-over" : ""}${enabled ? " is-enabled" : ""}`}
        onClick={(e) => {
          if (
            enabled &&
            photos.length < maxPhotos &&
            e.target === e.currentTarget
          )
            input.current?.click();
        }}
        onDragOver={(e) => {
          if (dragged.current !== null || !enabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (dragged.current !== null || !enabled) return;
          e.preventDefault();
          setDragOver(false);
          add(e.dataTransfer.files);
        }}
      >
        <ImagePlus size={28} aria-hidden="true" />
        <p>
          {t("Drag photos here, or")}{" "}
          <button
            type="button"
            className="link-button"
            disabled={!enabled || photos.length >= maxPhotos}
            onClick={() => input.current?.click()}
          >
            {t("choose files")}
          </button>
        </p>
        <span>
          {t(
            "Up to 30 photos. The first photo is the cover. Drag photos to reorder them.",
          )}
        </span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}
