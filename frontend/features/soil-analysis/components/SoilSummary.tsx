"use client"

import { Droplets, Layers, Map as MapIcon, TestTube2 } from "lucide-react"
import { Stagger, StaggerItem } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { recommendationMessages } from "@/features/recommendation/messages"
import { useFormat, useT } from "@/lib/i18n"
import { commonMessages } from "@/lib/i18n/messages/common"
import { LEVEL_VARIANT } from "@/lib/score"
import type { NutrientLevel, SiteInput, SoilInput, SoilLevels } from "@/types"

interface NutrientTile {
  key: "organicMatter" | "nitrogen" | "phosphorus" | "potassium"
  symbol: string
  level: NutrientLevel
  value?: string
  estimated: boolean
}

/** The plot's site and the measured soil, with each nutrient's normalized level. */
export function SoilSummary({ site, soil, levels }: { site: SiteInput; soil: SoilInput; levels: SoilLevels }) {
  const t = useT(recommendationMessages).results
  const common = useT(commonMessages)
  const { number } = useFormat()

  const lab = soil.inputMode === "lab" ? soil : null
  const tiles: NutrientTile[] = [
    {
      key: "organicMatter",
      symbol: "OM",
      level: levels.organicMatter,
      value: lab ? `${number(lab.organicMatterPct)} ${common.units.percent}` : undefined,
      estimated: levels.organicMatterEstimated,
    },
    { key: "nitrogen", symbol: "N", level: levels.nitrogen, estimated: levels.nitrogenEstimated },
    {
      key: "phosphorus",
      symbol: "P",
      level: levels.phosphorus,
      value: lab ? `${number(lab.phosphorusMgKg)} ${common.units.mgPerKg}` : undefined,
      estimated: false,
    },
    {
      key: "potassium",
      symbol: "K",
      level: levels.potassium,
      value: lab ? `${number(lab.potassiumMgKg)} ${common.units.mgPerKg}` : undefined,
      estimated: false,
    },
  ]

  const siteItems = [
    { icon: MapIcon, value: common.landTypes[site.landType] },
    { icon: Droplets, value: common.waterSupplies[site.waterSupply] },
    { icon: Layers, value: common.soilTextures[site.soilTexture] },
  ]

  return (
    <section aria-label={t.soilValues} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs font-semibold text-muted-foreground">{t.site}:</span>
        {siteItems.map(({ icon: Icon, value }) => (
          <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <Icon className="size-3.5 text-primary" />
            {value}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
          <TestTube2 className="size-3.5 text-primary" />
          {t.inputModes[soil.inputMode]}
        </span>
      </div>

      <Stagger immediate className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StaggerItem className="surface-interactive col-span-2 p-4 sm:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground">pH · {common.nutrients.ph}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">{number(soil.ph)}</p>
        </StaggerItem>
        {tiles.map((tile) => (
          <StaggerItem key={tile.key} className="surface-interactive p-4">
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {tile.symbol} · {common.nutrients[tile.key]}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant={LEVEL_VARIANT[tile.level]} className="text-sm">
                {common.nutrientLevels[tile.level]}
              </Badge>
              {tile.estimated && (
                <Badge variant="muted" title={t.estimatedHint}>
                  {t.estimated}
                </Badge>
              )}
            </div>
            {tile.value && <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">{tile.value}</p>}
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
