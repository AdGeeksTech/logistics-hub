import { notFound } from "next/navigation";
import Calculator from "@/components/calculator-page";
import { isLocale, alternatePaths, localizedPath } from "@/lib/i18n";
import { getT } from "@/lib/site-texts";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = await getT(lang);
  return {
    title: t("Auction fee calculator"),
    description: t(
      "Estimate Copart and IAAI buyer, bid, gate and service fees on top of a winning bid, using each auction’s official schedule.",
    ),
    alternates: {
      canonical: localizedPath(lang, "/calculator"),
      languages: alternatePaths("/calculator"),
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Calculator locale={lang} />;
}
