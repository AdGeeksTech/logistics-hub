import { notFound } from "next/navigation";
import DocumentLayout, { siteMetadata } from "@/components/document-layout";
import { isLocale } from "@/lib/i18n";
// Unknown languages are rejected below with notFound(). dynamicParams stays
// on: with it off, Next.js cannot regenerate these pages after site texts
// are published and answers 404 instead.
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
