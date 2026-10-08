import Link from "next/link";
import { cookies } from "next/headers";
import { Eye } from "lucide-react";
import {
  adminLangCookie,
  adminTranslator,
  parseAdminLang,
} from "@/lib/admin-i18n";

// Shown on public pages while an admin previews unpublished changes.
export async function PreviewBanner() {
  const lang = parseAdminLang((await cookies()).get(adminLangCookie)?.value);
  const t = adminTranslator(lang);
  return (
    <aside className="preview-banner" role="status" lang={lang}>
      <Eye size={18} aria-hidden="true" />
      <p>
        <strong>{t("Preview")}</strong>{" "}
        {t(
          "Unpublished texts, photos and draft listings are visible only to you.",
        )}
      </p>
      <Link href="/admin">{t("Back to admin")}</Link>
      <form action="/api/preview/exit" method="post">
        <button type="submit">{t("Exit preview")}</button>
      </form>
    </aside>
  );
}
