import { notFound } from "next/navigation";
import ThankYou from "@/components/thank-you-page";
import { isLocale } from "@/lib/i18n";
import { thankYouMetadata } from "@/lib/page-metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return thankYouMetadata(lang);
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ThankYou locale={lang} />;
}
