import type { Locale } from "./i18n";

// Formatted by hand: Node and browsers ship different ICU data for ka/ru,
// so Intl output would differ between the server render and hydration.
const separators = (locale: Locale) =>
  locale === "en" ? [",", "."] : [" ", ","];
// 12,000 · 82.5 in English; 12 000 · 82,5 in Russian and Georgian.
export function groupDigits(value: number, locale: Locale) {
  const [group, decimal] = separators(locale);
  const [whole, fraction] = String(Math.round(value * 100) / 100).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return fraction ? grouped + decimal + fraction : grouped;
}
// Whole dollars without decimals, otherwise always two: $1,087.50.
export function money(value: number, locale: Locale) {
  const [group, decimal] = separators(locale);
  const [whole, cents] = value.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `$${grouped}${cents === "00" ? "" : decimal + cents}`;
}
export function formatDate(iso: string, locale: Locale) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  // prettier-ignore
  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return locale === "en"
    ? `${months[Number(month) - 1]} ${Number(day)}, ${year}`
    : `${day}.${month}.${year}`;
}
