import Home from "@/components/home-page";
import { alternatePaths } from "@/lib/i18n";
export const metadata = {
  alternates: { canonical: "/", languages: alternatePaths() },
};
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
