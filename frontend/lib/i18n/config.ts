export const LOCALES = ["th", "en"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "th"
export const LOCALE_COOKIE = "plantable-locale"

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value)
}

/** BCP 47 tag for Intl formatting */
export const INTL_LOCALE: Record<Locale, string> = {
  th: "th-TH",
  en: "en-US",
}

/**
 * Messages for one feature, in both languages.
 * `en` must mirror the shape of `th`, so a missing key is a type error.
 * Values may be strings or functions for interpolation, e.g. `(n: number) => \`${n} crops\``.
 */
export function defineMessages<T extends Record<string, unknown>>(messages: { th: T; en: T }) {
  return messages
}
