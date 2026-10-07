import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CarCard } from "@/components/car-card";
import { localizedPath, type Locale } from "@/lib/i18n";
import { getVisibleListings } from "@/lib/listings";
import { getT } from "@/lib/site-texts";

// The three newest cars on offer; the section is left out until the first
// listing is published.
export async function LatestCars({ locale }: { locale: Locale }) {
  const [t, listings] = await Promise.all([getT(locale), getVisibleListings()]);
  const latest = listings
    .filter((l) => l.status === "available" || l.status === "reserved")
    .slice(0, 3);
  if (!latest.length) return null;
  return (
    <section
      className="section container latest-cars"
      aria-labelledby="latest-cars-heading"
    >
      <div className="section-heading">
        <h2 id="latest-cars-heading">
          {t("Ready to go.")}
          <br />
          {t("Cars from China.")}
        </h2>
        <p>
          {t("Recently selected offers, with prices and delivery to Tbilisi.")}
        </p>
      </div>
      <div className="car-grid">
        {latest.map((listing) => (
          <CarCard key={listing.id} listing={listing} locale={locale} t={t} />
        ))}
      </div>
      <Link className="text-link" href={localizedPath(locale, "/cars")}>
        {t("See all cars")}
        <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
