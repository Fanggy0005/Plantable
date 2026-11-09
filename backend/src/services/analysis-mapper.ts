import type { NutrientLevelThreshold, Plot, SoilAnalysis } from "../generated/prisma"
import { normalizeSoilLevels, type SiteInput, type SoilInput, type SoilLevels } from "./engine"

export interface AnalysisSummary {
  id: string
  plotId: string
  sampledAt: string
  soil: SoilInput
  levels: SoilLevels
  notes: string | null
  createdAt: Date
}

/** Rebuild the engine input from a stored row. */
export function toSoilInput(row: SoilAnalysis): SoilInput {
  if (row.inputMode === "lab") {
    if (row.organicMatterPct === null || row.phosphorusMgKg === null || row.potassiumMgKg === null) {
      throw new Error(`Soil analysis ${row.id} is missing lab values`)
    }
    return {
      inputMode: "lab",
      ph: row.ph,
      organicMatterPct: row.organicMatterPct,
      phosphorusMgKg: row.phosphorusMgKg,
      potassiumMgKg: row.potassiumMgKg,
    }
  }

  if (row.nitrogenLevel === null || row.phosphorusLevel === null || row.potassiumLevel === null) {
    throw new Error(`Soil analysis ${row.id} is missing test-kit levels`)
  }
  return {
    inputMode: "test_kit",
    ph: row.ph,
    nitrogenLevel: row.nitrogenLevel,
    phosphorusLevel: row.phosphorusLevel,
    potassiumLevel: row.potassiumLevel,
  }
}

export function toSite(plot: Plot): SiteInput {
  return { landType: plot.landType, waterSupply: plot.waterSupply, soilTexture: plot.soilTexture }
}

export const toDateString = (date: Date) => date.toISOString().slice(0, 10)

export function summarizeAnalysis(row: SoilAnalysis, thresholds: NutrientLevelThreshold[]): AnalysisSummary {
  const soil = toSoilInput(row)
  return {
    id: row.id,
    plotId: row.plotId,
    sampledAt: toDateString(row.sampledAt),
    soil,
    levels: normalizeSoilLevels(soil, thresholds),
    notes: row.notes,
    createdAt: row.createdAt,
  }
}
