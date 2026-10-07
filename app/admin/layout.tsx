import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fontClasses } from "@/components/document-layout";
import { adminLangCookie, parseAdminLang } from "@/lib/admin-i18n";
import "@/app/globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Admin | Logistic Hub",
    template: "%s | Logistic Hub admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = parseAdminLang((await cookies()).get(adminLangCookie)?.value);
  return (
    <html lang={lang}>
      <body className={`${fontClasses} admin`}>{children}</body>
    </html>
  );
}
