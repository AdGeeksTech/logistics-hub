"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Car, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Photo } from "@/lib/cars";
import type { Locale } from "@/lib/i18n";
import { useT } from "@/components/texts-provider";

export function CarGallery({
  photos,
  alt,
  locale,
}: {
  photos: Photo[];
  alt: string;
  locale: Locale;
}) {
  const t = useT(locale);
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<number | null>(null);
  const count = photos.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  // Keeps the current thumbnail in view by scrolling the strip sideways
  // only; scrollIntoView would also move the page.
  useEffect(() => {
    const thumb = thumbs.current[index];
    const strip = thumb?.parentElement;
    if (!thumb || !strip) return;
    const offset =
      thumb.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    if (offset < 0 || offset + thumb.offsetWidth > strip.clientWidth)
      strip.scrollBy({
        left: offset - (strip.clientWidth - thumb.offsetWidth) / 2,
        behavior: "smooth",
      });
  }, [index]);
  if (!count)
    return (
      <div className="gallery-main gallery-empty">
        <Car size={56} aria-hidden="true" />
      </div>
    );
  const photo = photos[index];
  const swipeHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      swipe.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      const start = swipe.current;
      swipe.current = null;
      if (start !== null && Math.abs(e.clientX - start) > 40)
        go(e.clientX < start ? 1 : -1);
    },
  };
  const arrows = count > 1 && (
    <>
      <button
        type="button"
        className="gallery-arrow previous"
        aria-label={t("Previous photo")}
        onClick={() => go(-1)}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        className="gallery-arrow next"
        aria-label={t("Next photo")}
        onClick={() => go(1)}
      >
        <ChevronRight />
      </button>
    </>
  );
  return (
    <div className="car-gallery">
      <div className="gallery-main" {...swipeHandlers}>
        <Image
          src={photo.url}
          alt={`${alt} — ${t("photo")} ${index + 1}`}
          fill
          priority={index === 0}
          sizes="(max-width: 1050px) 100vw, 760px"
          draggable={false}
        />
        <button
          type="button"
          className="gallery-expand"
          aria-label={t("Open full-screen photo")}
          onClick={() => dialog.current?.showModal()}
        >
          <Expand size={18} />
        </button>
        {arrows}
        <span className="gallery-count" aria-live="polite">
          {index + 1} / {count}
        </span>
      </div>
      {count > 1 && (
        <div className="gallery-thumbs">
          {photos.map((p, i) => (
            <button
              type="button"
              key={p.url}
              ref={(node) => {
                thumbs.current[i] = node;
              }}
              aria-label={`${t("Show photo")} ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              <Image src={p.url} alt="" fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={alt}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="gallery-dialog-frame" {...swipeHandlers}>
          <Image
            src={photo.url}
            alt={`${alt} — ${t("photo")} ${index + 1}`}
            fill
            sizes="100vw"
            draggable={false}
          />
          {arrows}
          <span className="gallery-count">
            {index + 1} / {count}
          </span>
        </div>
        <button
          type="button"
          className="gallery-close"
          aria-label={t("Close")}
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
      </dialog>
    </div>
  );
}
