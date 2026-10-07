import { Brand } from "@/components/header";
import { AdminNav } from "@/components/admin/admin-nav";
import { LanguageToggle } from "@/components/admin/language-toggle";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { storeKind } from "@/lib/store";
import { LogOut } from "lucide-react";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  const kind = storeKind();
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to content")}
      </a>
      <header className="admin-bar">
        <div className="admin-bar-inner">
          <Brand />
          <AdminNav lang={lang} />
          <div className="admin-bar-end">
            <LanguageToggle lang={lang} />
            <form action={logout}>
              <button type="submit" className="admin-signout">
                <LogOut size={16} aria-hidden="true" />
                {t("Sign out")}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="admin-main">
        {kind === null && (
          <p className="admin-notice admin-setup">
            {t(
              "The database is not connected, so nothing can be saved yet. Connect a Postgres database (DATABASE_URL) and a Blob store to this project in Vercel, then redeploy.",
            )}
          </p>
        )}
        {kind === "file" && (
          <p className="admin-notice admin-local">
            {t(
              "Local mode: changes are saved on this computer only, not on the live site.",
            )}
          </p>
        )}
        {children}
      </main>
    </>
  );
}
