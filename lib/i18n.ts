import ru from "./i18n/ru.json";
import ka from "./i18n/ka.json";
export const locales = ["en", "ru", "ka"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export function translator(locale: Locale) {
  const dictionary: Record<string, string> =
    locale === "ru" ? ru : locale === "ka" ? ka : {};
  return (source: string) => dictionary[source] ?? source;
}
export function localizedPath(locale: Locale, path = "/") {
  return locale === "en" ? path : `/${locale}${path === "/" ? "/" : path}`;
}
export function alternatePaths(path = "/") {
  return {
    en: path,
    ru: localizedPath("ru", path),
    ka: localizedPath("ka", path),
    "x-default": path,
  };
}
