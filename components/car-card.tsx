import Image from "next/image";
import Link from "next/link";
import { Car, MapPin } from "lucide-react";
import {
  fuelTypes,
  gearboxes,
  listingSlug,
  listingTitle,
  locations,
  statuses,
  type Listing,
} from "@/lib/cars";
import { groupDigits, money } from "@/lib/format";
import { localizedPath, type Locale } from "@/lib/i18n";

export function CarCard({
  listing,
  locale,
  t,
  priority = false,
}: {
  listing: Listing;
  locale: Locale;
  t: (source: string) => string;
  priority?: boolean;
}) {
  const photo = listing.photos[0];
  const title = listingTitle(listing);
  return (
    <article className={`car-card status-${listing.status}`}>
      <Link
        href={localizedPath(locale, `/cars/${listingSlug(listing)}`)}
        className="car-card-link"
      >
        <div className="car-card-photo">
          {photo ? (
            <Image
              src={photo.url}
              alt={`${title} ${listing.year}`}
              fill
              priority={priority}
              sizes="(max-width: 760px) 100vw, (max-width: 1050px) 50vw, 400px"
            />
          ) : (
            <Car size={40} aria-hidden="true" />
          )}
          {listing.status !== "available" && (
            <span className="car-status">{t(statuses[listing.status])}</span>
          )}
        </div>
        <div className="car-card-body">
          <h3>
            {title}
            {listing.trim && <span>{listing.trim}</span>}
          </h3>
          <p className="car-card-meta">
            {listing.year} · {groupDigits(listing.mileage, locale)} {t("km")}
          </p>
          <p className="car-card-meta">
            {t(fuelTypes[listing.fuel])} · {t(gearboxes[listing.gearbox])}
          </p>
          <div className="car-card-bottom">
            <strong>
              {listing.price === null
                ? t("Price on request")
                : money(listing.price, locale)}
            </strong>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {t(locations[listing.location])}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
