"use client";
import { translator, type Locale } from "@/lib/i18n";
import {
  auctionFees,
  feeSources,
  type Auction,
  type BidType,
  type Title,
} from "@/lib/auction-fees";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
// Formatted by hand: Node and browsers ship different ICU data for ka/ru,
// so Intl output would differ between the server render and hydration.
function money(value: number, locale: Locale) {
  const [whole, cents] = value.toFixed(2).split(".");
  const group = locale === "en" ? "," : " ";
  const decimal = locale === "en" ? "." : ",";
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `$${grouped}${cents === "00" ? "" : decimal + cents}`;
}
function formatDate(iso: string, locale: Locale) {
  const [year, month, day] = iso.split("-");
  // prettier-ignore
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return locale === "en"
    ? `${months[Number(month) - 1]} ${Number(day)}, ${year}`
    : `${day}.${month}.${year}`;
}
function Toggle<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  t,
}: {
  legend: string;
  name: string;
  options: [T, string][];
  value: T;
  onChange: (value: T) => void;
  t: (source: string) => string;
}) {
  return (
    <fieldset>
      <legend>{t(legend)}</legend>
      <div className="audience-toggle">
        {options.map(([option, label]) => (
          <label key={option} className={value === option ? "selected" : ""}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {t(label)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function FeeCalculator({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  const [auction, setAuction] = useState<Auction>("Copart");
  const [bid, setBid] = useState("5000");
  const [title, setTitle] = useState<Title>("nonClean");
  const [bidType, setBidType] = useState<BidType>("live");
  const amount = Number(bid);
  const lines = auctionFees(auction, amount, title, bidType);
  const fees = lines.reduce((sum, line) => sum + line.amount, 0);
  return (
    <section className="section container calculator-layout">
      <form className="form-wrap" onSubmit={(e) => e.preventDefault()}>
        <Toggle
          legend="Auction"
          name="auction"
          options={[
            ["Copart", "Copart"],
            ["IAAI", "IAAI"],
          ]}
          value={auction}
          onChange={setAuction}
          t={t}
        />
        <label className="bid-field">
          {t("Winning bid")} <span>(USD)</span>
          <input
            name="bid"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={bid}
            placeholder="5000"
            onChange={(e) => setBid(e.target.value)}
          />
        </label>
        {auction === "Copart" && (
          <Toggle
            legend="Title type"
            name="title"
            options={[
              ["nonClean", "Salvage or other non-clean"],
              ["clean", "Clean"],
            ]}
            value={title}
            onChange={setTitle}
            t={t}
          />
        )}
        <Toggle
          legend="How the lot is won"
          name="bidType"
          options={[
            ["live", "Live bid"],
            ["preBid", "Pre-bid"],
          ]}
          value={bidType}
          onChange={setBidType}
          t={t}
        />
      </form>
      <div className="fee-summary">
        <h2>{t("Estimated auction fees")}</h2>
        {lines.length ? (
          <dl>
            {lines.map((line) => (
              <div key={line.label}>
                <dt>{t(line.label)}</dt>
                <dd>{money(line.amount, locale)}</dd>
              </div>
            ))}
            <div className="fee-subtotal">
              <dt>{t("Auction fees")}</dt>
              <dd>{money(fees, locale)}</dd>
            </div>
            <div className="fee-total" aria-live="polite">
              <dt>{t("Bid plus auction fees")}</dt>
              <dd>{money(amount + fees, locale)}</dd>
            </div>
          </dl>
        ) : (
          <p className="fee-empty">
            {t("Enter a winning bid to see the fees.")}
          </p>
        )}
        <p className="fee-note">
          {t(
            "Based on the official standard-vehicle schedule for payment by wire transfer.",
          )}{" "}
          {t("Checked")} {formatDate(feeSources.checked, locale)}.{" "}
          <a
            className="fee-source"
            href={auction === "Copart" ? feeSources.copart : feeSources.iaai}
            target="_blank"
            rel="noreferrer"
          >
            {t(`View the ${auction} schedule`)}
            <ArrowUpRight size={14} />
          </a>
        </p>
        <p className="fee-note">
          {t(
            auction === "Copart"
              ? "Not included: storage, late payment and title shipping fees, delivery from the US and customs clearance."
              : "Not included: IAA’s EH&S and fuel surcharge, storage, late payment and premium imagery fees, delivery from the US and customs clearance.",
          )}{" "}
          {t("Your manager confirms the final amount before you bid.")}
        </p>
      </div>
    </section>
  );
}
