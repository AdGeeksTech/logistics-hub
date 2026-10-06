import { translator, localizedPath, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { Brand } from "./header";
import { ArrowUpRight } from "lucide-react";
export function Footer({ locale = "en" }: { locale?: Locale }) {
  const t = translator(locale);
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Brand locale={locale} />
          <p>{t("Your choice. Our responsibility.")}</p>
        </div>
        <div className="footer-links">
          <Link href={localizedPath(locale, "/#services")}>
            {t("Our services")}
          </Link>
          <Link href={localizedPath(locale, "/dealers")}>
            {t("For dealers")}
          </Link>
          <Link href={localizedPath(locale, "/calculator")}>
            {t("Fee calculator")}
          </Link>
          <Link href={localizedPath(locale, "/#how-it-works")}>
            {t("How it works")}
          </Link>
          <Link href={localizedPath(locale, "/#inquiry")}>
            {t("Start an inquiry")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <p className="footer-location">
          {t("Founded in Tbilisi, Georgia.")}
          <br />
          {t("Connected to a world of vehicles.")}
        </p>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Logistic Hub</span>
        <span>{t("USA · Europe · China")}</span>
        <span>{t("Vehicle photography is illustrative.")}</span>
      </div>
    </footer>
  );
}
