import { notFound } from "next/navigation";
import Home from "@/components/home-page";
import { isLocale } from "@/lib/i18n";
import { homeMetadata } from "@/lib/page-metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return homeMetadata(lang);
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const [{ lang }, { region }] = await Promise.all([params, searchParams]);
  if (!isLocale(lang)) notFound();
  return (
    <Home
      locale={lang}
      initialRegion={
        region && ["USA", "Europe", "China"].includes(region)
          ? region
          : "Not sure yet"
      }
    />
  );
}
