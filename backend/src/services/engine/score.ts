import {
  HARD_PH_RAISE_GAP,
  MAX_SCORE,
  NOT_FEASIBLE_MAX_SCORE,
  NOT_FEASIBLE_PH_LOWER_GAP,
  NOT_FEASIBLE_PH_RAISE_GAP,
  NUTRIENT_BELOW_MIN_PENALTY,
  ORGANIC_MATTER_BELOW_MIN_PENALTY,
  PH_ABOVE_PENALTY_CAP,
  PH_ABOVE_PENALTY_PER_STEP,
  PH_BELOW_PENALTY_CAP,
  PH_BELOW_PENALTY_PER_STEP,
  PH_STEP,
  TEXTURE_NOT_PREFERRED_PENALTY,
} from "../../constants/engine"
import { LEVEL_TH, NUTRIENT_TH, SOIL_TEXTURE_TH } from "./labels"
import { isBelow } from "./levels"
import type {
  CropRequirementData,
  Difficulty,
  FertilizerNutrient,
  NutrientLevel,
  Penalty,
  RecommendationLevel,
  SiteInput,
  SoilLevels,
} from "./types"

interface PhGap {
  /** pH units below the crop minimum (0 when not below) */
  below: number
  /** pH units above the crop maximum (0 when not above) */
  above: number
}

const round2 = (value: number) => Math.round(value * 100) / 100

export function getPhGap(ph: number, req: CropRequirementData): PhGap {
  return {
    below: Math.max(0, round2(req.phMin - ph)),
    above: Math.max(0, round2(ph - req.phMax)),
  }
}

function phPenalty(gap: number, perStep: number, cap: number): number {
  if (gap <= 0) return 0
  const steps = Math.ceil(Number((gap / PH_STEP).toFixed(6)))
  return Math.min(steps * perStep, cap)
}

export function calculatePenalties(
  site: SiteInput,
  ph: number,
  levels: SoilLevels,
  req: CropRequirementData
): Penalty[] {
  const penalties: Penalty[] = []
  const gap = getPhGap(ph, req)

  if (!req.preferredTextures.includes(site.soilTexture)) {
    penalties.push({ factor: "texture", points: TEXTURE_NOT_PREFERRED_PENALTY })
  }
  if (gap.below > 0) {
    penalties.push({ factor: "ph_low", points: phPenalty(gap.below, PH_BELOW_PENALTY_PER_STEP, PH_BELOW_PENALTY_CAP) })
  }
  if (gap.above > 0) {
    penalties.push({ factor: "ph_high", points: phPenalty(gap.above, PH_ABOVE_PENALTY_PER_STEP, PH_ABOVE_PENALTY_CAP) })
  }
  if (isBelow(levels.organicMatter, req.minOrganicMatterLevel)) {
    penalties.push({ factor: "organic_matter", points: ORGANIC_MATTER_BELOW_MIN_PENALTY })
  }

  const nutrientChecks: Array<[Penalty["factor"], NutrientLevel, NutrientLevel]> = [
    ["nitrogen", levels.nitrogen, req.minNitrogenLevel],
    ["phosphorus", levels.phosphorus, req.minPhosphorusLevel],
    ["potassium", levels.potassium, req.minPotassiumLevel],
  ]
  for (const [factor, level, minimum] of nutrientChecks) {
    if (isBelow(level, minimum)) {
      penalties.push({ factor, points: NUTRIENT_BELOW_MIN_PENALTY })
    }
  }

  return penalties
}

export function determineDifficulty(ph: number, levels: SoilLevels, req: CropRequirementData): Difficulty {
  const gap = getPhGap(ph, req)

  if (gap.above > NOT_FEASIBLE_PH_LOWER_GAP || gap.below > NOT_FEASIBLE_PH_RAISE_GAP) return "not_feasible"
  if (gap.above > 0 || gap.below > HARD_PH_RAISE_GAP) return "hard"
  if (gap.below > 0 || isBelow(levels.organicMatter, req.minOrganicMatterLevel)) return "moderate"
  return "easy"
}

export function getRecommendationLevel(score: number): RecommendationLevel {
  if (score >= 90) return "Excellent"
  if (score >= 75) return "Good"
  if (score >= 60) return "Fair"
  if (score >= 40) return "Poor"
  return "Not Recommended"
}

export function calculateScore(penalties: Penalty[], difficulty: Difficulty): number {
  const raw = Math.max(0, MAX_SCORE - penalties.reduce((sum, p) => sum + p.points, 0))
  return difficulty === "not_feasible" ? Math.min(raw, NOT_FEASIBLE_MAX_SCORE) : raw
}

export function buildReasons(
  site: SiteInput,
  ph: number,
  levels: SoilLevels,
  req: CropRequirementData,
  difficulty: Difficulty
): string[] {
  const reasons: string[] = []
  const gap = getPhGap(ph, req)
  const range = `${req.phMin}–${req.phMax}`

  if (gap.below > 0) {
    reasons.push(`ดินเป็นกรดเกินไป pH ${ph} ต่ำกว่าช่วงที่พืชต้องการ (${range}) อยู่ ${gap.below}`)
  } else if (gap.above > 0) {
    reasons.push(`ดินเป็นด่างเกินไป pH ${ph} สูงกว่าช่วงที่พืชต้องการ (${range}) อยู่ ${gap.above}`)
  } else {
    reasons.push(`pH ${ph} อยู่ในช่วงที่เหมาะสม (${range})`)
  }

  if (!req.preferredTextures.includes(site.soilTexture)) {
    const preferred = req.preferredTextures.map((t) => SOIL_TEXTURE_TH[t]).join(" หรือ ")
    reasons.push(`พืชนี้ชอบ${preferred} แปลงนี้เป็น${SOIL_TEXTURE_TH[site.soilTexture]}`)
  }

  if (isBelow(levels.organicMatter, req.minOrganicMatterLevel)) {
    const note = levels.organicMatterEstimated ? " (ประเมินจากระดับไนโตรเจน)" : ""
    reasons.push(
      `อินทรียวัตถุ${LEVEL_TH[levels.organicMatter]}${note} พืชต้องการอย่างน้อยระดับ${LEVEL_TH[req.minOrganicMatterLevel]}`
    )
  }

  const nutrientChecks: Array<[FertilizerNutrient, NutrientLevel, NutrientLevel]> = [
    ["nitrogen", levels.nitrogen, req.minNitrogenLevel],
    ["phosphorus", levels.phosphorus, req.minPhosphorusLevel],
    ["potassium", levels.potassium, req.minPotassiumLevel],
  ]
  for (const [nutrient, level, minimum] of nutrientChecks) {
    if (isBelow(level, minimum)) {
      reasons.push(`${NUTRIENT_TH[nutrient]}${LEVEL_TH[level]} แก้ได้ด้วยปุ๋ยในฤดูนี้`)
    }
  }

  if (difficulty === "not_feasible") {
    reasons.push("ช่องว่าง pH มากเกินกว่าจะปรับให้คุ้มค่าได้จริง ไม่แนะนำให้ปรับดินเพื่อปลูกพืชนี้")
  }

  return reasons
}
