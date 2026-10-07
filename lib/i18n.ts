import ru from "./i18n/ru.json";
import ka from "./i18n/ka.json";
export const locales = ["en", "ru", "ka"] as const;
export type Locale = (typeof locales)[number];
// Texts edited in the admin, keyed by their English source string.
export type TextOverrides = Record<string, string>;
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {},
  ru,
  ka,
};
// The built-in text for a key, before any admin edits.
export function defaultText(locale: Locale, source: string) {
  return dictionaries[locale][source] ?? source;
}
export function translator(locale: Locale, overrides: TextOverrides = {}) {
  return (source: string) => overrides[source] ?? defaultText(locale, source);
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
