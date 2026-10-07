"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUpRight, Copy, Eye, LoaderCircle, Trash2 } from "lucide-react";
import {
  deleteListing,
  duplicateListing,
  saveListing,
} from "@/app/admin/actions";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  bodyTypes,
  colors,
  conditions,
  doorOptions,
  drives,
  featureGroups,
  fuelTypes,
  gearboxes,
  interiorMaterials,
  listingSlug,
  locations,
  makeSuggestions,
  priceTermsOptions,
  rangeStandards,
  statuses,
  steeringSides,
  type FieldErrors,
  type Listing,
  type ListingFields,
  type Photo,
  type Status,
} from "@/lib/cars";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";

const numberFields = [
  "year",
  "mileage",
  "engineVolume",
  "cylinders",
  "powerHp",
  "batteryKwh",
  "rangeKm",
  "seats",
  "airbags",
  "price",
] as const;
type NumberField = (typeof numberFields)[number];
type FormState = Omit<ListingFields, NumberField> & Record<NumberField, string>;

const toState = (fields: ListingFields): FormState => ({
  ...fields,
  ...(Object.fromEntries(
    numberFields.map((k) => [k, fields[k] === null ? "" : String(fields[k])]),
  ) as Record<NumberField, string>),
});
const electricRange = ["electric", "plugin", "erev"];
const hasBattery = [...electricRange, "hybrid"];

// Sends numbers as numbers and drops values that do not apply to the fuel
// type, so an EV never shows an engine volume left over from editing.
function toPayload(state: FormState) {
  const payload: Record<string, unknown> = { ...state };
  for (const key of numberFields)
    payload[key] =
      state[key].trim() === "" ? null : Number(state[key].replace(",", "."));
  if (state.fuel === "electric")
    payload.engineVolume = payload.cylinders = null;
  if (!hasBattery.includes(state.fuel)) payload.batteryKwh = null;
  if (!electricRange.includes(state.fuel))
    payload.rangeKm = payload.rangeStandard = null;
  return payload;
}

const statusHints: Record<Status, string> = {
  draft: "Only admins can see it.",
  available: "Visible on the site.",
  reserved: "Visible on the site, marked as reserved.",
  sold: "Shown only when visitors include sold cars.",
};

export function CarForm({
  lang,
  listing,
  initial,
  photoStorage,
  notice,
}: {
  lang: AdminLang;
  listing: Listing | null;
  initial: ListingFields;
  photoStorage: boolean;
  notice?: string;
}) {
  const t = adminTranslator(lang);
  const router = useRouter();
  const [state, setState] = useState(() => toState(initial));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(
    notice ? { ok: true, text: notice } : null,
  );
  const [dirty, setDirty] = useState(false);
  const [saving, startSaving] = useTransition();
  const [busy, startBusy] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const id = listing?.id ?? null;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const clearError = (key: keyof FieldErrors) =>
    setErrors((all) => {
      if (!all[key]) return all;
      const next = { ...all };
      delete next[key];
      return next;
    });
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    setDirty(true);
    clearError(key as keyof FieldErrors);
  }
  const setPhotos = (update: (photos: Photo[]) => Photo[]) => {
    setState((s) => ({ ...s, photos: update(s.photos) }));
    setDirty(true);
    clearError("photos");
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);
    startSaving(async () => {
      const result = await saveListing(id, toPayload(state));
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setFlash({
          ok: false,
          text: t(result.error ?? "Check the highlighted fields."),
        });
        requestAnimationFrame(() =>
          formRef.current
            ?.querySelector<HTMLElement>("[aria-invalid=true], .field-error")
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        );
        return;
      }
      setDirty(false);
      setErrors({});
      const text = t(
        result.listing.status === "draft"
          ? "Saved as a draft."
          : "Saved. The listing is live on the site.",
      );
      if (id === null) {
        router.replace(`/admin/cars/${result.listing.id}?created=1`);
      } else {
        setFlash({ ok: true, text });
        router.refresh();
      }
    });
  }

  // Range errors arrive as "template|min|max" so they translate cleanly.
  const message = (error: string) => {
    const [template, min, max] = error.split("|");
    return t(template).replace("{min}", min).replace("{max}", max);
  };
  const err = (key: keyof FieldErrors) =>
    errors[key] && (
      <span className="field-error" id={`${key}-error`}>
        {message(errors[key]!)}
      </span>
    );
  const field = (key: keyof FieldErrors) => ({
    name: key,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  const text = (
    key: "make" | "model" | "trim" | "vin",
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label>
      {t(label)}
      {!extra.required && <span className="optional"> {t("(optional)")}</span>}
      <input
        {...field(key)}
        {...extra}
        value={state[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {err(key)}
    </label>
  );
  const number = (
    key: NumberField,
    label: string,
    { required = false, step = 1, min = 0 } = {},
  ) => (
    <label>
      {t(label)}
      {!required && <span className="optional"> {t("(optional)")}</span>}
      <input
        {...field(key)}
        type="number"
        inputMode={step < 1 ? "decimal" : "numeric"}
        step={step}
        min={min}
        required={required}
        value={state[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {err(key)}
    </label>
  );
  const select = <K extends keyof FormState>(
    key: K,
    label: string,
    options: Record<string, string>,
    { optional = false, translate = true } = {},
  ) => (
    <label>
      {t(label)}
      {optional && <span className="optional"> {t("(optional)")}</span>}
      <select
        {...field(key as keyof FieldErrors)}
        value={(state[key] as string | null) ?? ""}
        onChange={(e) => set(key, (e.target.value || null) as FormState[K])}
      >
        {optional && <option value="">{t("Not specified")}</option>}
        {Object.entries(options).map(([value, name]) => (
          <option key={value} value={value}>
            {translate ? t(name) : name}
          </option>
        ))}
      </select>
      {err(key as keyof FieldErrors)}
    </label>
  );
  const toggle = <K extends "condition" | "steering">(
    key: K,
    label: string,
    options: Record<string, string>,
  ) => (
    <fieldset>
      <legend>{t(label)}</legend>
      <div className="audience-toggle">
        {Object.entries(options).map(([value, name]) => (
          <label key={value} className={state[key] === value ? "selected" : ""}>
            <input
              type="radio"
              name={key}
              value={value}
              checked={state[key] === value}
              onChange={() => set(key, value as FormState[K])}
            />
            {t(name)}
          </label>
        ))}
      </div>
    </fieldset>
  );

  const fuel = state.fuel;
  const publicPath = listing
    ? `/cars/${listingSlug({ ...listing, ...state, year: Number(state.year) || listing.year })}`
    : "";
  return (
    <form ref={formRef} className="car-form" onSubmit={submit} noValidate>
      <div className="car-form-main">
        <section className="admin-card">
          <h2>{t("Photos")}</h2>
          <PhotoManager
            photos={state.photos}
            onChange={setPhotos}
            t={t}
            enabled={photoStorage}
            error={errors.photos}
          />
        </section>
        <section className="admin-card">
          <h2>{t("Main details")}</h2>
          <div className="field-grid">
            {text("make", "Make", {
              required: true,
              list: "make-suggestions",
              autoComplete: "off",
            })}
            <datalist id="make-suggestions">
              {makeSuggestions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {text("model", "Model", { required: true, autoComplete: "off" })}
            {text("trim", "Version / trim", { placeholder: "Long Range AWD" })}
            {number("year", "Year", { required: true, min: 1980 })}
            {select("body", "Body type", bodyTypes)}
            {toggle("condition", "Condition", conditions)}
            {number("mileage", "Mileage, km", { required: true })}
            {text("vin", "VIN", {
              maxLength: 17,
              autoComplete: "off",
              spellCheck: false,
            })}
          </div>
        </section>
        <section className="admin-card">
          <h2>{t("Engine and drive")}</h2>
          <div className="field-grid">
            {select("fuel", "Fuel type", fuelTypes)}
            {fuel !== "electric" &&
              number("engineVolume", "Engine volume, L", { step: 0.1 })}
            {fuel !== "electric" && number("cylinders", "Cylinders")}
            {number("powerHp", "Power, hp")}
            {hasBattery.includes(fuel) &&
              number("batteryKwh", "Battery capacity, kWh", { step: 0.1 })}
            {electricRange.includes(fuel) &&
              number("rangeKm", "Electric range, km")}
            {electricRange.includes(fuel) &&
              select("rangeStandard", "Range standard", rangeStandards, {
                optional: true,
                translate: false,
              })}
            {select("gearbox", "Gearbox", gearboxes)}
            {select("drive", "Drive", drives)}
          </div>
        </section>
        <section className="admin-card">
          <h2>{t("Body and interior")}</h2>
          <div className="field-grid">
            {select("doors", "Doors", doorOptions, {
              optional: true,
              translate: false,
            })}
            {number("seats", "Seats", { min: 1 })}
            {toggle("steering", "Steering wheel", steeringSides)}
            {select("color", "Color", colors, { optional: true })}
            {select("interiorColor", "Interior color", colors, {
              optional: true,
            })}
            {select(
              "interiorMaterial",
              "Interior material",
              interiorMaterials,
              { optional: true },
            )}
            {number("airbags", "Airbags")}
          </div>
        </section>
        <section className="admin-card">
          <h2>{t("Features")}</h2>
          <div className="feature-picker">
            {Object.entries(featureGroups).map(([group, items]) => (
              <fieldset key={group}>
                <legend>{t(group)}</legend>
                {Object.entries(items).map(([key, label]) => (
                  <label key={key} className="check">
                    <input
                      type="checkbox"
                      checked={state.features.includes(key)}
                      onChange={(e) =>
                        set(
                          "features",
                          e.target.checked
                            ? [...state.features, key]
                            : state.features.filter((f) => f !== key),
                        )
                      }
                    />
                    {t(label)}
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </section>
        <section className="admin-card">
          <h2>{t("Price and location")}</h2>
          <div className="field-grid">
            {number("price", "Price, USD", { min: 1 })}
            {select("priceTerms", "Price terms", priceTermsOptions)}
            <label className="check">
              <input
                type="checkbox"
                checked={state.negotiable}
                onChange={(e) => set("negotiable", e.target.checked)}
              />
              {t("Price is negotiable")}
            </label>
            {select("location", "Location", locations)}
          </div>
        </section>
        <section className="admin-card">
          <h2>{t("Description")}</h2>
          <p className="admin-hint">
            {t(
              "Write in at least one language. Visitors see their own language, or Georgian when it is missing.",
            )}
          </p>
          {(
            [
              ["ka", "ქართული"],
              ["en", "English"],
              ["ru", "Русский"],
            ] as const
          ).map(([locale, name]) => (
            <label key={locale} className="description-field">
              {name}
              <textarea
                lang={locale}
                rows={5}
                maxLength={5000}
                value={state.description[locale] ?? ""}
                onChange={(e) =>
                  set("description", {
                    ...state.description,
                    [locale]: e.target.value,
                  })
                }
              />
            </label>
          ))}
          {err("description")}
        </section>
      </div>
      <aside className="car-form-side">
        <div className="admin-card">
          <fieldset className="status-picker">
            <legend>{t("Status")}</legend>
            {(Object.keys(statuses) as Status[]).map((key) => (
              <label
                key={key}
                className={state.status === key ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="status"
                  value={key}
                  checked={state.status === key}
                  onChange={() => set("status", key)}
                />
                <span>
                  <strong>{t(statuses[key])}</strong>
                  <small>{t(statusHints[key])}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <button
            className="button button-orange save-button"
            disabled={saving}
          >
            {t(id === null ? "Save listing" : "Save changes")}
            {saving && <LoaderCircle className="spin" size={18} />}
          </button>
          <p className="save-message" role="status" aria-live="polite">
            {flash && (
              <span className={flash.ok ? "is-ok" : "is-error"}>
                {flash.text}
              </span>
            )}
            {!flash && dirty && <span>{t("You have unsaved changes.")}</span>}
          </p>
          {listing && (
            <div className="side-links">
              <a
                href={`/api/admin/preview?path=${encodeURIComponent((lang === "ka" ? "/ka" : "") + publicPath)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye size={16} aria-hidden="true" />
                {t("Preview on the site")}
              </a>
              {listing.status !== "draft" && (
                <a
                  href={(lang === "ka" ? "/ka" : "") + publicPath}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                  {t("Open the live page")}
                </a>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm(
                      t("Unsaved changes will not be copied. Continue?"),
                    )
                  )
                    startBusy(() => duplicateListing(listing.id));
                }}
              >
                <Copy size={16} aria-hidden="true" />
                {t("Duplicate as a new draft")}
              </button>
              <button
                type="button"
                className="danger"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      t(
                        "Delete this listing and its photos? This cannot be undone.",
                      ),
                    )
                  )
                    startBusy(async () => {
                      setDirty(false);
                      await deleteListing(listing.id);
                    });
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                {t("Delete listing")}
              </button>
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
