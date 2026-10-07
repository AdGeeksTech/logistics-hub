import { localizedPath, type Locale } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Inquiry } from "@/components/inquiry";
import { FeeCalculator } from "@/components/fee-calculator";
export default async function Calculator({
  locale = "en",
}: {
  locale?: Locale;
}) {
  const t = await getT(locale);
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <section className="dealer-hero calculator-hero">
          <div className="container">
            <Link
              className="text-link back-link"
              href={localizedPath(locale, "/")}
            >
              <ArrowLeft size={16} />
              {t("Back to home")}
            </Link>
            <h1>
              {t("Auction fees,")}
              <br />
              <span>{t("before you bid.")}</span>
            </h1>
            <p>
              {t(
                "See what Copart and IAAI add to a winning bid. Choose the auction, enter your bid and get each fee from the auction’s official schedule.",
              )}
            </p>
          </div>
        </section>
        <FeeCalculator locale={locale} />
        <Inquiry
          locale={locale}
          initialRegion="USA"
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
