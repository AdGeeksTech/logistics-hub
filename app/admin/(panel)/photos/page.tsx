import { SitePhotosEditor } from "@/components/admin/site-photos-editor";
import { getAdminLang } from "@/lib/admin-session";
import { adminTranslator } from "@/lib/admin-i18n";
import { photoStorageKind } from "@/lib/photos";
import { getStore } from "@/lib/store";

export const metadata = { title: "Site photos" };

export default async function SitePhotosAdmin() {
  const lang = await getAdminLang();
  const t = adminTranslator(lang);
  const store = getStore();
  const rows = (await store?.getSitePhotos()) ?? [];
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>{t("Site photos")}</h1>
          <p className="admin-hint">
            {t(
              "Replace the large photos on the homepage and the dealers page. Changes are saved as drafts: preview them on the site, then publish to make them live.",
            )}
          </p>
        </div>
      </div>
      <SitePhotosEditor
        lang={lang}
        initialRows={rows}
        canUpload={Boolean(store && photoStorageKind())}
      />
    </div>
  );
}
