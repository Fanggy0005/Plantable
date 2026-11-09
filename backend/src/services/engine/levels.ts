import type { Nutrient, NutrientLevel, NutrientThreshold, SoilInput, SoilLevels } from "./types"

const LEVEL_RANK: Record<NutrientLevel, number> = { low: 0, medium: 1, high: 2 }

export function isBelow(level: NutrientLevel, minimum: NutrientLevel): boolean {
  return LEVEL_RANK[level] < LEVEL_RANK[minimum]
}

/** How many levels the soil is below the crop minimum: 0, 1 or 2. */
export function levelsBelow(level: NutrientLevel, minimum: NutrientLevel): number {
  return Math.max(0, LEVEL_RANK[minimum] - LEVEL_RANK[level])
}

/** Find the level whose [min, max) range contains the value. */
export function classifyValue(
  nutrient: Nutrient,
  value: number,
  thresholds: NutrientThreshold[]
): NutrientLevel {
  const match = thresholds.find(
    (t) =>
      t.nutrient === nutrient &&
      (t.min === null || value >= t.min) &&
      (t.max === null || value < t.max)
  )
  if (!match) {
    throw new Error(`No ${nutrient} threshold covers value ${value}`)
  }
  return match.level
}

/**
 * Normalize either input mode into levels.
 * Lab reports rarely include available N, so N follows organic matter.
 * Test kits do not measure organic matter, so organic matter follows N.
 */
export function normalizeSoilLevels(soil: SoilInput, thresholds: NutrientThreshold[]): SoilLevels {
  if (soil.inputMode === "lab") {
    const organicMatter = classifyValue("organic_matter", soil.organicMatterPct, thresholds)
    return {
      organicMatter,
      nitrogen: organicMatter,
      phosphorus: classifyValue("phosphorus", soil.phosphorusMgKg, thresholds),
      potassium: classifyValue("potassium", soil.potassiumMgKg, thresholds),
      organicMatterEstimated: false,
      nitrogenEstimated: true,
    }
  }

  return {
    organicMatter: soil.nitrogenLevel,
    nitrogen: soil.nitrogenLevel,
    phosphorus: soil.phosphorusLevel,
    potassium: soil.potassiumLevel,
    organicMatterEstimated: true,
    nitrogenEstimated: false,
  }
}
