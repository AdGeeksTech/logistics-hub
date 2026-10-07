import adminKa from "./i18n/admin-ka.json";
import { dictionaries } from "./i18n";

// The admin is Georgian by default, with English available. Admin-only
// strings live in admin-ka.json; listing labels reuse the site dictionary.
export type AdminLang = "ka" | "en";
export const adminLangCookie = "lh_admin_lang";
const ka: Record<string, string> = adminKa;

export function adminTranslator(lang: AdminLang) {
  return (source: string) =>
    lang === "ka" ? (ka[source] ?? dictionaries.ka[source] ?? source) : source;
}
export function parseAdminLang(value: string | undefined): AdminLang {
  return value === "en" ? "en" : "ka";
}
