"use client"

import { motion } from "motion/react"
import { FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { soilAnalysisMessages } from "../messages"

type Status = "low" | "ok" | "high" | "empty"

const STATUS_STYLE: Record<Status, { dot: string; text: string; marker: string }> = {
  low: { dot: "bg-warning", text: "text-warning", marker: "bg-warning" },
  ok: { dot: "bg-success", text: "text-success", marker: "bg-success" },
  high: { dot: "bg-info", text: "text-info", marker: "bg-info" },
  empty: { dot: "bg-muted-foreground/40", text: "text-muted-foreground", marker: "bg-muted-foreground/40" },
}

const clampPct = (n: number) => Math.max(0, Math.min(100, n))

/** Hint line plus the label to look for on a lab report, so users can match fields to their sheet. */
function FieldHelp({ hint, reportLabel }: { hint: string; reportLabel?: string }) {
  const t = useT(soilAnalysisMessages)
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>{hint}</p>
      {reportLabel && (
        <p className="flex items-start gap-1.5">
          <FileText className="mt-px size-3.5 shrink-0" />
          <span>
            <span className="font-medium text-foreground/80">{t.form.onReport}</span> {reportLabel}
          </span>
        </p>
      )}
    </div>
  )
}

const inputClass =
  "h-12 rounded-xl border-input bg-card pr-16 text-lg font-semibold tabular-nums shadow-xs hover:border-primary/30 focus-visible:border-primary"

/** Number input with a unit suffix and a live meter comparing the value against a healthy band. */
export function NutrientField({
  id,
  symbol,
  label,
  hint,
  reportLabel,
  unit,
  value,
  onChange,
  placeholder,
  range,
}: {
  id: string
  symbol: string
  label: string
  hint: string
  reportLabel?: string
  unit: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  range: { min: number; max: number; scaleMax: number }
}) {
  const t = useT(soilAnalysisMessages)
  const num = parseFloat(value)
  const hasValue = !isNaN(num)
  const status: Status = !hasValue ? "empty" : num < range.min ? "low" : num > range.max ? "high" : "ok"
  const style = STATUS_STYLE[status]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-foreground">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary">
            {symbol}
          </span>
          {label}
        </Label>
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", style.text)}>
          <span className={cn("size-1.5 rounded-full", style.dot)} />
          {t.form.status[status]}
        </span>
      </div>

      <div className="relative">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={inputClass}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted-foreground">
          {unit}
        </span>
      </div>

      {/* Range meter: shaded healthy band + animated marker */}
      <div className="relative h-1.5 rounded-full bg-muted" aria-hidden>
        <div
          className="absolute inset-y-0 rounded-full bg-success/25"
          style={{
            left: `${(range.min / range.scaleMax) * 100}%`,
            width: `${((range.max - range.min) / range.scaleMax) * 100}%`,
          }}
        />
        {hasValue && (
          <motion.span
            className={cn("absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", style.marker)}
            initial={false}
            animate={{ left: `${clampPct((num / range.scaleMax) * 100)}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        )}
      </div>
      <FieldHelp hint={hint} reportLabel={reportLabel} />
    </div>
  )
}

type PhStatus = "strongAcid" | "acid" | "ideal" | "alkaline"

const PH_TONE: Record<PhStatus, string> = {
  strongAcid: "text-destructive",
  acid: "text-warning",
  ideal: "text-success",
  alkaline: "text-info",
}

const PH_DOT: Record<PhStatus, string> = {
  strongAcid: "bg-destructive",
  acid: "bg-warning",
  ideal: "bg-success",
  alkaline: "bg-info",
}

/** pH input with a colored acid→alkaline gradient scale and an animated marker. */
export function PhField({
  label,
  hint,
  reportLabel,
  value,
  onChange,
  placeholder,
  range,
}: {
  label: string
  hint: string
  reportLabel?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  range: { min: number; max: number; scaleMin: number; scaleMax: number }
}) {
  const t = useT(soilAnalysisMessages)
  const num = parseFloat(value)
  const hasValue = !isNaN(num)
  const status: PhStatus | null = !hasValue
    ? null
    : num < 4.5
      ? "strongAcid"
      : num < range.min
        ? "acid"
        : num <= range.max
          ? "ideal"
          : "alkaline"
  const span = range.scaleMax - range.scaleMin
  const pos = (v: number) => clampPct(((v - range.scaleMin) / span) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="ph" className="text-sm font-semibold text-foreground">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-secondary px-1 text-xs font-bold text-primary">
            pH
          </span>
          {label}
        </Label>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold",
            status ? PH_TONE[status] : "text-muted-foreground"
          )}
        >
          <span className={cn("size-1.5 rounded-full", status ? PH_DOT[status] : "bg-muted-foreground/40")} />
          {status ? t.form.phStatus[status] : t.form.status.empty}
        </span>
      </div>

      <div className="relative">
        <Input
          id="ph"
          name="ph"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="14"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={inputClass}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted-foreground">
          0–14
        </span>
      </div>

      <div className="pt-1" aria-hidden>
        <div
          className="relative h-2 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--destructive), var(--chart-5), var(--warning), var(--success) 45%, var(--success) 58%, var(--chart-4), var(--info))",
          }}
        >
          {/* Ideal band outline */}
          <div
            className="absolute -inset-y-0.5 rounded-full ring-2 ring-card/90"
            style={{ left: `${pos(range.min)}%`, width: `${pos(range.max) - pos(range.min)}%` }}
          />
          {hasValue && (
            <motion.span
              className="absolute top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-foreground/80"
              initial={false}
              animate={{ left: `${pos(num)}%` }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            />
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>{t.form.phScale.acid}</span>
          <span>{t.form.phScale.neutral}</span>
          <span>{t.form.phScale.alkaline}</span>
        </div>
      </div>
      <FieldHelp hint={hint} reportLabel={reportLabel} />
    </div>
  )
}
