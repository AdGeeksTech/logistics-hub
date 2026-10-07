import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { cache } from "react";
import { getStore } from "./store";
import { locales, translator, type Locale, type TextOverrides } from "./i18n";

type AllOverrides = Record<Locale, TextOverrides>;
export const textsTag = "texts";

async function load(draft: boolean): Promise<AllOverrides> {
  const all = Object.fromEntries(locales.map((l) => [l, {}])) as AllOverrides;
  const store = getStore();
  if (!store) return all;
  for (const row of await store.getTexts()) {
    const value = draft && row.hasDraft ? row.draft : row.published;
    if (value !== null && all[row.locale]) all[row.locale][row.key] = value;
  }
  return all;
}
// Published texts are cached until the admin publishes (see textsTag).
// Draft mode skips this cache, so previews always read the database.
const loadPublished = unstable_cache(() => load(false), ["site-texts"], {
  tags: [textsTag],
});

export const getTextOverrides = cache(
  async (locale: Locale): Promise<TextOverrides> => {
    const { isEnabled } = await draftMode();
    try {
      return (isEnabled ? await load(true) : await loadPublished())[locale];
    } catch (error) {
      // The built-in texts are always a safe fallback.
      console.error("Could not load edited site texts", error);
      return {};
    }
  },
);

export async function getT(locale: Locale) {
  return translator(locale, await getTextOverrides(locale));
}
