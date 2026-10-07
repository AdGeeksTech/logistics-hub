import { notFound } from "next/navigation";
import CarDetailPage from "@/components/car-detail-page";
import { carMetadata, loadCar } from "@/lib/car-routes";
import { isLocale } from "@/lib/i18n";
// Saving a listing refreshes this page at once; this is only a backstop.
export const revalidate = 3600;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  return carMetadata(lang, slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const listing = await loadCar(lang, slug);
  return <CarDetailPage listing={listing} locale={lang} />;
}
