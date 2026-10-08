"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  Eye,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Undo2,
  Upload,
} from "lucide-react";
import {
  discardSitePhotos,
  publishSitePhotos,
  saveSitePhotos,
  type SitePhotosResult,
} from "@/app/admin/actions";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";
import {
  sitePhotoSlotNames,
  sitePhotoSlots,
  type SitePhoto,
  type SitePhotoSlot,
} from "@/lib/site-photo-slots";
import type { SitePhotoRow } from "@/lib/store/types";
import { uploadError, uploadPhoto } from "./photo-manager";

const altLocales: [Locale, string][] = [
  ["ka", "ქართული"],
  ["en", "English"],
  ["ru", "Русский"],
];
// The page each spot is on, for previews.
const pageOf = (slot: SitePhotoSlot) => (slot === "dealer" ? "/dealers" : "/");

// Compares photos regardless of key order or blank descriptions (the
// database may reorder keys; the server drops blanks).
const key = (photo: SitePhoto | null | undefined) =>
  JSON.stringify(
    photo
      ? [
          photo.url,
          photo.width,
          photo.height,
          Math.round(photo.focusX),
          Math.round(photo.focusY),
          altLocales.map(([l]) => photo.alt[l]?.trim() || ""),
        ]
      : null,
  );

// The text a shared link shows under its image, for the preview.
type ShareText = { host: string; title: string; description: string };

export function SitePhotosEditor({
  lang,
  initialRows,
  canUpload,
  share,
}: {
  lang: AdminLang;
  initialRows: SitePhotoRow[];
  canUpload: boolean;
  share: ShareText;
}) {
  const t = adminTranslator(lang);
  const [rows, setRows] = useState(initialRows);
  // Unsaved changes per spot; null means "back to the built-in photo".
  const [edits, setEdits] = useState<
    Partial<Record<SitePhotoSlot, SitePhoto | null>>
  >({});
  const [uploading, setUploading] = useState<SitePhotoSlot | null>(null);
  const [errors, setErrors] = useState<Partial<Record<SitePhotoSlot, string>>>(
    {},
  );
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [busy, start] = useTransition();
  // Files uploaded in this session, so unused ones can be deleted on save.
  const uploaded = useRef(new Set<string>());

  const row = (slot: SitePhotoSlot) => rows.find((r) => r.slot === slot);
  const saved = (slot: SitePhotoSlot) => {
    const r = row(slot);
    return (r?.hasDraft ? r.draft : r?.published) ?? null;
  };
  const current = (slot: SitePhotoSlot) =>
    slot in edits ? (edits[slot] ?? null) : saved(slot);
  const isDirty = (slot: SitePhotoSlot) =>
    slot in edits && key(edits[slot]) !== key(saved(slot));
  const dirty = sitePhotoSlotNames.filter(isDirty);
  const pending = rows.filter((r) => r.hasDraft);

  useEffect(() => {
    if (!dirty.length && !uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length, uploading]);

  const edit = (slot: SitePhotoSlot, photo: SitePhoto | null) =>
    setEdits((all) => ({ ...all, [slot]: photo }));
  const undo = (slot: SitePhotoSlot) =>
    setEdits((all) => {
      const next = { ...all };
      delete next[slot];
      return next;
    });

  async function upload(slot: SitePhotoSlot, file: File | undefined) {
    if (!file) return;
    setErrors((all) => ({ ...all, [slot]: undefined }));
    if (!file.type.startsWith("image/")) {
      setErrors((all) => ({
        ...all,
        [slot]: "This file could not be read. Use a JPG, PNG or WebP photo.",
      }));
      return;
    }
    setUploading(slot);
    try {
      const photo = await uploadPhoto(file, "site");
      uploaded.current.add(photo.url);
      edit(slot, { ...photo, focusX: 50, focusY: 50, alt: {} });
    } catch (err) {
      setErrors((all) => ({ ...all, [slot]: uploadError(err) }));
    } finally {
      setUploading(null);
    }
  }

  // Uploaded in this session but not about to be saved.
  const abandoned = () => {
    const kept = new Set(sitePhotoSlotNames.map((slot) => current(slot)?.url));
    return [...uploaded.current].filter((url) => !kept.has(url));
  };
  function run(
    action: () => Promise<SitePhotosResult>,
    success: (count?: number) => string,
  ) {
    setMessage(null);
    start(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage({ ok: false, text: t(result.error) });
        return;
      }
      uploaded.current = new Set();
      setRows(result.rows);
      setEdits({});
      setMessage({ ok: true, text: success(result.count) });
    });
  }
  const changes = () => dirty.map((slot) => ({ slot, photo: current(slot) }));
  const save = () =>
    run(
      () => saveSitePhotos(changes(), abandoned()),
      () => t("Saved as drafts. Preview them, then publish."),
    );
  const publish = () => {
    if (!window.confirm(t("Publish all photo changes to the live site?")))
      return;
    run(
      async () => {
        if (dirty.length) {
          const result = await saveSitePhotos(changes(), abandoned());
          if (!result.ok) return result;
        }
        return publishSitePhotos();
      },
      () => t("Published. Visitors now see the new photos."),
    );
  };
  const discard = () => {
    if (!window.confirm(t("Discard all unpublished photo changes?"))) return;
    run(
      () => discardSitePhotos([...uploaded.current]),
      () => t("Unpublished changes were discarded."),
    );
  };

  const previewBase = lang === "ka" ? "/ka" : "";
  const previewPage = pageOf(pending[0]?.slot ?? "hero");
  const previewPath =
    previewPage === "/" ? previewBase || "/" : previewBase + previewPage;

  return (
    <div className="site-photos">
      <div className="texts-bar">
        <p className="texts-status" role="status" aria-live="polite">
          {message ? (
            <span className={message.ok ? "is-ok" : "is-error"}>
              {message.text}
            </span>
          ) : (
            <>
              {dirty.length > 0 && (
                <span className="is-unsaved">
                  {t("Not saved")}: {dirty.length}
                </span>
              )}
              <span>
                {t("Unpublished changes")}: {pending.length}
              </span>
            </>
          )}
        </p>
        <div className="texts-actions">
          <button
            type="button"
            className="button"
            disabled={busy || !!uploading || !dirty.length}
            onClick={save}
          >
            {t("Save drafts")}
          </button>
          <a
            className={`button button-light${pending.length ? "" : " is-disabled"}`}
            href={`/api/admin/preview?path=${encodeURIComponent(previewPath)}`}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!pending.length}
            title={
              pending.length
                ? undefined
                : t("Save drafts first to preview them.")
            }
          >
            <Eye size={16} aria-hidden="true" />
            {t("Preview")}
          </a>
          <button
            type="button"
            className="button button-orange"
            disabled={busy || !!uploading || (!pending.length && !dirty.length)}
            onClick={publish}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {t("Publish")}
          </button>
          {pending.length > 0 && (
            <button
              type="button"
              className="link-button"
              disabled={busy}
              onClick={discard}
            >
              {t("Discard unpublished changes")}
            </button>
          )}
        </div>
      </div>
      {!canUpload && (
        <p className="admin-notice">
          {t(
            "Photo storage is not connected yet, so photos cannot be uploaded.",
          )}
        </p>
      )}
      {sitePhotoSlotNames.map((slot) => (
        <SlotCard
          key={slot}
          slot={slot}
          photo={current(slot)}
          state={
            isDirty(slot)
              ? ["unsaved", "Not saved"]
              : row(slot)?.hasDraft
                ? ["draft", "Draft, not published"]
                : row(slot)?.published
                  ? ["edited", "Your photo is live"]
                  : ["original", "Original photo"]
          }
          builtInSrc={
            slot === "share"
              ? `/images/share/logistic-hub-${lang}.jpg`
              : sitePhotoSlots[slot].src
          }
          share={share}
          canUndo={isDirty(slot)}
          uploading={uploading === slot}
          canUpload={canUpload && !uploading && !busy}
          error={errors[slot]}
          t={t}
          onUpload={(file) => upload(slot, file)}
          onChange={(photo) => edit(slot, photo)}
          onUndo={() => undo(slot)}
        />
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  photo,
  state,
  builtInSrc,
  share,
  canUndo,
  uploading,
  canUpload,
  error,
  t,
  onUpload,
  onChange,
  onUndo,
}: {
  slot: SitePhotoSlot;
  photo: SitePhoto | null;
  state: [string, string];
  builtInSrc: string;
  share: ShareText;
  canUndo: boolean;
  uploading: boolean;
  canUpload: boolean;
  error?: string;
  t: (source: string) => string;
  onUpload: (file: File | undefined) => void;
  onChange: (photo: SitePhoto | null) => void;
  onUndo: () => void;
}) {
  const spot = sitePhotoSlots[slot];
  const input = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const src = photo?.url ?? builtInSrc;
  const focus = (device: "desktop" | "phone") =>
    photo ? `${photo.focusX}% ${photo.focusY}%` : spot.builtInFocus[device];
  const setFocus = (x: number, y: number) =>
    photo &&
    onChange({
      ...photo,
      focusX: Math.min(100, Math.max(0, Math.round(x))),
      focusY: Math.min(100, Math.max(0, Math.round(y))),
    });
  const heading = `photo-${slot}`;

  return (
    <section
      className="site-photo"
      data-state={state[0]}
      aria-labelledby={heading}
      onDragOver={(e) => {
        if (!canUpload) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (!canUpload) return;
        e.preventDefault();
        setDragOver(false);
        onUpload(e.dataTransfer.files[0]);
      }}
    >
      <header className="site-photo-head">
        <div>
          <h2 id={heading}>{t(spot.title)}</h2>
          <p className="admin-hint">{t(spot.where)}</p>
        </div>
        <em className="site-photo-state">{t(state[1])}</em>
      </header>
      <div className={`site-photo-body${dragOver ? " is-over" : ""}`}>
        {spot.phone === null ? (
          // A link as a chat app shows it; layouts differ a little by app.
          <figure className="share-preview">
            <div
              className="site-photo-frame"
              style={{ aspectRatio: spot.desktop }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="520px"
                style={{ objectPosition: focus("desktop") }}
              />
              {uploading && (
                <span className="site-photo-busy" role="status">
                  <LoaderCircle className="spin" size={22} aria-hidden="true" />
                  {t("Uploading…")}
                </span>
              )}
            </div>
            <figcaption>
              <small>{share.host}</small>
              <strong>{share.title}</strong>
              <span>{share.description}</span>
            </figcaption>
            <p className="admin-hint">
              {t(
                "The title and description come from Site texts: the site-wide section and each page’s own texts.",
              )}
            </p>
          </figure>
        ) : (
          <div className="site-photo-previews">
            {(["desktop", "phone"] as const).map((device) => (
              <figure key={device} className={`is-${device}`}>
                <div
                  className={`site-photo-frame shade-${spot.shade ?? "none"}`}
                  style={{ aspectRatio: spot[device] }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes={device === "desktop" ? "520px" : "140px"}
                    style={{ objectPosition: focus(device) }}
                  />
                  {uploading && (
                    <span className="site-photo-busy" role="status">
                      <LoaderCircle
                        className="spin"
                        size={22}
                        aria-hidden="true"
                      />
                      {device === "desktop" && t("Uploading…")}
                    </span>
                  )}
                </div>
                <figcaption>
                  {t(device === "desktop" ? "On a computer" : "On a phone")}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="site-photo-side">
          {photo ? (
            <fieldset className="site-photo-focus">
              <legend>{t("Focus point")}</legend>
              <p className="admin-hint">
                {t(
                  "Click the main subject in the photo. That point stays in view on every screen size.",
                )}
              </p>
              <div
                className="focus-picker"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                onClick={(e) => {
                  const box = e.currentTarget.getBoundingClientRect();
                  setFocus(
                    ((e.clientX - box.left) / box.width) * 100,
                    ((e.clientY - box.top) / box.height) * 100,
                  );
                }}
              >
                <Image src={photo.url} alt="" fill sizes="320px" />
                <span
                  className="focus-marker"
                  style={{ left: `${photo.focusX}%`, top: `${photo.focusY}%` }}
                />
              </div>
              <div className="focus-sliders">
                <label>
                  {t("Left to right")}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={photo.focusX}
                    onChange={(e) => setFocus(+e.target.value, photo.focusY)}
                  />
                </label>
                <label>
                  {t("Top to bottom")}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={photo.focusY}
                    onChange={(e) => setFocus(photo.focusX, +e.target.value)}
                  />
                </label>
              </div>
            </fieldset>
          ) : (
            <p className="admin-hint">
              {t(
                "The site shows its original photo here. Upload your own to replace it.",
              )}
            </p>
          )}
          <div className="site-photo-upload">
            <button
              type="button"
              className="button button-light"
              disabled={!canUpload}
              onClick={() => input.current?.click()}
            >
              <ImagePlus size={16} aria-hidden="true" />
              {t(photo ? "Choose another photo" : "Upload a new photo")}
            </button>
            <input
              ref={input}
              type="file"
              accept="image/*"
              hidden
              aria-label={`${t("Upload a new photo")}: ${t(spot.title)}`}
              onChange={(e) => {
                onUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <p className="admin-hint">{t(spot.advice)}</p>
            {photo && photo.width < spot.minWidth && (
              <p className="is-unsaved">
                {t(
                  "This photo is small and may look blurry on large screens. Use a larger one if you have it.",
                )}
              </p>
            )}
            {error && (
              <p className="field-error" role="alert">
                {t(error)}
              </p>
            )}
            <div className="site-photo-links">
              {photo && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => onChange(null)}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  {t("Restore the original photo")}
                </button>
              )}
              {canUndo && (
                <button type="button" className="link-button" onClick={onUndo}>
                  <Undo2 size={13} aria-hidden="true" />
                  {t("Undo unsaved changes")}
                </button>
              )}
            </div>
          </div>
          {photo && (
            <fieldset className="site-photo-alt">
              <legend>{t("Photo description")}</legend>
              <p className="admin-hint">
                {t(
                  "A short description for people who cannot see the photo and for search engines. Write it in at least one language.",
                )}
              </p>
              {altLocales.map(([locale, name]) => (
                <label key={locale}>
                  <span className="text-label">{name}</span>
                  <input
                    lang={locale}
                    maxLength={300}
                    value={photo.alt[locale] ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...photo,
                        alt: { ...photo.alt, [locale]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
            </fieldset>
          )}
        </div>
      </div>
    </section>
  );
}
