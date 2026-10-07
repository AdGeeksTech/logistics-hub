"use client";
import { createContext, useContext } from "react";
import { translator, type Locale, type TextOverrides } from "@/lib/i18n";

// Carries the admin-edited texts of the current page language to client
// components. Server components read them with getT() instead.
const TextsContext = createContext<{
  locale: Locale;
  overrides: TextOverrides;
}>({ locale: "en", overrides: {} });

export function TextsProvider({
  locale,
  overrides,
  children,
}: {
  locale: Locale;
  overrides: TextOverrides;
  children: React.ReactNode;
}) {
  return (
    <TextsContext.Provider value={{ locale, overrides }}>
      {children}
    </TextsContext.Provider>
  );
}

export function useT(locale: Locale) {
  const context = useContext(TextsContext);
  return translator(
    locale,
    context.locale === locale ? context.overrides : undefined,
  );
}
