"use client"

import { motion } from "motion/react"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import { EASE_OUT } from "@/components/motion"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { chartMessages } from "./messages"

interface PHScaleGaugeProps {
  currentPh: number
  targetMin?: number
  targetMax?: number
  cropName?: string
  className?: string
}

const pct = (v: number) => (Math.max(0, Math.min(14, v)) / 14) * 100

/** pH spectrum with the crop's optimal band and an animated marker for the measured value. */
export function PHScaleGauge({
  currentPh,
  targetMin = 5.5,
  targetMax = 7.0,
  cropName,
  className,
}: PHScaleGaugeProps) {
  const t = useT(chartMessages).ph
  const ph = Math.max(0, Math.min(14, currentPh))
  const inRange = ph >= targetMin && ph <= targetMax

  const status =
    ph < 4.5
      ? { label: t.status.veryAcidic, cls: "bg-danger-soft text-destructive border-destructive/20" }
      : ph < 5.5
        ? { label: t.status.acidic, cls: "bg-warning-soft text-warning border-warning/25" }
        : ph <= 6.5
          ? { label: t.status.slightlyAcidic, cls: "bg-success-soft text-success border-success/20" }
          : ph <= 7.5
            ? { label: t.status.neutral, cls: "bg-success-soft text-success border-success/20" }
            : ph <= 8.5
              ? { label: t.status.slightlyAlkaline, cls: "bg-info-soft text-info border-info/20" }
              : { label: t.status.alkaline, cls: "bg-info-soft text-info border-info/20" }

  const bandLeft = pct(targetMin)
  const bandWidth = Math.max(1, pct(targetMax) - bandLeft)

  return (
    <div className={cn("surface p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {cropName ? t.optimalFor(cropName, targetMin, targetMax) : t.optimalGeneral(targetMin, targetMax)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl leading-none font-bold tracking-tight text-foreground tabular-nums">{ph}</p>
          <span
            className={cn(
              "mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
              status.cls
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="relative mt-6 pt-2">
        {/* Spectrum: acidic (clay/red) → optimal (green) → alkaline (blue) */}
        <div
          className="relative h-3 w-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--destructive) 0%, var(--chart-5) 22%, var(--chart-3) 36%, var(--chart-2) 46%, var(--success) 52%, var(--chart-4) 68%, var(--info) 100%)",
          }}
        >
          {/* Optimal band */}
          <motion.div
            className="absolute -inset-y-1.5 rounded-md border-2 border-card bg-card/35 shadow-sm ring-1 ring-foreground/10"
            initial={false}
            animate={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          {/* Marker */}
          <motion.div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ left: "50%", opacity: 0 }}
            animate={{ left: `${pct(ph)}%`, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
          >
            <div className="size-5 rounded-full border-[3px] border-card bg-foreground shadow-md" />
          </motion.div>
        </div>

        <div className="mt-2 flex justify-between px-0.5 font-mono text-[10px] text-muted-foreground">
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((n) => (
            <span key={n} className={cn(n >= targetMin && n <= targetMax && "font-bold text-foreground")}>
              {n}
            </span>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{t.acidic}</span>
          <span>{t.neutral}</span>
          <span>{t.alkaline}</span>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
          inRange ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
        )}
      >
        {inRange ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
        {inRange ? t.inRange : t.outOfRange}
      </div>
    </div>
  )
}
