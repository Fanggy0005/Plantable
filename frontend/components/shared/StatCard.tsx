"use client"

import type { LucideIcon } from "lucide-react"
import { CountUp } from "@/components/motion"
import { cn } from "@/lib/utils"

/** KPI tile with an animated number. */
export function StatCard({
  label,
  value,
  decimals = 0,
  format,
  unit,
  icon: Icon,
  hint,
  className,
}: {
  label: React.ReactNode
  value: number
  decimals?: number
  format?: (n: number) => string
  unit?: React.ReactNode
  icon?: LucideIcon
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("surface-interactive p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        {Icon && (
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        <CountUp value={value} decimals={decimals} format={format} />
        {unit && <span className="text-xs font-semibold text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
