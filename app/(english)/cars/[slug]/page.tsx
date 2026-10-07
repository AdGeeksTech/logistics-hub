import CarDetailPage from "@/components/car-detail-page";
import { carMetadata, loadCar } from "@/lib/car-routes";
// Saving a listing refreshes this page at once; this is only a backstop.
export const revalidate = 3600;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return carMetadata("en", (await params).slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const listing = await loadCar("en", (await params).slug);
  return <CarDetailPage listing={listing} />;
}
