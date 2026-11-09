"use client"

import { motion } from "motion/react"
import { FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { soilAnalysisMessages } from "../messages"

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
            <span className="font-medium text-foreground/80">{t.soil.onReport}</span> {reportLabel}
          </span>
        </p>
      )}
    </div>
  )
}

function FieldLabel({ htmlFor, symbol, label }: { htmlFor?: string; symbol: string; label: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-secondary px-1 text-xs font-bold text-primary">
        {symbol}
      </span>
      {label}
    </Label>
  )
}

const inputClass =
  "h-12 rounded-xl border-input bg-card pr-16 text-lg font-semibold tabular-nums shadow-xs hover:border-primary/30 focus-visible:border-primary"

/** Number input with a unit suffix. */
export function NumberField({
  id,
  symbol,
  label,
  hint,
  reportLabel,
  unit,
  value,
  onChange,
  placeholder,
  max,
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
  max?: number
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} symbol={symbol} label={label} />
      <div className="relative">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          min="0"
          max={max}
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
      <FieldHelp hint={hint} reportLabel={reportLabel} />
    </div>
  )
}

/** Accepted pH input range, matching the API validation. */
export const PH_INPUT = { min: 3, max: 10 } as const
const PH_SCALE = { min: 3, max: 10, idealMin: 5.5, idealMax: 7.0 }

/** pH input with a colored acid→alkaline scale and an animated marker. */
export function PhField({
  label,
  hint,
  reportLabel,
  value,
  onChange,
  placeholder,
}: {
  label: string
  hint: string
  reportLabel?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}) {
  const num = parseFloat(value)
  const hasValue = !isNaN(num)
  const pos = (v: number) => clampPct(((v - PH_SCALE.min) / (PH_SCALE.max - PH_SCALE.min)) * 100)

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor="ph" symbol="pH" label={label} />
      <div className="relative">
        <Input
          id="ph"
          name="ph"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={PH_INPUT.min}
          max={PH_INPUT.max}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className={inputClass}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-medium text-muted-foreground">
          {PH_INPUT.min}–{PH_INPUT.max}
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
          <div
            className="absolute -inset-y-0.5 rounded-full ring-2 ring-card/90"
            style={{ left: `${pos(PH_SCALE.idealMin)}%`, width: `${pos(PH_SCALE.idealMax) - pos(PH_SCALE.idealMin)}%` }}
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
        <div className="relative mt-1.5 h-4 text-[11px] font-medium text-muted-foreground tabular-nums">
          {[3, 5.5, 7, 10].map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${pos(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
      <FieldHelp hint={hint} reportLabel={reportLabel} />
    </div>
  )
}

/** A row of mutually exclusive options rendered as large tap targets. */
export function ChoiceField<T extends string>({
  name,
  label,
  symbol,
  options,
  value,
  onChange,
  columns = 3,
  hint,
}: {
  name: string
  label: string
  symbol?: string
  options: { value: T; label: string; desc?: string }[]
  value: T | ""
  onChange: (value: T) => void
  columns?: 2 | 3
  hint?: string
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        {symbol && (
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-secondary px-1 text-xs font-bold text-primary">
            {symbol}
          </span>
        )}
        {label}
      </legend>
      <div role="radiogroup" className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              name={name}
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-12 flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-colors",
                active
                  ? "border-primary bg-secondary ring-2 ring-primary/15"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/60"
              )}
            >
              <span className={cn("text-sm leading-snug font-semibold", active ? "text-primary" : "text-foreground")}>
                {option.label}
              </span>
              {option.desc && <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{option.desc}</span>}
            </button>
          )
        })}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </fieldset>
  )
}
