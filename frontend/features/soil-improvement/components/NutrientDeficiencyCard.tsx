"use client"

import { AlertCircle, AlertTriangle, ArrowUpCircle, CheckCircle2, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { Stagger, StaggerItem, EASE_OUT } from "@/components/motion"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import type { NutrientDeficiencyStatus, NutrientDiagnostic } from "@/types"
import { soilImprovementMessages } from "../messages"

interface NutrientDeficiencyCardProps {
  diagnostics: NutrientDiagnostic[]
}

type Tone = "danger" | "warning" | "success" | "info"

export const STATUS_TONE: Record<NutrientDeficiencyStatus, Tone> = {
  severe_deficiency: "danger",
  mild_deficiency: "warning",
  optimal: "success",
  mild_excess: "info",
  severe_excess: "info",
}

const TONE_STYLES: Record<Tone, { badge: string; marker: string; icon: LucideIcon; accent: string }> = {
  danger: {
    badge: "bg-danger-soft text-destructive border-destructive/20",
    marker: "bg-destructive ring-destructive/25",
    icon: AlertCircle,
    accent: "before:bg-destructive",
  },
  warning: {
    badge: "bg-warning-soft text-warning border-warning/25",
    marker: "bg-warning ring-warning/25",
    icon: AlertTriangle,
    accent: "before:bg-warning",
  },
  success: {
    badge: "bg-success-soft text-success border-success/20",
    marker: "bg-success ring-success/25",
    icon: CheckCircle2,
    accent: "before:bg-success",
  },
  info: {
    badge: "bg-info-soft text-info border-info/20",
    marker: "bg-info ring-info/25",
    icon: ArrowUpCircle,
    accent: "before:bg-info",
  },
}

/** Scale domain for the range bar: pH on its practical 3–10 scale, nutrients from 0 with headroom. */
function scaleFor(item: NutrientDiagnostic) {
  if (item.nutrient === "ph") return { lo: 3, hi: 10 }
  const hi = Math.max(item.optimalRange.max * 1.6, item.currentValue * 1.15, 1)
  return { lo: 0, hi }
}

function pct(value: number, lo: number, hi: number) {
  return Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100))
}

function NutrientRangeBar({ item, tone }: { item: NutrientDiagnostic; tone: Tone }) {
  const t = useT(soilImprovementMessages)
  const { lo, hi } = scaleFor(item)
  const minPct = pct(item.optimalRange.min, lo, hi)
  const maxPct = pct(item.optimalRange.max, lo, hi)
  const currentPct = pct(item.currentValue, lo, hi)

  return (
    <div className="space-y-1.5">
      <div className="relative h-2.5 rounded-full bg-muted">
        {/* Optimal band */}
        <motion.div
          className="absolute inset-y-0 rounded-full bg-success/25 ring-1 ring-success/30 ring-inset"
          style={{ left: `${minPct}%`, width: `${Math.max(maxPct - minPct, 2)}%` }}
          initial={{ opacity: 0, scaleX: 0.6 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        />
        {/* Current value marker */}
        <motion.div
          className={cn(
            "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow-sm ring-4",
            TONE_STYLES[tone].marker
          )}
          initial={{ left: "0%", opacity: 0 }}
          whileInView={{ left: `${currentPct}%`, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
        />
      </div>
      <div className="relative h-4 text-[11px] text-muted-foreground">
        <span className="absolute left-0">{t.diagnostics.low}</span>
        <span
          className="absolute -translate-x-1/2 font-medium whitespace-nowrap text-success"
          style={{ left: `${Math.min(Math.max((minPct + maxPct) / 2, 22), 78)}%` }}
        >
          {item.optimalRange.min}–{item.optimalRange.max}
        </span>
        <span className="absolute right-0">{t.diagnostics.high}</span>
      </div>
    </div>
  )
}

export function NutrientDeficiencyCard({ diagnostics }: NutrientDeficiencyCardProps) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)
  const { locale } = useFormat()

  return (
    <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {diagnostics.map((item) => {
        const tone = STATUS_TONE[item.status] ?? "info"
        const styles = TONE_STYLES[tone]
        const StatusIcon = styles.icon
        const isPh = item.nutrient === "ph"
        const unit = isPh ? "" : common.units.mgPerKg
        const statusLabel = locale === "th" ? item.statusLabelTh || t.status[item.status] : t.status[item.status]
        const name = common.nutrients[item.nutrient] ?? item.name

        return (
          <StaggerItem
            key={item.nutrient}
            className={cn(
              "surface-interactive relative flex flex-col gap-4 overflow-hidden p-5",
              "before:absolute before:inset-y-0 before:left-0 before:w-1",
              styles.accent
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <h4 className="text-base font-bold text-foreground">
                  {name}
                  {!isPh && (
                    <span className="ml-1.5 text-sm font-medium text-muted-foreground">
                      ({item.nutrient === "nitrogen" ? "N" : item.nutrient === "phosphorus" ? "P" : "K"})
                    </span>
                  )}
                </h4>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    styles.badge
                  )}
                >
                  <StatusIcon className="size-3.5" />
                  {statusLabel}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {item.currentValue}
                </p>
                {unit && <p className="text-[11px] font-medium text-muted-foreground">{unit}</p>}
              </div>
            </div>

            <NutrientRangeBar item={item} tone={tone} />

            <p className="text-xs text-muted-foreground">
              {t.diagnostics.optimum}:{" "}
              <span className="font-semibold text-foreground">
                {item.optimalRange.optimal} {unit}
              </span>
            </p>

            {(item.symptomsTh || item.impactTh) && (
              <dl className="mt-auto space-y-2 border-t border-border pt-3 text-xs leading-relaxed">
                {item.symptomsTh && (
                  <div>
                    <dt className="font-semibold text-foreground">{t.diagnostics.symptoms}</dt>
                    <dd className="text-muted-foreground">{item.symptomsTh}</dd>
                  </div>
                )}
                {item.impactTh && (
                  <div>
                    <dt className="font-semibold text-foreground">{t.diagnostics.impact}</dt>
                    <dd className="text-muted-foreground">{item.impactTh}</dd>
                  </div>
                )}
              </dl>
            )}
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
