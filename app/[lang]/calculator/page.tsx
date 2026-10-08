import { notFound } from "next/navigation";
import Calculator from "@/components/calculator-page";
import { isLocale } from "@/lib/i18n";
import { calculatorMetadata } from "@/lib/page-metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return calculatorMetadata(lang);
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
