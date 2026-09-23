"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { INTL_LOCALE, LOCALE_COOKIE, type Locale } from "./config"

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = next
  }, [])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useLocale() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useLocale must be used within <I18nProvider>")
  return ctx
}

/**
 * Pick the active language from a `defineMessages` object.
 *   const t = useT(messages)
 *   t.title
 */
export function useT<T>(messages: { th: T; en: T }): T {
  return messages[useLocale().locale]
}

/** Formatting helpers bound to the active locale. */
export function useFormat() {
  const { locale } = useLocale()
  return useMemo(() => {
    const tag = INTL_LOCALE[locale]
    return {
      locale,
      /** Pick between Thai and English variants of API data, falling back to whichever exists. */
      pick: (th?: string | null, en?: string | null) =>
        (locale === "th" ? th || en : en || th) ?? "",
      number: (n: number, opts?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(tag, opts).format(n),
      currency: (n: number) =>
        new Intl.NumberFormat(tag, { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n),
      date: (d: string | number | Date, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }) =>
        new Intl.DateTimeFormat(tag, opts).format(new Date(d)),
      dateTime: (d: string | number | Date) =>
        new Intl.DateTimeFormat(tag, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)),
      relative: (d: string | number | Date) => {
        const diffSec = (new Date(d).getTime() - Date.now()) / 1000
        const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto" })
        const units: [Intl.RelativeTimeFormatUnit, number][] = [
          ["year", 31536000],
          ["month", 2592000],
          ["day", 86400],
          ["hour", 3600],
          ["minute", 60],
        ]
        for (const [unit, sec] of units) {
          if (Math.abs(diffSec) >= sec) return rtf.format(Math.round(diffSec / sec), unit)
        }
        return rtf.format(Math.round(diffSec), "second")
      },
    }
  }, [locale])
}
