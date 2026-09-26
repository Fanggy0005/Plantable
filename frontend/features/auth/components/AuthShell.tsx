"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, CheckCircle2, Sprout, type LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EASE_OUT, FadeIn, Stagger, StaggerItem } from "@/components/motion"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { authMessages } from "../messages"

/** Split auth layout: form on the left, forest brand panel with benefits on the right (desktop). */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  const t = useT(authMessages)

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16">
      {/* Form column */}
      <div className="flex items-center justify-center">
        <FadeIn immediate className="w-full max-w-md">
          <div className="mb-8 space-y-2">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sprout className="size-5" />
            </span>
            <h1 className="pt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
          </div>

          <div className="surface p-6 sm:p-8">{children}</div>

          <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
            {footer}
            <p className="text-xs">
              {t.guestNote}{" "}
              <Link href="/analyze" className="font-semibold text-primary underline-offset-4 hover:underline">
                {t.guestLink}
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Brand panel */}
      <FadeIn
        immediate
        delay={0.1}
        className="relative hidden overflow-hidden rounded-3xl bg-forest-gradient p-10 text-forest-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-60" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-forest-accent/15 blur-3xl" />

        <div className="relative space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-border bg-forest-elevated/70 px-3 py-1 text-xs font-semibold text-forest-accent">
            <Sprout className="size-3.5" />
            {t.panel.eyebrow}
          </span>
          <h2 className="max-w-sm text-3xl leading-tight font-bold tracking-tight">{t.panel.title}</h2>
          <Stagger immediate stagger={0.08} className="space-y-3.5">
            {t.panel.benefits.map((b, i) => (
              <StaggerItem key={i} className="flex items-start gap-3 text-forest-muted">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-forest-accent" />
                <span className="text-base">{b}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <figure className="relative mt-10 rounded-2xl border border-forest-border bg-forest-elevated/60 p-5 backdrop-blur-sm">
          <blockquote className="text-base leading-relaxed">{t.panel.quote}</blockquote>
          <figcaption className="mt-2 text-sm text-forest-muted">— {t.panel.quoteBy}</figcaption>
        </figure>
      </FadeIn>
    </div>
  )
}

/** Labeled input with a leading icon and optional trailing slot. */
export function IconField({
  id,
  label,
  hint,
  icon: Icon,
  trailing,
  className,
  ...inputProps
}: React.ComponentProps<"input"> & {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  trailing?: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          className={cn(
            "h-11 rounded-xl border-input bg-card pl-10 text-base shadow-xs md:text-sm",
            trailing && "pr-11",
            className
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  )
}

/** Animated inline error banner. */
export function FormError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-danger-soft p-3 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
