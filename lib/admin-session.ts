import { cookies } from "next/headers";
import { adminLangCookie, adminTranslator, parseAdminLang } from "./admin-i18n";

export async function getAdminLang() {
  return parseAdminLang((await cookies()).get(adminLangCookie)?.value);
}
export async function getAdminT() {
  return adminTranslator(await getAdminLang());
}
