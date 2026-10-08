"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { adminTranslator, type AdminLang } from "@/lib/admin-i18n";

export function AdminNav({
  lang,
  newInquiries,
}: {
  lang: AdminLang;
  newInquiries: number;
}) {
  const t = adminTranslator(lang);
  const path = usePathname();
  return (
    <nav className="admin-nav" aria-label={t("Admin navigation")}>
      {[
        ["/admin/cars", "Car listings"],
        ["/admin/texts", "Site texts"],
        ["/admin/photos", "Site photos"],
        ["/admin/inquiries", "Inquiries"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path.startsWith(href) ? "page" : undefined}
        >
          {t(label)}
          {href === "/admin/inquiries" && newInquiries > 0 && (
            <span className="nav-count">
              {newInquiries}
              <span className="sr-only"> {t("new")}</span>
            </span>
          )}
        </Link>
      ))}
      <a href={lang === "ka" ? "/ka" : "/"} target="_blank" rel="noreferrer">
        {t("View site")}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </nav>
  );
}
