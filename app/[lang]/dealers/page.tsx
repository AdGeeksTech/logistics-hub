import { notFound } from "next/navigation";
import Dealers from "@/components/dealer-page";
import { isLocale } from "@/lib/i18n";
import { dealersMetadata } from "@/lib/page-metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return dealersMetadata(lang);
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
