import CarsPage from "@/components/cars-page";
import { carsMetadata } from "@/lib/car-routes";
import type { SearchParams } from "@/lib/car-filters";
export function generateMetadata() {
  return carsMetadata("en");
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <CarsPage searchParams={await searchParams} />;
}
