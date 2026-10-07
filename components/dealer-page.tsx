import { localizedPath, type Locale } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inquiry } from "@/components/inquiry";
export default async function Dealers({ locale = "en" }: { locale?: Locale }) {
  const t = await getT(locale);
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <section className="dealer-hero">
          <div className="container">
            <Link
              className="text-link back-link"
              href={localizedPath(locale, "/")}
            >
              <ArrowLeft size={16} />
              {t("Back to home")}
            </Link>
            <div className="dealer-hero-grid">
              <div>
                <h1>
                  {t("A stronger partner.")}
                  <br />
                  {t("For your next")}
                  <br />
                  <span>{t("move.")}</span>
                </h1>
                <p>
                  {t(
                    "Auction access, expert review and dependable logistics. Build your vehicle sourcing operation with a team that understands the business.",
                  )}
                </p>
                <a className="button button-orange" href="#inquiry">
                  {t("Talk dealer opportunities")}
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="dealer-image">
                <Image
                  src="/images/vehicle-detail.jpg"
                  alt={t(
                    "Vehicles in an automotive showroom; illustrative photography",
                  )}
                  fill
                  priority
                  sizes="(max-width:760px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="section container dealer-content">
          <h2>
            {t("Access the auctions.")}
            <br />
            {t("Keep the support.")}
          </h2>
          <div>
            <p>
              {t(
                "Logistic Hub gives professional dealers access to major US automotive auctions, including Copart, IAAI, Manheim, ADESA and other available platforms.",
              )}
            </p>
            <ul className="check-list">
              <li>
                <Check />
                {t("Review of your selected lots before bidding")}
              </li>
              <li>
                <Check />
                {t("Vehicle history and documentation checks")}
              </li>
              <li>
                <Check />
                {t("Bidding after expert approval")}
              </li>
              <li>
                <Check />
                {t("Logistics coordination with Lion Trans")}
              </li>
              <li>
                <Check />
                {t("Regular updates until the vehicle is received")}
              </li>
            </ul>
            <p>
              {t(
                "Partnership terms, payment arrangements and documentation requirements are explained directly by a sales manager, based on your needs.",
              )}
            </p>
            <Link
              className="text-link"
              href={localizedPath(locale, "/calculator")}
            >
              {t("Estimate auction fees")}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <Inquiry
          locale={locale}
          dealer
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
