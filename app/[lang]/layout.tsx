import { notFound } from "next/navigation";
import DocumentLayout, { siteMetadata } from "@/components/document-layout";
import { isLocale } from "@/lib/i18n";
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ lang: "ru" }, { lang: "ka" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return siteMetadata(lang);
}
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <DocumentLayout locale={lang}>{children}</DocumentLayout>;
}
