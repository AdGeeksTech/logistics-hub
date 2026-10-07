"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  Eye,
  LoaderCircle,
  RotateCcw,
  Search,
  Upload,
} from "lucide-react";
import { discardTexts, publishTexts, saveTexts } from "@/app/admin/actions";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";
import { defaultText, type Locale } from "@/lib/i18n";
import type { TextRow } from "@/lib/store/types";
import { textSections } from "@/lib/text-catalog";

const fieldLocales: [Locale, string][] = [
  ["ka", "ქართული"],
  ["en", "English"],
  ["ru", "Русский"],
];
// The page each section appears on, for previews.
function previewPath(title: string) {
  if (title.startsWith("Dealers")) return "/dealers";
  if (title.startsWith("Fee calculator")) return "/calculator";
  if (title.startsWith("Car")) return "/cars";
  if (title.startsWith("Inquiry")) return "/#inquiry";
  return "/";
}
const id = (locale: Locale, key: string) => `${locale}\n${key}`;

export function TextsEditor({
  lang,
  initialRows,
}: {
  lang: AdminLang;
  initialRows: TextRow[];
}) {
  const t = adminTranslator(lang);
  const [rows, setRows] = useState(initialRows);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [section, setSection] = useState(0);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [busy, start] = useTransition();

  const rowMap = useMemo(
    () => new Map(rows.map((r) => [id(r.locale, r.key), r])),
    [rows],
  );
  // What the editor shows before any typing: the saved draft, else the
  // published edit, else the site's original wording.
  const saved = (locale: Locale, key: string) => {
    const row = rowMap.get(id(locale, key));
    return (
      (row?.hasDraft ? row.draft : row?.published) ?? defaultText(locale, key)
    );
  };
  const dirty = Object.entries(edits).filter(([k, v]) => {
    const [locale, key] = k.split("\n") as [Locale, string];
    return v !== saved(locale, key);
  });
  const pending = rows.filter((r) => r.hasDraft).length;

  useEffect(() => {
    if (!dirty.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length]);

  const search = query.trim().toLowerCase();
  const visible = search
    ? textSections
        .map((s) => ({
          ...s,
          // Matches the current and the original wording, so a text
          // stays in view while it is being edited.
          keys: s.keys.filter((key) =>
            fieldLocales.some(([locale]) =>
              [
                edits[id(locale, key)] ?? saved(locale, key),
                defaultText(locale, key),
              ].some((text) => text.toLowerCase().includes(search)),
            ),
          ),
        }))
        .filter((s) => s.keys.length)
    : [textSections[section]];

  const changes = () =>
    dirty.map(([k, value]) => {
      const [locale, key] = k.split("\n");
      return { key, locale, value };
    });
  function run(
    action: () => Promise<
      | { ok: true; rows: TextRow[]; count?: number }
      | { ok: false; error: string }
    >,
    success: (count?: number) => string,
  ) {
    setMessage(null);
    start(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage({ ok: false, text: t(result.error) });
        return;
      }
      setRows(result.rows);
      setEdits({});
      setMessage({ ok: true, text: success(result.count) });
    });
  }
  const save = () =>
    run(
      () => saveTexts(changes()),
      () => t("Saved as drafts. Preview them, then publish."),
    );
  const publish = () => {
    if (!window.confirm(t("Publish all text changes to the live site?")))
      return;
    run(
      async () => {
        if (dirty.length) {
          const result = await saveTexts(changes());
          if (!result.ok) return result;
        }
        return publishTexts();
      },
      () => t("Published. Visitors now see the new texts."),
    );
  };
  const discard = () => {
    if (!window.confirm(t("Discard all unpublished text changes?"))) return;
    run(discardTexts, () => t("Unpublished changes were discarded."));
  };

  const status = (locale: Locale, key: string) => {
    const k = id(locale, key);
    const row = rowMap.get(k);
    if (k in edits && edits[k] !== saved(locale, key))
      return ["unsaved", "Not saved"];
    if (row?.hasDraft) return ["draft", "Draft, not published"];
    if (row?.published != null) return ["edited", "Edited"];
    return null;
  };
  const sectionChanges = (keys: string[]) =>
    keys.reduce(
      (n, key) =>
        n +
        fieldLocales.filter(([locale]) => {
          const k = id(locale, key);
          return (
            rowMap.get(k)?.hasDraft ||
            (k in edits && edits[k] !== saved(locale, key))
          );
        }).length,
      0,
    );
  const sectionMenu = useRef<HTMLDetailsElement>(null);
  const sectionList = () => (
    <ul>
      {textSections.map((s, i) => {
        const count = sectionChanges(s.keys);
        return (
          <li key={s.title}>
            <button
              type="button"
              aria-current={!search && i === section}
              onClick={() => {
                setSection(i);
                setQuery("");
                if (sectionMenu.current) sectionMenu.current.open = false;
              }}
            >
              {t(s.title)}
              {count > 0 && <span>{count}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
  const previewBase = lang === "ka" ? "/ka" : "";
  const previewTarget = previewPath(visible[0]?.title ?? "");

  return (
    <div className="texts-editor">
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
                {t("Unpublished changes")}: {pending}
              </span>
            </>
          )}
        </p>
        <div className="texts-actions">
          <button
            type="button"
            className="button"
            disabled={busy || !dirty.length}
            onClick={save}
          >
            {t("Save drafts")}
          </button>
          <a
            className={`button button-light${pending ? "" : " is-disabled"}`}
            href={`/api/admin/preview?path=${encodeURIComponent(
              previewTarget === "/"
                ? previewBase || "/"
                : previewBase + previewTarget,
            )}`}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!pending}
            title={
              pending ? undefined : t("Save drafts first to preview them.")
            }
          >
            <Eye size={16} aria-hidden="true" />
            {t("Preview")}
          </a>
          <button
            type="button"
            className="button button-orange"
            disabled={busy || (!pending && !dirty.length)}
            onClick={publish}
          >
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {t("Publish")}
          </button>
          {pending > 0 && (
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
      <div className="texts-layout">
        <nav className="texts-sections" aria-label={t("Sections")}>
          <label className="texts-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search all texts")}
              aria-label={t("Search all texts")}
            />
          </label>
          {/* Phones and tablets: the section list folds into a menu whose
              summary can wrap long section names. */}
          <details className="texts-section-menu" ref={sectionMenu}>
            <summary>
              <span>
                {search
                  ? t("Search all texts")
                  : t(textSections[section].title)}
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {sectionList()}
          </details>
          {sectionList()}
        </nav>
        <div className="texts-list">
          {visible.length === 0 && (
            <p className="admin-empty">{t("No texts match.")}</p>
          )}
          {visible.map((s) => (
            <section key={s.title} aria-label={t(s.title)}>
              <h2>{t(s.title)}</h2>
              {s.note && <p className="admin-hint texts-note">{t(s.note)}</p>}
              {s.keys.map((key) => (
                <div className="text-item" key={key}>
                  {fieldLocales.map(([locale, name]) => {
                    const k = id(locale, key);
                    const value = edits[k] ?? saved(locale, key);
                    const original = defaultText(locale, key);
                    const state = status(locale, key);
                    return (
                      <label
                        key={locale}
                        className={state ? `is-${state[0]}` : undefined}
                      >
                        <span className="text-label">
                          {name}
                          {state && <em>{t(state[1])}</em>}
                        </span>
                        <textarea
                          lang={locale}
                          value={value}
                          rows={Math.min(
                            8,
                            Math.max(1, Math.ceil(value.length / 70)),
                          )}
                          maxLength={3000}
                          onChange={(e) =>
                            setEdits((all) => ({ ...all, [k]: e.target.value }))
                          }
                        />
                        {value !== original && (
                          <button
                            type="button"
                            className="link-button"
                            onClick={() =>
                              setEdits((all) => ({ ...all, [k]: original }))
                            }
                          >
                            <RotateCcw size={13} aria-hidden="true" />
                            {t("Restore the original")}
                          </button>
                        )}
                      </label>
                    );
                  })}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
