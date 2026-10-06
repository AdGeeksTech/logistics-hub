import type { Metadata } from "next";
import localFont from "next/font/local";
import { translator, type Locale } from "@/lib/i18n";
import "@/app/globals.css";
const display = localFont({
  src: "../public/fonts/barlow-condensed-600.ttf",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: "../public/fonts/manrope-variable.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "200 800",
});
const georgian = localFont({
  src: "../public/fonts/noto-sans-georgian.ttf",
  variable: "--font-georgian",
  display: "swap",
  weight: "100 900",
});
const cyrillic = localFont({
  src: "../public/fonts/oswald.ttf",
  variable: "--font-cyrillic",
  display: "swap",
  weight: "200 700",
});
export function siteMetadata(locale: Locale): Metadata {
  const t = translator(locale);
  return {
    title: {
      default: `Logistic Hub — ${t("Your choice. Our responsibility.")}`,
      template: "%s | Logistic Hub",
    },
    description: t(
      "Vehicle sourcing from the USA, Europe and China. Expert inspection, auction access and delivery support for private buyers and automotive dealers in Tbilisi.",
    ),
  };
}
export default function DocumentLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const t = translator(locale);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body
        className={`${display.variable} ${body.variable} ${georgian.variable} ${cyrillic.variable}`}
      >
        <a className="skip-link" href="#main">
          {t("Skip to content")}
        </a>
        {children}
      </body>
    </html>
  );
}
