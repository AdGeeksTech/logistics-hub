import { notFound } from "next/navigation";
import CarsPage from "@/components/cars-page";
import { carsMetadata } from "@/lib/car-routes";
import type { SearchParams } from "@/lib/car-filters";
import { isLocale } from "@/lib/i18n";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return carsMetadata(lang);
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(lang)) notFound();
  return <CarsPage locale={lang} searchParams={query} />;
}
