"use client"

import Link from "next/link"
import { ArrowUpRight, ShieldCheck, Sprout } from "lucide-react"
import { layoutMessages } from "@/components/layout/messages"
import { useT } from "@/lib/i18n"

export function Footer() {
  const t = useT(layoutMessages)
  const links = [
    { href: "/analyze", label: t.footer.services.analyze },
    { href: "/crops", label: t.footer.services.crops },
    { href: "/history", label: t.footer.services.history },
  ]

  return (
    <footer className="mt-auto bg-forest text-forest-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-forest-accent text-forest">
                <Sprout className="size-4" />
              </span>
              <span className="text-lg font-bold tracking-tight">Plantable</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-forest-muted">{t.footer.about}</p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold tracking-wider text-forest-accent uppercase">
              {t.footer.servicesTitle}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 text-forest-muted transition-colors hover:text-forest-foreground"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-1.5 text-xs font-bold tracking-wider text-forest-accent uppercase">
              <ShieldCheck className="size-4" />
              {t.footer.methodTitle}
            </h4>
            <p className="text-sm leading-relaxed text-forest-muted">{t.footer.method}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-forest-border pt-6 text-xs text-forest-muted">
          © {new Date().getFullYear()} Plantable. {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
