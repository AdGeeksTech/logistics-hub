import type { Metadata } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { type Locale } from "@/lib/i18n";
import { siteDescription, siteTitle } from "@/lib/page-metadata";
import { siteUrl } from "@/lib/site-url";
import { getT, getTextOverrides } from "@/lib/site-texts";
import { TextsProvider } from "@/components/texts-provider";
import { PreviewBanner } from "@/components/preview-banner";
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
export const fontClasses = `${display.variable} ${body.variable} ${georgian.variable} ${cyrillic.variable}`;
export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const t = await getT(locale);
  return {
    // Makes canonical, language and preview-image links absolute.
    metadataBase: siteUrl(),
    title: {
      default: siteTitle(t),
      template: "%s | Logistic Hub",
    },
    description: siteDescription(t),
  };
}
export default async function DocumentLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const [t, overrides, draft] = await Promise.all([
    getT(locale),
    getTextOverrides(locale),
    draftMode(),
  ]);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={fontClasses}>
        <a className="skip-link" href="#main">
          {t("Skip to content")}
        </a>
        {draft.isEnabled && <PreviewBanner />}
        <TextsProvider locale={locale} overrides={overrides}>
          {children}
        </TextsProvider>
      </body>
    </html>
  );
}
