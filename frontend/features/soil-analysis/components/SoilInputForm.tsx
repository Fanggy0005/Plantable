"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import {
  AlertCircle,
  ArrowRight,
  Check,
  FlaskConical,
  Info,
  Lightbulb,
  Loader2,
  Map as MapIcon,
  NotebookPen,
  Sparkles,
  Sprout,
  Sun,
  TestTube2,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EASE_OUT } from "@/components/motion"
import { ProvincePicker } from "@/features/environment/components/ProvincePicker"
import { useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { runSoilCheck } from "@/lib/soil-check"
import { cn } from "@/lib/utils"
import type { LandType, NutrientLevel, SiteInput, SoilInput, SoilTexture, WaterSupply } from "@/types"
import { soilAnalysisMessages } from "../messages"
import { ChoiceField, NumberField, PH_INPUT, PhField } from "./NutrientField"

type InputMode = SoilInput["inputMode"]

interface FormState {
  landType: LandType | ""
  waterSupply: WaterSupply | ""
  soilTexture: SoilTexture | ""
  inputMode: InputMode
  ph: string
  organicMatterPct: string
  phosphorusMgKg: string
  potassiumMgKg: string
  nitrogenLevel: NutrientLevel | ""
  phosphorusLevel: NutrientLevel | ""
  potassiumLevel: NutrientLevel | ""
  province: string
  notes: string
}

const EMPTY_FORM: FormState = {
  landType: "",
  waterSupply: "",
  soilTexture: "",
  inputMode: "lab",
  ph: "",
  organicMatterPct: "",
  phosphorusMgKg: "",
  potassiumMgKg: "",
  nitrogenLevel: "",
  phosphorusLevel: "",
  potassiumLevel: "",
  province: "nakhon_ratchasima",
  notes: "",
}

interface SoilPreset {
  id: string
  icon: LucideIcon
  site: SiteInput
  soil: SoilInput
}

// Example inputs to try the form. They are not reference values.
const PRESETS: SoilPreset[] = [
  {
    id: "paddy",
    icon: Waves,
    site: { landType: "lowland", waterSupply: "seasonal_irrigation", soilTexture: "clay" },
    soil: { inputMode: "lab", ph: 5.8, organicMatterPct: 1.8, phosphorusMgKg: 9, potassiumMgKg: 60 },
  },
  {
    id: "upland",
    icon: Sprout,
    site: { landType: "upland", waterSupply: "rainfed", soilTexture: "loam" },
    soil: { inputMode: "lab", ph: 6.4, organicMatterPct: 2.2, phosphorusMgKg: 18, potassiumMgKg: 90 },
  },
  {
    id: "sandy",
    icon: Sun,
    site: { landType: "upland", waterSupply: "rainfed", soilTexture: "sandy" },
    soil: { inputMode: "test_kit", ph: 5.2, nitrogenLevel: "low", phosphorusLevel: "low", potassiumLevel: "medium" },
  },
  {
    id: "acidic",
    icon: FlaskConical,
    site: { landType: "lowland", waterSupply: "rainfed", soilTexture: "clay" },
    soil: { inputMode: "lab", ph: 4.3, organicMatterPct: 1.0, phosphorusMgKg: 4, potassiumMgKg: 40 },
  },
]

function presetToForm(preset: SoilPreset): Partial<FormState> {
  const { soil } = preset
  const base = { ...preset.site, inputMode: soil.inputMode, ph: soil.ph.toString() }
  return soil.inputMode === "lab"
    ? {
        ...base,
        organicMatterPct: soil.organicMatterPct.toString(),
        phosphorusMgKg: soil.phosphorusMgKg.toString(),
        potassiumMgKg: soil.potassiumMgKg.toString(),
      }
    : {
        ...base,
        nitrogenLevel: soil.nitrogenLevel,
        phosphorusLevel: soil.phosphorusLevel,
        potassiumLevel: soil.potassiumLevel,
      }
}

type BuildResult = { ok: true; site: SiteInput; soil: SoilInput } | { ok: false; error: keyof ErrorMessages }
type ErrorMessages = (typeof soilAnalysisMessages)["th"]["form"]["errors"]

/** Turns the form into API input, or names the first problem. */
function buildInput(form: FormState): BuildResult {
  const { landType, waterSupply, soilTexture } = form
  if (!landType || !waterSupply || !soilTexture) return { ok: false, error: "incomplete" }
  const site = { landType, waterSupply, soilTexture }

  const ph = parseFloat(form.ph)
  if (isNaN(ph)) return { ok: false, error: "incomplete" }
  if (ph < PH_INPUT.min || ph > PH_INPUT.max) return { ok: false, error: "phRange" }

  if (form.inputMode === "test_kit") {
    const { nitrogenLevel, phosphorusLevel, potassiumLevel } = form
    if (!nitrogenLevel || !phosphorusLevel || !potassiumLevel) return { ok: false, error: "incomplete" }
    return { ok: true, site, soil: { inputMode: "test_kit", ph, nitrogenLevel, phosphorusLevel, potassiumLevel } }
  }

  const organicMatterPct = parseFloat(form.organicMatterPct)
  const phosphorusMgKg = parseFloat(form.phosphorusMgKg)
  const potassiumMgKg = parseFloat(form.potassiumMgKg)
  if ([organicMatterPct, phosphorusMgKg, potassiumMgKg].some(isNaN)) return { ok: false, error: "incomplete" }
  if (organicMatterPct < 0 || organicMatterPct > 100) return { ok: false, error: "organicMatterRange" }
  if (phosphorusMgKg < 0 || potassiumMgKg < 0) return { ok: false, error: "negative" }
  return { ok: true, site, soil: { inputMode: "lab", ph, organicMatterPct, phosphorusMgKg, potassiumMgKg } }
}

export function SoilInputForm() {
  const router = useRouter()
  const t = useT(soilAnalysisMessages)
  const c = useT(commonMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
    if (!("notes" in patch) && !("province" in patch)) setActivePreset(null)
    if (error) setError(null)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    update({ [e.target.name]: e.target.value } as Partial<FormState>)

  const applyPreset = (preset: SoilPreset) => {
    const name = t.presets.items[preset.id].name
    setForm((prev) => ({ ...prev, ...presetToForm(preset), notes: t.form.presetNote(name) }))
    setActivePreset(preset.id)
    if (error) setError(null)
    toast.success(t.form.presetApplied(name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = buildInput(form)
    if (!input.ok) {
      setError(t.form.errors[input.error])
      return
    }

    setLoading(true)
    setError(null)
    try {
      await runSoilCheck({
        site: input.site,
        soil: input.soil,
        province: form.province,
        notes: form.notes.trim() || undefined,
      })
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

  const levelOptions = (["low", "medium", "high"] as const).map((v) => ({ value: v, label: c.nutrientLevels[v] }))
  const presetPicker = <PresetPicker presets={PRESETS} activeId={activePreset} onSelect={applyPreset} />

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="space-y-5"
        >
          <div className="lg:hidden">{presetPicker}</div>

          <form onSubmit={handleSubmit} noValidate className="surface space-y-8 p-5 sm:p-7">
            {/* 1. Site */}
            <section className="space-y-5">
              <FormSectionHeading icon={MapIcon} title={t.site.title} description={t.site.description} />
              <ChoiceField<LandType>
                name="landType"
                label={t.site.landType}
                columns={2}
                value={form.landType}
                onChange={(landType) => update({ landType })}
                options={(["lowland", "upland"] as const).map((v) => ({
                  value: v,
                  label: c.landTypes[v],
                  desc: t.site.landTypeHint[v],
                }))}
              />
              <ChoiceField<WaterSupply>
                name="waterSupply"
                label={t.site.waterSupply}
                value={form.waterSupply}
                onChange={(waterSupply) => update({ waterSupply })}
                options={(["rainfed", "seasonal_irrigation", "year_round"] as const).map((v) => ({
                  value: v,
                  label: c.waterSupplies[v],
                  desc: t.site.waterSupplyHint[v],
                }))}
              />
              <ChoiceField<SoilTexture>
                name="soilTexture"
                label={t.site.soilTexture}
                value={form.soilTexture}
                onChange={(soilTexture) => update({ soilTexture })}
                options={(["clay", "loam", "sandy"] as const).map((v) => ({
                  value: v,
                  label: c.soilTextures[v],
                  desc: t.site.soilTextureHint[v],
                }))}
              />
            </section>

            {/* 2. Soil test */}
            <section className="space-y-5 border-t border-border pt-6">
              <FormSectionHeading icon={TestTube2} title={t.soil.title} />
              <ChoiceField<InputMode>
                name="inputMode"
                label={t.soil.description}
                columns={2}
                value={form.inputMode}
                onChange={(inputMode) => update({ inputMode })}
                options={(["lab", "test_kit"] as const).map((v) => ({
                  value: v,
                  label: t.soil.modes[v].label,
                  desc: t.soil.modes[v].desc,
                }))}
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <PhField
                  label={c.nutrients.ph}
                  hint={t.soil.ph.hint}
                  reportLabel={form.inputMode === "lab" ? t.soil.ph.report : undefined}
                  value={form.ph}
                  onChange={handleInput}
                  placeholder={`${t.soil.placeholder} 6.2`}
                />

                {form.inputMode === "lab" ? (
                  <>
                    <NumberField
                      id="organicMatterPct"
                      symbol="OM"
                      label={c.nutrients.organicMatter}
                      hint={t.soil.organicMatter.hint}
                      reportLabel={t.soil.organicMatter.report}
                      unit={c.units.percent}
                      max={100}
                      value={form.organicMatterPct}
                      onChange={handleInput}
                      placeholder={`${t.soil.placeholder} 1.5`}
                    />
                    <NumberField
                      id="phosphorusMgKg"
                      symbol="P"
                      label={c.nutrients.phosphorus}
                      hint={t.soil.phosphorus.hint}
                      reportLabel={t.soil.phosphorus.report}
                      unit={c.units.mgPerKg}
                      value={form.phosphorusMgKg}
                      onChange={handleInput}
                      placeholder={`${t.soil.placeholder} 12`}
                    />
                    <NumberField
                      id="potassiumMgKg"
                      symbol="K"
                      label={c.nutrients.potassium}
                      hint={t.soil.potassium.hint}
                      reportLabel={t.soil.potassium.report}
                      unit={c.units.mgPerKg}
                      value={form.potassiumMgKg}
                      onChange={handleInput}
                      placeholder={`${t.soil.placeholder} 70`}
                    />
                  </>
                ) : (
                  <>
                    <ChoiceField<NutrientLevel>
                      name="nitrogenLevel"
                      symbol="N"
                      label={c.nutrients.nitrogen}
                      value={form.nitrogenLevel}
                      onChange={(nitrogenLevel) => update({ nitrogenLevel })}
                      options={levelOptions}
                      hint={t.soil.kitNitrogen}
                    />
                    <ChoiceField<NutrientLevel>
                      name="phosphorusLevel"
                      symbol="P"
                      label={c.nutrients.phosphorus}
                      value={form.phosphorusLevel}
                      onChange={(phosphorusLevel) => update({ phosphorusLevel })}
                      options={levelOptions}
                      hint={t.soil.kitHint}
                    />
                    <ChoiceField<NutrientLevel>
                      name="potassiumLevel"
                      symbol="K"
                      label={c.nutrients.potassium}
                      value={form.potassiumLevel}
                      onChange={(potassiumLevel) => update({ potassiumLevel })}
                      options={levelOptions}
                      hint={t.soil.kitHint}
                    />
                  </>
                )}
              </div>
            </section>

            {/* 3. Context */}
            <section className="grid grid-cols-1 gap-5 border-t border-border pt-6 sm:grid-cols-2">
              <ProvincePicker value={form.province} onChange={(province) => update({ province })} />
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                  <NotebookPen className="size-4 text-muted-foreground" />
                  {t.context.notes}
                  <span className="text-xs font-normal text-muted-foreground">({t.context.optional})</span>
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleInput}
                  placeholder={t.context.notesPlaceholder}
                  className="h-11 rounded-xl border-input bg-card px-3.5 shadow-xs hover:border-primary/30 focus-visible:border-primary"
                />
              </div>
            </section>

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
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="hidden lg:block">{presetPicker}</div>
        <SoilTestGuide />
      </aside>
    </div>
  )
}

function FormSectionHeading({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div className="self-center">
        <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
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

function SoilTestGuide() {
  const t = useT(soilAnalysisMessages)

  return (
    <div className="surface p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Lightbulb className="size-4 text-primary" />
        {t.guide.title}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {t.guide.items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-primary">
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2.5 rounded-xl bg-info-soft p-3 text-xs leading-relaxed text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-info" />
        <p>
          <span className="font-semibold">{t.guide.estimatedTitle}: </span>
          {t.guide.estimated}
        </p>
      </div>
    </div>
  )
}
