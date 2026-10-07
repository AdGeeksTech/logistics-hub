import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, MapPin } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inquiry } from "@/components/inquiry";
import { CarGallery } from "@/components/car-gallery";
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
  listingDescription,
  listingTitle,
  locations,
  priceTermsOptions,
  statuses,
  steeringSides,
  type Listing,
  type specLabels,
} from "@/lib/cars";

type SpecLabel = (typeof specLabels)[number];
import { formatDate, groupDigits, money } from "@/lib/format";
import { localizedPath, type Locale } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";

export function specRows(
  l: Listing,
  t: (source: string) => string,
  locale: Locale,
) {
  const n = (value: number) => groupDigits(value, locale);
  const rows: [SpecLabel, string | number | null | false][] = [
    ["Year", l.year],
    ["Condition", t(conditions[l.condition])],
    ["Mileage", `${n(l.mileage)} ${t("km")}`],
    ["Body type", t(bodyTypes[l.body])],
    ["Fuel type", t(fuelTypes[l.fuel])],
    [
      "Engine volume",
      l.engineVolume !== null && `${l.engineVolume.toFixed(1)} ${t("L")}`,
    ],
    ["Cylinders", l.cylinders],
    ["Power", l.powerHp !== null && `${n(l.powerHp)} ${t("hp")}`],
    [
      "Battery capacity",
      l.batteryKwh !== null && `${n(l.batteryKwh)} ${t("kWh")}`,
    ],
    [
      "Range",
      l.rangeKm !== null &&
        `${n(l.rangeKm)} ${t("km")}${l.rangeStandard ? ` (${l.rangeStandard})` : ""}`,
    ],
    ["Gearbox", t(gearboxes[l.gearbox])],
    ["Drive", t(drives[l.drive])],
    ["Doors", l.doors && doorOptions[l.doors]],
    ["Seats", l.seats],
    ["Steering wheel", t(steeringSides[l.steering])],
    ["Color", l.color && t(colors[l.color])],
    ["Interior color", l.interiorColor && t(colors[l.interiorColor])],
    [
      "Interior material",
      l.interiorMaterial && t(interiorMaterials[l.interiorMaterial]),
    ],
    ["Airbags", l.airbags],
    ["VIN", l.vin],
    ["Location", t(locations[l.location])],
  ];
  return rows.filter(
    (row): row is [SpecLabel, string | number] =>
      row[1] !== null && row[1] !== false && row[1] !== "",
  );
}

export default async function CarDetailPage({
  listing,
  locale = "en",
}: {
  listing: Listing;
  locale?: Locale;
}) {
  const t = await getT(locale);
  const title = listingTitle(listing);
  const description = listingDescription(listing, locale);
  const features = Object.entries(featureGroups)
    .map(
      ([group, items]) =>
        [
          group,
          Object.entries(items).filter(([key]) =>
            listing.features.includes(key),
          ),
        ] as const,
    )
    .filter(([, items]) => items.length);
  const availability = {
    available: "https://schema.org/InStock",
    reserved: "https://schema.org/LimitedAvailability",
    sold: "https://schema.org/SoldOut",
    draft: "https://schema.org/PreOrder",
  }[listing.status];
  const structured = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${title} ${listing.year}`,
    brand: { "@type": "Brand", name: listing.make },
    model: listing.model,
    vehicleModelDate: String(listing.year),
    bodyType: bodyTypes[listing.body],
    fuelType: fuelTypes[listing.fuel],
    vehicleTransmission: gearboxes[listing.gearbox],
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: listing.mileage,
      unitCode: "KMT",
    },
    ...(listing.vin && { vehicleIdentificationNumber: listing.vin }),
    image: listing.photos.map((p) => p.url),
    ...(listing.price !== null && {
      offers: {
        "@type": "Offer",
        price: listing.price,
        priceCurrency: "USD",
        availability,
      },
    }),
  };
  return (
    <>
      <Header locale={locale} />
      <main id="main" className="car-page">
        <div className="container car-detail">
          <Link
            className="text-link back-link"
            href={localizedPath(locale, "/cars")}
          >
            <ArrowLeft size={16} />
            {t("All cars")}
          </Link>
          <div className="car-detail-top">
            <CarGallery
              photos={listing.photos}
              alt={`${title} ${listing.year}`}
              locale={locale}
            />
            <aside className="car-summary">
              {listing.status !== "available" && (
                <p className={`car-status-note status-${listing.status}`}>
                  {t(statuses[listing.status])}
                  {listing.status === "draft" &&
                    ` — ${t("not visible to visitors")}`}
                </p>
              )}
              <h1>
                {title} <span>{listing.year}</span>
              </h1>
              {listing.trim && <p className="car-trim">{listing.trim}</p>}
              <p className="car-price">
                {listing.price === null
                  ? t("Price on request")
                  : money(listing.price, locale)}
                {listing.negotiable && <span>{t("Negotiable")}</span>}
              </p>
              <p className="car-price-terms">
                {t(priceTermsOptions[listing.priceTerms])}
              </p>
              <ul className="car-key-specs">
                <li>
                  <span>{t("Mileage")}</span>
                  {groupDigits(listing.mileage, locale)} {t("km")}
                </li>
                <li>
                  <span>{t("Fuel type")}</span>
                  {t(fuelTypes[listing.fuel])}
                </li>
                <li>
                  <span>{t("Gearbox")}</span>
                  {t(gearboxes[listing.gearbox])}
                </li>
                <li>
                  <span>{t("Drive")}</span>
                  {t(drives[listing.drive])}
                </li>
              </ul>
              <p className="car-location">
                <MapPin size={16} aria-hidden="true" />
                {t(locations[listing.location])}
              </p>
              {listing.status !== "sold" && (
                <a className="button button-orange" href="#inquiry">
                  {t("Ask about this car")}
                  <ArrowUpRight size={18} />
                </a>
              )}
              <p className="car-id">
                ID {listing.id}
                {listing.publishedAt &&
                  ` · ${t("Posted")} ${formatDate(listing.publishedAt, locale)}`}
              </p>
            </aside>
            <div className="car-detail-body">
              <section aria-labelledby="car-specs">
                <h2 id="car-specs">{t("Specifications")}</h2>
                <dl className="spec-table">
                  {specRows(listing, t, locale).map(([label, value]) => (
                    <div key={label}>
                      <dt>{t(label)}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              {features.length > 0 && (
                <section aria-labelledby="car-features">
                  <h2 id="car-features">{t("Features")}</h2>
                  <div className="feature-groups">
                    {features.map(([group, items]) => (
                      <div key={group}>
                        <h3>{t(group)}</h3>
                        <ul className="check-list">
                          {items.map(([key, label]) => (
                            <li key={key}>
                              <Check />
                              {t(label)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {description && (
                <section aria-labelledby="car-description">
                  <h2 id="car-description">{t("Description")}</h2>
                  <p className="car-description">{description}</p>
                </section>
              )}
            </div>
          </div>
        </div>
        <Inquiry
          locale={locale}
          initialRegion="China"
          initialMessage={`${t("I’m interested in this car:")} ${title} ${listing.year}, ID ${listing.id}.`}
          connected={Boolean(
            process.env.RESEND_API_KEY &&
            process.env.INQUIRY_TO_EMAIL &&
            process.env.INQUIRY_FROM_EMAIL,
          )}
        />
      </main>
      <Footer locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
