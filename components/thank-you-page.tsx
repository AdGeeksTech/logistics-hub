import { localizedPath, type Locale } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Where visitors land after sending an inquiry. Its own address also makes
// it the page to count as a conversion in Google Ads, Meta or Analytics.
export default async function ThankYou({ locale = "en" }: { locale?: Locale }) {
  const t = await getT(locale);
  const next = [
    [
      "/cars",
      "Cars from China",
      "See the cars we have selected in China, with clear prices and delivery to Tbilisi.",
    ],
    [
      "/calculator",
      "Fee calculator",
      "Estimate Copart and IAAI fees before you bid.",
    ],
    [
      "/#inquiry",
      "Send another inquiry",
      "Looking for more than one vehicle? Tell us about the next one.",
    ],
  ];
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <section className="dealer-hero thank-you-hero">
          <div className="container">
            <span className="thank-you-mark" aria-hidden="true">
              <Check size={28} strokeWidth={2.5} />
            </span>
            <h1>
              {t("Thank you.")}
              <br />
              <span>{t("Your inquiry is on its way.")}</span>
            </h1>
            <p>
              {t("Our team will contact you using the details you provided.")}
            </p>
          </div>
        </section>
        <section className="section container thank-you-next">
          <h2>{t("While you wait")}</h2>
          <ul>
            {next.map(([path, title, text]) => (
              <li key={path}>
                <Link href={localizedPath(locale, path)}>
                  <strong>{t(title)}</strong>
                  <span>{t(text)}</span>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
