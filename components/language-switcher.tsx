"use client";
import { usePathname } from "next/navigation";
import { localizedPath, translator, type Locale } from "@/lib/i18n";
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const path = pathname.replace(/^\/(ru|ka)(?=\/|$)/, "") || "/";
  const t = translator(locale);
  return (
    <label className="language-switcher">
      <span className="sr-only">{t("Language")}</span>
      <select
        value={locale}
        onChange={(event) => {
          const lang = event.target.value as Locale;
          window.location.assign(
            localizedPath(lang, path) +
              window.location.search +
              window.location.hash,
          );
        }}
      >
        <option value="en" lang="en">
          EN
        </option>
        <option value="ru" lang="ru">
          РУ
        </option>
        <option value="ka" lang="ka">
          ქარ
        </option>
      </select>
    </label>
  );
}
