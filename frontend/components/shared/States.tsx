"use client"

import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/motion"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"

/** Illustrated empty state: soft icon halo, title, description and optional action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <FadeIn
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
        className
      )}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-3 rounded-full bg-secondary/70 blur-md" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-(--shadow-card) ring-1 ring-border animate-float">
          <Icon className="size-7" />
        </div>
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </FadeIn>
  )
}

/** Error panel with an optional retry. */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  onRetry?: () => void
  className?: string
}) {
  const t = useT(commonMessages)
  return (
    <FadeIn
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-danger-soft px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-card text-destructive ring-1 ring-destructive/15">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title ?? t.errors.generic}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw />
          {t.actions.retry}
        </Button>
      )}
    </FadeIn>
  )
}
