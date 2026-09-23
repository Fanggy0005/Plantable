"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  Loader2,
  NotebookPen,
  ScanLine,
  Sparkles,
  Sprout,
  Sun,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EASE_OUT } from "@/components/motion"
import { recommendPlants } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { cn } from "@/lib/utils"
import { RegionalSeasonPicker } from "@/features/environment/components/RegionalSeasonPicker"
import { HEALTHY_RANGES, soilAnalysisMessages } from "../messages"
import { NutrientField, PhField } from "./NutrientField"
import { SoilReportScanner } from "./SoilReportScanner"

interface SoilPreset {
  id: string
  icon: LucideIcon
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
}

const PRESETS: SoilPreset[] = [
  { id: "paddy", icon: Waves, nitrogen: 120, phosphorus: 45, potassium: 45, ph: 6.0 },
  { id: "loam", icon: Sprout, nitrogen: 150, phosphorus: 65, potassium: 80, ph: 6.5 },
  { id: "sandy", icon: Sun, nitrogen: 70, phosphorus: 35, potassium: 95, ph: 5.5 },
  { id: "acidic", icon: FlaskConical, nitrogen: 50, phosphorus: 20, potassium: 40, ph: 4.2 },
]

type TabKey = "manual" | "ocr"

export function SoilInputForm() {
  const router = useRouter()
  const t = useT(soilAnalysisMessages)
  const c = useT(commonMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("manual")
  const [autoFillSuccess, setAutoFillSuccess] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const [form, setForm] = useState({
    nitrogen: "120",
    phosphorus: "45",
    potassium: "50",
    ph: "6.2",
    province: "nakhon_ratchasima",
    season: "rainy",
    notes: "",
  })

  const handleOcrAutoFill = (data: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
    notes?: string
  }) => {
    setForm((prev) => ({
      ...prev,
      nitrogen: data.nitrogen.toString(),
      phosphorus: data.phosphorus.toString(),
      potassium: data.potassium.toString(),
      ph: data.ph.toString(),
      notes: data.notes || t.form.ocrNote,
    }))
    setActivePreset(null)
    setActiveTab("manual")
    setAutoFillSuccess(true)
    if (error) setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name !== "notes") setActivePreset(null)
    if (error) setError(null)
    if (autoFillSuccess) setAutoFillSuccess(false)
  }

  const applyPreset = (preset: SoilPreset) => {
    const name = t.presets.items[preset.id].name
    setForm((prev) => ({
      ...prev,
      nitrogen: preset.nitrogen.toString(),
      phosphorus: preset.phosphorus.toString(),
      potassium: preset.potassium.toString(),
      ph: preset.ph.toString(),
      notes: t.form.presetNote(name),
    }))
    setActivePreset(preset.id)
    setActiveTab("manual")
    if (error) setError(null)
    if (autoFillSuccess) setAutoFillSuccess(false)
    toast.success(t.form.presetApplied(name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const n = parseFloat(form.nitrogen)
    const p = parseFloat(form.phosphorus)
    const k = parseFloat(form.potassium)
    const phVal = parseFloat(form.ph)

    if (isNaN(n) || isNaN(p) || isNaN(k) || isNaN(phVal)) {
      setError(t.form.errors.incomplete)
      setLoading(false)
      return
    }

    if (phVal < 0 || phVal > 14) {
      setError(t.form.errors.phRange)
      setLoading(false)
      return
    }

    try {
      const result = await recommendPlants({
        nitrogen: n,
        phosphorus: p,
        potassium: k,
        ph: phVal,
        province: form.province || undefined,
        season: form.season || undefined,
        notes: form.notes || undefined,
      })

      // Store results in sessionStorage and transition to /results
      sessionStorage.setItem("plantResult", JSON.stringify(result))
      router.push("/results")
    } catch (err) {
      console.error(err)
      const message = (err instanceof Error && err.message) || t.form.errors.failed
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const presetPicker = (
    <PresetPicker presets={PRESETS} activeId={activePreset} onSelect={applyPreset} />
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="gap-5">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-muted p-1 ring-1 ring-border">
            {(
              [
                { key: "manual", icon: FlaskConical, label: t.tabs.manual, hint: t.tabs.manualHint },
                { key: "ocr", icon: ScanLine, label: t.tabs.ocr, hint: t.tabs.ocrHint },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.key
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="h-auto min-h-12 justify-start gap-3 rounded-xl px-3 py-2.5 data-active:bg-transparent sm:px-4"
                >
                  {active && (
                    <motion.span
                      layoutId="analyze-tab-pill"
                      className="absolute inset-0 rounded-xl bg-card shadow-(--shadow-card) ring-1 ring-border"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                    )}
                  >
                    <tab.icon className="size-4" />
                  </span>
                  <span className="relative flex min-w-0 flex-col items-start text-left">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {tab.label}
                      {tab.key === "ocr" && (
                        <span className="rounded-full bg-secondary px-1.5 py-px text-[10px] font-bold text-primary">
                          {t.tabs.smart}
                        </span>
                      )}
                    </span>
                    <span className="hidden truncate text-xs font-normal text-muted-foreground sm:block">
                      {tab.hint}
                    </span>
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <AnimatePresence initial={false}>
            {autoFillSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success-soft p-3.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="flex-1">{t.form.autoFilled}</span>
                  <button
                    type="button"
                    onClick={() => setAutoFillSuccess(false)}
                    aria-label={c.actions.close}
                    className="-m-1 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <TabsContent value="manual">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="space-y-5"
            >
              <div className="lg:hidden">{presetPicker}</div>

              <form onSubmit={handleSubmit} className="surface space-y-6 p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FlaskConical className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{t.form.title}</h2>
                    <p className="text-sm text-muted-foreground">{t.form.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  <NutrientField
                    id="nitrogen"
                    symbol="N"
                    label={c.nutrients.nitrogen}
                    hint={t.form.hints.nitrogen}
                    unit={c.units.mgPerKg}
                    value={form.nitrogen}
                    onChange={handleChange}
                    placeholder={t.form.placeholder("120")}
                    range={HEALTHY_RANGES.nitrogen}
                  />
                  <NutrientField
                    id="phosphorus"
                    symbol="P"
                    label={c.nutrients.phosphorus}
                    hint={t.form.hints.phosphorus}
                    unit={c.units.mgPerKg}
                    value={form.phosphorus}
                    onChange={handleChange}
                    placeholder={t.form.placeholder("45")}
                    range={HEALTHY_RANGES.phosphorus}
                  />
                  <NutrientField
                    id="potassium"
                    symbol="K"
                    label={c.nutrients.potassium}
                    hint={t.form.hints.potassium}
                    unit={c.units.mgPerKg}
                    value={form.potassium}
                    onChange={handleChange}
                    placeholder={t.form.placeholder("50")}
                    range={HEALTHY_RANGES.potassium}
                  />
                  <PhField
                    label={c.nutrients.ph}
                    hint={t.form.hints.ph}
                    value={form.ph}
                    onChange={handleChange}
                    placeholder={t.form.placeholder("6.2")}
                    range={HEALTHY_RANGES.ph}
                  />
                </div>

                <div className="space-y-3 border-t border-border pt-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t.form.contextTitle}</h3>
                    <p className="text-xs text-muted-foreground">{t.form.contextDescription}</p>
                  </div>
                  <RegionalSeasonPicker
                    selectedProvince={form.province}
                    selectedSeason={form.season}
                    onProvinceChange={(province) => setForm((prev) => ({ ...prev, province }))}
                    onSeasonChange={(season) => setForm((prev) => ({ ...prev, season }))}
                  />
                </div>

                <div className="space-y-1.5 border-t border-border pt-5">
                  <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                    <NotebookPen className="size-4 text-muted-foreground" />
                    {t.form.notes}
                    <span className="text-xs font-normal text-muted-foreground">({t.form.optional})</span>
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder={t.form.notesPlaceholder}
                    className="h-11 rounded-xl border-input bg-card px-3.5 shadow-xs hover:border-primary/30 focus-visible:border-primary"
                  />
                </div>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-danger-soft p-3.5 text-sm text-destructive"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div whileHover={loading ? undefined : { scale: 1.01 }} whileTap={loading ? undefined : { scale: 0.985 }}>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="group h-13 w-full rounded-xl text-base font-semibold shadow-[0_8px_24px_-8px_var(--primary)] disabled:opacity-80"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="size-5 animate-spin" />
                          {t.form.submitting}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="size-4.5" />
                          {t.form.submit}
                          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </TabsContent>

          <TabsContent value="ocr">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <SoilReportScanner onAutoFill={handleOcrAutoFill} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="hidden lg:block">{presetPicker}</div>
        <HealthyRangesGuide />
      </aside>
    </div>
  )
}

function PresetPicker({
  presets,
  activeId,
  onSelect,
}: {
  presets: SoilPreset[]
  activeId: string | null
  onSelect: (preset: SoilPreset) => void
}) {
  const t = useT(soilAnalysisMessages)

  return (
    <div className="surface p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t.presets.title}</h3>
        <span className="text-xs text-muted-foreground">· {t.presets.description}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {presets.map((preset) => {
          const item = t.presets.items[preset.id]
          const active = activeId === preset.id
          return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              whileTap={{ scale: 0.97 }}
              aria-pressed={active}
              className={cn(
                "relative flex min-h-14 items-start gap-2.5 rounded-xl border p-2.5 text-left transition-colors sm:p-3",
                active
                  ? "border-primary/40 bg-secondary"
                  : "border-border bg-card hover:border-primary/25 hover:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
                )}
              >
                <preset.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug font-semibold text-foreground">{item.name}</span>
                <span className="block text-xs text-muted-foreground">{item.desc}</span>
              </span>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="size-3" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function HealthyRangesGuide() {
  const t = useT(soilAnalysisMessages)
  const c = useT(commonMessages)
  const rows = [
    { symbol: "N", label: c.nutrients.nitrogen, range: HEALTHY_RANGES.nitrogen, unit: c.units.mgPerKg },
    { symbol: "P", label: c.nutrients.phosphorus, range: HEALTHY_RANGES.phosphorus, unit: c.units.mgPerKg },
    { symbol: "K", label: c.nutrients.potassium, range: HEALTHY_RANGES.potassium, unit: c.units.mgPerKg },
    { symbol: "pH", label: c.nutrients.ph, range: HEALTHY_RANGES.ph, unit: "" },
  ]

  return (
    <div className="surface p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-foreground">{t.guide.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.guide.description}</p>
      <ul className="mt-4 divide-y divide-border">
        {rows.map((row) => (
          <li key={row.symbol} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-secondary px-1 text-xs font-bold text-primary">
                {row.symbol}
              </span>
              <span className="truncate text-sm text-foreground">{row.label}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
              {row.range.min}–{row.range.max}
              {row.unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{row.unit}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2.5 rounded-xl bg-info-soft p-3 text-xs leading-relaxed text-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" />
        <p>
          <span className="font-semibold">{t.guide.tipTitle}: </span>
          {t.guide.tip}
        </p>
      </div>
    </div>
  )
}
