"use client"

import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2, CircleAlert } from "lucide-react"
import { PHScaleGauge } from "@/components/charts/PHScaleGauge"
import { SuitabilityGauge } from "@/components/charts/SuitabilityGauge"
import { CropIcon } from "@/components/shared/CropIcon"
import { EASE_OUT } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { DIFFICULTY_VARIANT, LEVEL_VARIANT, meetsLevel } from "@/lib/score"
import { cn } from "@/lib/utils"
import type { CropRequirement, NutrientLevel, RankedCrop, SoilCheck } from "@/types"
import { recommendationMessages } from "../messages"

/** Side panel for the selected crop: pH against the crop's range and nutrient levels against its minimums. */
export function SelectedCropPanel({
  crop,
  check,
  requirement,
}: {
  crop: RankedCrop
  check: SoilCheck
  /** Loaded separately; null while loading or when the crop has no requirement data. */
  requirement: CropRequirement | null
}) {
  const t = useT(recommendationMessages).results
  const common = useT(commonMessages)
  const { pick } = useFormat()
  const name = pick(crop.cropNameTh, crop.cropName)
  const { levels } = check.result

  const rows: { key: keyof typeof common.nutrients; actual: NutrientLevel; minimum?: NutrientLevel; estimated: boolean }[] = [
    { key: "organicMatter", actual: levels.organicMatter, minimum: requirement?.minOrganicMatterLevel, estimated: levels.organicMatterEstimated },
    { key: "nitrogen", actual: levels.nitrogen, minimum: requirement?.minNitrogenLevel, estimated: levels.nitrogenEstimated },
    { key: "phosphorus", actual: levels.phosphorus, minimum: requirement?.minPhosphorusLevel, estimated: false },
    { key: "potassium", actual: levels.potassium, minimum: requirement?.minPotassiumLevel, estimated: false },
  ]

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={crop.cropId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="surface flex items-center gap-4 p-4"
        >
          <CropIcon name={crop.cropName} category={crop.category} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">{t.selectedCrop}</p>
            <p className="truncate text-xl font-bold tracking-tight text-foreground">{name}</p>
            <Badge variant={DIFFICULTY_VARIANT[crop.difficulty]} className="mt-1">
              {common.difficulties[crop.difficulty]}
            </Badge>
          </div>
          <SuitabilityGauge score={crop.score} size={64} strokeWidth={6} />
        </motion.div>
      </AnimatePresence>

      <PHScaleGauge
        currentPh={check.soil.ph}
        targetMin={requirement?.phMin}
        targetMax={requirement?.phMax}
        cropName={requirement ? name : undefined}
      />

      <div className="surface space-y-3 p-4">
        <h4 className="text-sm font-semibold text-foreground">{t.levelsTitle}</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-muted-foreground">
              <th className="pb-1.5 font-semibold" />
              <th className="pb-1.5 font-semibold">{t.yourSoil}</th>
              <th className="pb-1.5 font-semibold">{t.cropNeeds}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ok = row.minimum ? meetsLevel(row.actual, row.minimum) : null
              return (
                <tr key={row.key} className="border-t border-border">
                  <td className="py-2 pr-2 text-foreground">{common.nutrients[row.key]}</td>
                  <td className="py-2 pr-2">
                    <span className="inline-flex flex-wrap items-center gap-1">
                      <Badge variant={LEVEL_VARIANT[row.actual]}>{common.nutrientLevels[row.actual]}</Badge>
                      {row.estimated && <span className="text-[11px] text-muted-foreground">({t.estimated})</span>}
                    </span>
                  </td>
                  <td className="py-2">
                    {row.minimum ? (
                      <span className={cn("inline-flex items-center gap-1 text-xs", ok ? "text-success" : "text-warning")}>
                        {ok ? <CheckCircle2 className="size-3.5" /> : <CircleAlert className="size-3.5" />}
                        {t.atLeast(common.nutrientLevels[row.minimum])}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {check.notes && (
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t.notes}:</span> {check.notes}
          </p>
        )}
      </div>
    </div>
  )
}
