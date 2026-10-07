"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { bodyTypes, fuelTypes, locations } from "@/lib/cars";
import { sorts, type CarFilters } from "@/lib/car-filters";
import type { Locale } from "@/lib/i18n";
import { useT } from "@/components/texts-provider";

// A plain GET form, so filters also work before JavaScript loads. With
// JavaScript, selects apply immediately and empty fields stay out of the URL.
export function CarFiltersForm({
  locale,
  action,
  filters,
  makes,
  bodies,
  fuels,
  activeCount,
}: {
  locale: Locale;
  action: string;
  filters: CarFilters;
  makes: string[];
  bodies: string[];
  fuels: string[];
  activeCount: number;
}) {
  const t = useT(locale);
  const router = useRouter();
  const [open, setOpen] = useState(activeCount > 0);
  const [pending, startTransition] = useTransition();
  function apply(form: HTMLFormElement) {
    const query = new URLSearchParams();
    for (const [key, value] of new FormData(form))
      if (
        typeof value === "string" &&
        value &&
        !(key === "sort" && value === "newest")
      )
        query.set(key, value);
    const text = query.toString();
    startTransition(() =>
      router.push(action + (text ? `?${text}` : ""), { scroll: false }),
    );
  }
  const select = (
    name: string,
    label: string,
    any: string,
    options: [string, string][],
    value?: string,
  ) => (
    <label>
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        onChange={(e) => apply(e.currentTarget.form!)}
      >
        <option value="">{any}</option>
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <form
      className={`car-filters${open ? " is-open" : ""}`}
      action={action}
      method="get"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
    >
      <button
        type="button"
        className="filters-toggle"
        aria-expanded={open}
        aria-controls="car-filter-fields"
        onClick={() => setOpen(!open)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        {t("Filters")}
        {activeCount > 0 && <span>{activeCount}</span>}
      </button>
      <div className="filter-fields" id="car-filter-fields">
        {select(
          "make",
          t("Make"),
          t("All makes"),
          makes.map((m) => [m, m]),
          filters.make,
        )}
        {select(
          "body",
          t("Body type"),
          t("All body types"),
          bodies.map((b) => [b, t(bodyTypes[b as keyof typeof bodyTypes])]),
          filters.body,
        )}
        {select(
          "fuel",
          t("Fuel type"),
          t("All fuel types"),
          fuels.map((f) => [f, t(fuelTypes[f as keyof typeof fuelTypes])]),
          filters.fuel,
        )}
        {select(
          "location",
          t("Location"),
          t("Anywhere"),
          Object.entries(locations).map(([k, v]) => [k, t(v)]),
          filters.location,
        )}
        <fieldset className="filter-range">
          <legend>{t("Price, USD")}</legend>
          <input
            name="priceMin"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t("From")}
            aria-label={`${t("Price, USD")}: ${t("From")}`}
            defaultValue={filters.priceMin}
          />
          <input
            name="priceMax"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t("To")}
            aria-label={`${t("Price, USD")}: ${t("To")}`}
            defaultValue={filters.priceMax}
          />
        </fieldset>
        <fieldset className="filter-range">
          <legend>{t("Year")}</legend>
          <input
            name="yearMin"
            type="number"
            inputMode="numeric"
            min={1980}
            placeholder={t("From")}
            aria-label={`${t("Year")}: ${t("From")}`}
            defaultValue={filters.yearMin}
          />
          <input
            name="yearMax"
            type="number"
            inputMode="numeric"
            min={1980}
            placeholder={t("To")}
            aria-label={`${t("Year")}: ${t("To")}`}
            defaultValue={filters.yearMax}
          />
        </fieldset>
        <label className="filter-check">
          <input
            type="checkbox"
            name="sold"
            value="1"
            defaultChecked={filters.sold}
            onChange={(e) => apply(e.currentTarget.form!)}
          />
          {t("Include sold cars")}
        </label>
        {select(
          "sort",
          t("Sort by"),
          t("Newest first"),
          Object.entries(sorts)
            .filter(([k]) => k !== "newest")
            .map(([k, v]) => [k, t(v)]),
          filters.sort === "newest" ? undefined : filters.sort,
        )}
        <button type="submit" className="button">
          {t("Show cars")}
        </button>
        {activeCount > 0 && (
          <a className="text-link" href={action}>
            {t("Clear filters")}
          </a>
        )}
      </div>
    </form>
  );
}
