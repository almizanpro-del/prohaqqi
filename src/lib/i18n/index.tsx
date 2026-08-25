"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ar, type Dict } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

type I18nValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dict;
  toggleLocale: () => void;
};

const dicts: Record<Locale, Dict> = { ar, en };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();

  const toggleLocale = useCallback(() => {
    document.cookie = `haqqi_locale=${initialLocale === "ar" ? "en" : "ar"};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }, [initialLocale, router]);

  const value = useMemo<I18nValue>(
    () => ({
      locale: initialLocale,
      dir: initialLocale === "ar" ? "rtl" : "ltr",
      t: dicts[initialLocale],
      toggleLocale,
    }),
    [initialLocale, toggleLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
