"use client";
import { type Locale } from "@/lib/i18n";
import { useT } from "@/components/texts-provider";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Globe2 } from "lucide-react";
const regions = [
  {
    name: "USA",
    title: "More choice. Expert eyes on every lot.",
    description:
      "Explore trusted US auctions with a team that reviews the vehicle’s history, documentation and available information before bidding.",
    detail: "Copart · IAAI · Manheim · ADESA",
    code: "US",
  },
  {
    name: "Europe",
    title: "Your European search starts here.",
    description:
      "Tell us what you are looking for. Our team helps you source a vehicle from Europe and coordinates documentation and delivery.",
    detail: "Vehicle sourcing · Documentation · Delivery",
    code: "EU",
  },
  {
    name: "China",
    title: "A new market. A familiar level of care.",
    description:
      "Explore vehicle sourcing from China with professional support, clear communication and coordinated logistics through to delivery.",
    detail: "Vehicle selection · Logistics · Ongoing updates",
    code: "CN",
  },
];
export function Regions({
  initialRegion = "USA",
  locale = "en",
}: {
  initialRegion?: string;
  locale?: Locale;
}) {
  const t = useT(locale);
  const [active, setActive] = useState(
    Math.max(
      0,
      regions.findIndex((region) => region.name === initialRegion),
    ),
  );
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = regions[active];
  return (
    <section className="regions-section" aria-labelledby="regions-heading">
      <div className="container region-layout">
        <div>
          <h2 id="regions-heading">
            {t("Three regions.")}
            <br />
            {t("One trusted team.")}
          </h2>
          <p className="section-copy">
            {t("Look beyond borders. We’ll take care of the journey.")}
          </p>
        </div>
        <div className="region-picker">
          <div
            className="region-tabs"
            role="tablist"
            aria-label={t("Vehicle sourcing region")}
          >
            {regions.map((region, i) => (
              <button
                key={t(region.name)}
                ref={(node) => {
                  refs.current[i] = node;
                }}
                id={`region-tab-${i}`}
                role="tab"
                aria-selected={i === active}
                aria-controls={`region-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  let next = i;
                  if (e.key === "ArrowRight") next = (i + 1) % 3;
                  else if (e.key === "ArrowLeft") next = (i + 2) % 3;
                  else if (e.key === "Home") next = 0;
                  else if (e.key === "End") next = 2;
                  else return;
                  e.preventDefault();
                  setActive(next);
                  refs.current[next]?.focus();
                }}
              >
                <span>{t(region.name)}</span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <div
            className="region-panel"
            id={`region-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`region-tab-${active}`}
            tabIndex={0}
          >
            <div className="route">
              <span>
                <Globe2 size={17} />
                {current.code}
              </span>
              <span className="route-line" />
              <ArrowRight size={16} />
              <span>{t("Tbilisi, GE")}</span>
            </div>
            <h3>{t(current.title)}</h3>
            <p>{t(current.description)}</p>
            <div className="region-bottom">
              <span>{t(current.detail)}</span>
              <a
                className="text-link"
                href={`?region=${encodeURIComponent(current.name)}#inquiry`}
              >
                {t("Explore")} {t(current.name)}
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
