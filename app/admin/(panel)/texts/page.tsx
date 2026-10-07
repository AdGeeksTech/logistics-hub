import { TextsEditor } from "@/components/admin/texts-editor";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { getStore } from "@/lib/store";

export const metadata = { title: "Site texts" };

export default async function SiteTextsAdmin() {
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  const rows = (await getStore()?.getTexts()) ?? [];
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>{t("Site texts")}</h1>
          <p className="admin-hint">
            {t(
              "Edit any text in Georgian, English or Russian. Changes are saved as drafts: preview them on the site, then publish to make them live.",
            )}
          </p>
        </div>
      </div>
      <TextsEditor lang={lang} initialRows={rows} />
    </div>
  );
}
