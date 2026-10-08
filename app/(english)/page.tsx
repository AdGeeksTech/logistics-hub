import Home from "@/components/home-page";
import { homeMetadata } from "@/lib/page-metadata";
export function generateMetadata() {
  return homeMetadata("en");
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  return (
    <Home
      initialRegion={
        region && ["USA", "Europe", "China"].includes(region)
          ? region
          : "Not sure yet"
      }
    />
  );
}
