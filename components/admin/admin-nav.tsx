"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";

export function AdminNav({ lang }: { lang: AdminLang }) {
  const t = adminTranslator(lang);
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label={t("Admin navigation")}>
      {[
        ["/admin/cars", "Car listings"],
        ["/admin/texts", "Site texts"],
        ["/admin/photos", "Site photos"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path.startsWith(href) ? "page" : undefined}
        >
          {t(label)}
        </Link>
      ))}
      <a href={lang === "ka" ? "/ka" : "/"} target="_blank" rel="noreferrer">
        {t("View site")}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </nav>
  );
}
