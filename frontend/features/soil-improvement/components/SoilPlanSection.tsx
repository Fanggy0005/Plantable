"use client"

import { motion } from "motion/react"
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  FlaskConical,
  Leaf,
  Loader2,
  RefreshCw,
  Ruler,
  Sprout,
  TestTube,
  type LucideIcon,
} from "lucide-react"
import { EASE_OUT, Stagger, StaggerItem } from "@/components/motion"
import { SectionHeading } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { DIFFICULTY_VARIANT } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { NutrientAmounts, PlanMode, SoilPlan, SoilPlanStep } from "@/types"
import { soilImprovementMessages } from "../messages"

const PLAN_MODES: PlanMode[] = ["combined", "chemical", "organic"]

const STEP_STYLE: Record<SoilPlanStep["type"], { icon: LucideIcon; tone: string }> = {
  ph_correction: { icon: TestTube, tone: "bg-info-soft text-info" },
  organic_matter: { icon: Leaf, tone: "bg-success-soft text-success" },
  fertilizer: { icon: FlaskConical, tone: "bg-secondary text-primary" },
  retest: { icon: RefreshCw, tone: "bg-muted text-muted-foreground" },
}

interface SoilPlanSectionProps {
  plan: SoilPlan | null
  cropName?: string
  areaRai: string
  onAreaChange: (value: string) => void
  mode: PlanMode
  onModeChange: (mode: PlanMode) => void
  loading?: boolean
  error?: string | null
}

export function SoilPlanSection({
  plan,
  cropName,
  areaRai,
  onAreaChange,
  mode,
  onModeChange,
  loading = false,
  error,
}: SoilPlanSectionProps) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)

  return (
    <section className="space-y-5">
      <SectionHeading icon={Sprout} title={cropName ? t.titleFor(cropName) : t.title} description={t.description} />

      {/* Controls */}
      <div className="surface grid grid-cols-1 gap-4 p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-5">
        <div className="space-y-1.5">
          <Label htmlFor="areaRai" className="text-sm font-semibold text-foreground">
            <Ruler className="size-4 text-primary" />
            {t.area}
          </Label>
          <div className="relative">
            <Input
              id="areaRai"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="any"
              value={areaRai}
              onChange={(e) => onAreaChange(e.target.value)}
              className="h-11 rounded-xl bg-card pr-12 text-base font-semibold tabular-nums shadow-xs"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted-foreground">
              {common.units.rai}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{t.mode}</p>
          <div role="radiogroup" aria-label={t.mode} className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
            {PLAN_MODES.map((m) => {
              const active = m === mode
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onModeChange(m)}
                  className={cn(
                    "relative h-9 rounded-lg text-sm font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="plan-mode-pill"
                      className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{common.planModes[m]}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">{t.modeHint[mode]}</p>
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-danger-soft p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            {t.loadFailed}: {error}
          </span>
        </div>
      ) : !plan ? (
        <div className="surface flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? common.actions.loading : t.selectCrop}
        </div>
      ) : (
        <div className={cn("space-y-5 transition-opacity", loading && "opacity-60")}>
          <PlanSummary plan={plan} />

          {plan.warnings.length > 0 && (
            <div className="rounded-xl border border-warning/25 bg-warning-soft p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-warning">
                <AlertTriangle className="size-4" />
                {t.warningsTitle}
              </h3>
              <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/85">
                {plan.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-warning" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <CalendarClock className="size-4 text-primary" />
              {t.stepsTitle}
            </h3>
            <Stagger className="relative space-y-3 before:absolute before:top-4 before:bottom-4 before:left-5 before:w-px before:bg-border">
              {plan.steps.map((step, i) => (
                <StaggerItem key={`${step.type}-${i}`}>
                  <PlanStepCard step={step} areaRai={plan.areaRai} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {plan.sources.length > 0 && (
            <details className="surface group p-4 text-sm">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-foreground">
                <BookOpen className="size-4 text-muted-foreground" />
                {t.sourcesTitle(plan.sources.length)}
              </summary>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {plan.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  )
}

function PlanSummary({ plan }: { plan: SoilPlan }) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="surface grid grid-cols-1 gap-4 p-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:p-5"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{t.difficulty}</p>
        <Badge variant={DIFFICULTY_VARIANT[plan.difficulty]} className="px-3 py-1 text-sm">
          {common.difficulties[plan.difficulty]}
        </Badge>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">{t.totalsTitle}</p>
        <div className="grid grid-cols-2 gap-2">
          <NutrientTotals label={t.perRai} amounts={plan.nutrientTotalsPerRai} unit={common.units.kgPerRai} />
          <NutrientTotals label={t.wholePlot(plan.areaRai)} amounts={plan.nutrientTotalsPerRai} multiplier={plan.areaRai} unit="kg" />
        </div>
      </div>
    </motion.div>
  )
}

const round1 = (n: number) => Math.round(n * 10) / 10

function NutrientTotals({
  label,
  amounts,
  multiplier = 1,
  unit,
}: {
  label: string
  amounts: NutrientAmounts
  multiplier?: number
  unit: string
}) {
  const { number } = useFormat()
  const rows = [
    ["N", amounts.n],
    ["P₂O₅", amounts.p2o5],
    ["K₂O", amounts.k2o],
  ] as const

  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
        {label} · {unit}
      </p>
      <dl className="space-y-0.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-bold text-foreground tabular-nums">{number(round1(v * multiplier))}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function PlanStepCard({ step, areaRai }: { step: SoilPlanStep; areaRai: number }) {
  const t = useT(soilImprovementMessages)
  const common = useT(commonMessages)
  const { number } = useFormat()
  const style = STEP_STYLE[step.type]
  const kg = (n: number) => `${number(round1(n))} kg`

  const timing =
    step.daysAfterPlanting === null
      ? t.timing.afterHarvest
      : step.daysAfterPlanting < 0
        ? t.timing.before(-step.daysAfterPlanting)
        : step.daysAfterPlanting === 0
          ? t.timing.planting
          : t.timing.after(step.daysAfterPlanting)

  return (
    <div className="relative flex gap-3">
      <span className={cn("relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-background", style.tone)}>
        <style.icon className="size-4.5" />
      </span>
      <div className="surface min-w-0 flex-1 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant="outline">{timing}</Badge>
          <span className="text-xs font-medium text-muted-foreground">{t.stepTypes[step.type]}</span>
        </div>
        <h4 className="text-base font-bold text-foreground">{step.titleTh}</h4>

        {(step.type === "ph_correction" || step.type === "organic_matter") &&
          (step.kgPerRai === null ? (
            <p className="text-sm text-muted-foreground">{t.noQuantity}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {step.type === "ph_correction" && step.material && (
                <QuantityChip label={t.material} value={step.material} />
              )}
              <QuantityChip label={common.units.kgPerRai} value={number(round1(step.kgPerRai))} />
              {step.kgTotal !== null && <QuantityChip label={t.total} value={kg(step.kgTotal)} strong />}
            </div>
          ))}

        {step.type === "fertilizer" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {t.nutrients}: N {number(step.nutrientsPerRai.n)} · P₂O₅ {number(step.nutrientsPerRai.p2o5)} · K₂O{" "}
              {number(step.nutrientsPerRai.k2o)} {common.units.kgPerRai}
            </p>
            {step.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noProducts}</p>
            ) : (
              <table className="w-full overflow-hidden rounded-lg text-sm">
                <thead>
                  <tr className="bg-muted/70 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-1.5 font-semibold">{t.product}</th>
                    <th className="px-3 py-1.5 text-right font-semibold">{common.units.kgPerRai}</th>
                    <th className="px-3 py-1.5 text-right font-semibold">{t.total} ({areaRai} {common.units.rai})</th>
                  </tr>
                </thead>
                <tbody>
                  {step.products.map((p) => (
                    <tr key={p.formula} className="border-t border-border">
                      <td className="px-3 py-1.5 font-mono font-bold text-primary">{p.formula}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{number(round1(p.kgPerRai))}</td>
                      <td className="px-3 py-1.5 text-right font-semibold tabular-nums">{kg(p.kgTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {step.noteTh && <p className="text-sm leading-relaxed text-muted-foreground">{step.noteTh}</p>}
      </div>
    </div>
  )
}

function QuantityChip({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
        strong ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      {label}
      <span className="text-sm font-bold text-foreground tabular-nums">{value}</span>
    </span>
  )
}
