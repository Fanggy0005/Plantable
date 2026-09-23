"use client"

import { motion } from "motion/react"
import { LOCALES, useLocale, useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { layoutMessages } from "./messages"

/** Segmented TH / EN toggle, styled for the dark forest header. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale()
  const t = useT(layoutMessages)

  return (
    <div
      role="radiogroup"
      aria-label={t.language}
      className={cn(
        "relative inline-flex items-center rounded-full border border-forest-border bg-forest-elevated/60 p-0.5 text-[11px] font-bold",
        className
      )}
    >
      {LOCALES.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(l)}
            className={cn(
              "relative z-10 h-7 min-w-9 rounded-full px-2.5 uppercase tracking-wide transition-colors",
              active ? "text-forest" : "text-forest-muted hover:text-forest-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="locale-pill"
                className="absolute inset-0 -z-10 rounded-full bg-forest-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            {l}
          </button>
        )
      })}
    </div>
  )
}
