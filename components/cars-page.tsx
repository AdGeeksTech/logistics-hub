import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inquiry } from "@/components/inquiry";
import { CarCard } from "@/components/car-card";
import { CarFiltersForm } from "@/components/car-filters";
import { bodyTypes, fuelTypes } from "@/lib/cars";
import {
  applyFilters,
  filterQuery,
  pageSize,
  parseFilters,
  type SearchParams,
} from "@/lib/car-filters";
import { localizedPath, type Locale } from "@/lib/i18n";
import { getVisibleListings } from "@/lib/listings";
import { getT } from "@/lib/site-texts";

export default async function CarsPage({
  locale = "en",
  searchParams,
}: {
  locale?: Locale;
  searchParams: SearchParams;
}) {
  const [t, listings] = await Promise.all([getT(locale), getVisibleListings()]);
  const filters = parseFilters(searchParams);
  const results = applyFilters(listings, filters);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(filters.page, pages);
  const shown = results.slice((page - 1) * pageSize, page * pageSize);
  const path = localizedPath(locale, "/cars");
  const present = <T extends string>(
    key: (l: (typeof listings)[0]) => T,
    order: string[],
  ) => order.filter((option) => listings.some((l) => key(l) === option));
  const activeCount = [
    filters.make,
    filters.body,
    filters.fuel,
    filters.location,
    filters.priceMin,
    filters.priceMax,
    filters.yearMin,
    filters.yearMax,
    filters.sold || undefined,
  ].filter((value) => value !== undefined).length;
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <section className="dealer-hero cars-hero">
          <div className="container">
            <Link
              className="text-link back-link"
              href={localizedPath(locale, "/")}
            >
              <ArrowLeft size={16} />
              {t("Back to home")}
            </Link>
            <h1>
              {t("Cars from China,")}
              <br />
              <span>{t("ready for the road.")}</span>
            </h1>
            <p>
              {t(
                "Cars we have selected in China, with clear prices and delivery to Tbilisi arranged by our team. New offers appear here as soon as we find them.",
              )}
            </p>
          </div>
        </section>
        <section
          className="section container cars-catalog"
          aria-labelledby="cars-results"
        >
          {listings.length > 0 && (
            <CarFiltersForm
              key={filterQuery(filters)}
              locale={locale}
              action={path}
              filters={filters}
              makes={[...new Set(listings.map((l) => l.make))].sort()}
              bodies={present((l) => l.body, Object.keys(bodyTypes))}
              fuels={present((l) => l.fuel, Object.keys(fuelTypes))}
              activeCount={activeCount}
            />
          )}
          <div className="cars-results">
            <h2 id="cars-results" className="cars-count">
              {listings.length
                ? `${t("Cars found:")} ${results.length}`
                : t("No cars are listed right now.")}
            </h2>
            {shown.length > 0 ? (
              <div className="car-grid">
                {shown.map((listing, i) => (
                  <CarCard
                    key={listing.id}
                    listing={listing}
                    locale={locale}
                    t={t}
                    priority={i < 3}
                  />
                ))}
              </div>
            ) : (
              <div className="cars-empty">
                <p>
                  {listings.length
                    ? t("No cars match these filters.")
                    : t(
                        "New offers from China appear here as soon as we find them.",
                      )}{" "}
                  {t(
                    "Tell us what you’re looking for and we’ll search for you.",
                  )}
                </p>
                <div>
                  {listings.length > 0 && (
                    <a className="text-link" href={path}>
                      {t("Clear filters")}
                    </a>
                  )}
                  <a className="button button-orange" href="#inquiry">
                    {t("Find a vehicle")}
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
            )}
            {pages > 1 && (
              <nav className="pagination" aria-label={t("Pages")}>
                {page > 1 && (
                  <Link
                    href={`${path}${filterQuery({ ...filters, page: page - 1 })}#cars-results`}
                    aria-label={t("Previous page")}
                  >
                    <ArrowLeft size={18} />
                  </Link>
                )}
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={`${path}${filterQuery({ ...filters, page: n })}#cars-results`}
                    aria-current={n === page ? "page" : undefined}
                  >
                    {n}
                  </Link>
                ))}
                {page < pages && (
                  <Link
                    href={`${path}${filterQuery({ ...filters, page: page + 1 })}#cars-results`}
                    aria-label={t("Next page")}
                  >
                    <ArrowRight size={18} />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </section>
        <Inquiry
          locale={locale}
          initialRegion="China"
          connected={Boolean(
            process.env.RESEND_API_KEY &&
            process.env.INQUIRY_TO_EMAIL &&
            process.env.INQUIRY_FROM_EMAIL,
          )}
        />
      </main>
      <Footer locale={locale} />
    </>
  );
}
