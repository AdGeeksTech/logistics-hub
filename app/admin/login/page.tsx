import { redirect } from "next/navigation";
import { Brand } from "@/components/header";
import { LoginForm } from "@/components/admin/login-form";
import { LanguageToggle } from "@/components/admin/language-toggle";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin/cars");
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  return (
    <main className="admin-login" id="main">
      <div className="admin-login-card">
        <div className="admin-login-top">
          <Brand />
          <LanguageToggle lang={lang} />
        </div>
        <h1>{t("Site admin")}</h1>
        {adminConfigured() ? (
          <>
            <p>{t("Sign in to manage car listings and site texts.")}</p>
            <LoginForm lang={lang} />
          </>
        ) : (
          <p className="admin-notice">
            {t(
              "The admin is not switched on yet. Add an ADMIN_PASSWORD environment variable to the deployment, then redeploy.",
            )}
          </p>
        )}
      </div>
    </main>
  );
}
