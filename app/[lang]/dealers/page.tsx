import { notFound } from "next/navigation";
import Dealers from "@/components/dealer-page";
import {
  isLocale,
  translator,
  alternatePaths,
  localizedPath,
} from "@/lib/i18n";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = translator(lang);
  return {
    title: t("For automotive dealers"),
    description: t(
      "Access leading US vehicle auctions with expert lot review, bidding support, documentation and logistics from Logistic Hub.",
    ),
    alternates: {
      canonical: localizedPath(lang, "/dealers"),
      languages: alternatePaths("/dealers"),
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
  return <Dealers locale={lang} />;
}
