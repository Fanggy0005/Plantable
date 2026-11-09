import {
  HARD_PH_RAISE_GAP,
  MAX_SCORE,
  NOT_FEASIBLE_MAX_SCORE,
  NOT_FEASIBLE_PH_LOWER_GAP,
  NOT_FEASIBLE_PH_RAISE_GAP,
  NUTRIENT_PENALTY_PER_LEVEL,
  ORGANIC_MATTER_PENALTY_PER_LEVEL,
  PH_ABOVE_PENALTY_CAP,
  PH_ABOVE_PENALTY_PER_STEP,
  PH_BELOW_PENALTY_CAP,
  PH_BELOW_PENALTY_PER_STEP,
  PH_OFF_OPTIMAL_PENALTY_CAP,
  PH_OFF_OPTIMAL_PENALTY_PER_UNIT,
  PH_STEP,
  TEXTURE_PENALTY_PER_STEP,
} from "../../constants/engine"
import { LEVEL_TH, NUTRIENT_TH, SOIL_TEXTURE_TH } from "./labels"
import { isBelow, levelsBelow } from "./levels"
import type {
  CropRequirementData,
  Difficulty,
  FertilizerNutrient,
  NutrientLevel,
  Penalty,
  RecommendationLevel,
  SiteInput,
  SoilLevels,
  SoilTexture,
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

const TEXTURE_RANK: Record<SoilTexture, number> = { clay: 0, loam: 1, sandy: 2 }

/** Steps from the plot texture to the nearest preferred texture (clay ↔ loam ↔ sandy): 0, 1 or 2. */
export function textureDistance(texture: SoilTexture, preferred: SoilTexture[]): number {
  if (preferred.length === 0) return 0
  return Math.min(...preferred.map((p) => Math.abs(TEXTURE_RANK[p] - TEXTURE_RANK[texture])))
}

/**
 * pH units from the crop's optimum, measured inside its range. Outside the range the distance
 * stays at the edge value, so ph_low / ph_high add on top and the score never jumps up.
 */
export function phOffOptimal(ph: number, req: CropRequirementData): number {
  const clamped = Math.min(Math.max(ph, req.phMin), req.phMax)
  return round2(Math.abs(clamped - req.phOptimal))
}

export function calculatePenalties(
  site: SiteInput,
  ph: number,
  levels: SoilLevels,
  req: CropRequirementData
): Penalty[] {
  const penalties: Penalty[] = []
  const gap = getPhGap(ph, req)

  const textureSteps = textureDistance(site.soilTexture, req.preferredTextures)
  if (textureSteps > 0) {
    penalties.push({ factor: "texture", points: textureSteps * TEXTURE_PENALTY_PER_STEP })
  }
  if (gap.below > 0) {
    penalties.push({ factor: "ph_low", points: phPenalty(gap.below, PH_BELOW_PENALTY_PER_STEP, PH_BELOW_PENALTY_CAP) })
  }
  if (gap.above > 0) {
    penalties.push({ factor: "ph_high", points: phPenalty(gap.above, PH_ABOVE_PENALTY_PER_STEP, PH_ABOVE_PENALTY_CAP) })
  }
  const offOptimal = Math.min(
    Math.round(phOffOptimal(ph, req) * PH_OFF_OPTIMAL_PENALTY_PER_UNIT),
    PH_OFF_OPTIMAL_PENALTY_CAP
  )
  if (offOptimal > 0) {
    penalties.push({ factor: "ph_off_optimal", points: offOptimal })
  }

  // Organic matter and nitrogen come from one measurement when either is estimated
  // (lab: N from organic matter; test kit: organic matter from N). Count that measurement
  // once: keep the larger of the two penalties, preferring the measured factor on a tie.
  const omPoints = levelsBelow(levels.organicMatter, req.minOrganicMatterLevel) * ORGANIC_MATTER_PENALTY_PER_LEVEL
  const nPoints = levelsBelow(levels.nitrogen, req.minNitrogenLevel) * NUTRIENT_PENALTY_PER_LEVEL
  const linked = levels.organicMatterEstimated || levels.nitrogenEstimated
  const keepOm = !linked || omPoints > nPoints || (omPoints === nPoints && levels.nitrogenEstimated)
  const keepN = !linked || !keepOm

  if (keepOm && omPoints > 0) penalties.push({ factor: "organic_matter", points: omPoints })
  if (keepN && nPoints > 0) penalties.push({ factor: "nitrogen", points: nPoints })

  const mineralChecks: Array<[Penalty["factor"], NutrientLevel, NutrientLevel]> = [
    ["phosphorus", levels.phosphorus, req.minPhosphorusLevel],
    ["potassium", levels.potassium, req.minPotassiumLevel],
  ]
  for (const [factor, level, minimum] of mineralChecks) {
    const steps = levelsBelow(level, minimum)
    if (steps > 0) penalties.push({ factor, points: steps * NUTRIENT_PENALTY_PER_LEVEL })
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
  } else if (phOffOptimal(ph, req) >= 0.1) {
    reasons.push(`pH ${ph} อยู่ในช่วงที่ปลูกได้ (${range}) แต่ค่าที่เหมาะที่สุดคือ ${req.phOptimal}`)
  } else {
    reasons.push(`pH ${ph} อยู่ในช่วงที่เหมาะสม (${range})`)
  }

  const textureSteps = textureDistance(site.soilTexture, req.preferredTextures)
  if (textureSteps > 0) {
    const preferred = req.preferredTextures.map((t) => SOIL_TEXTURE_TH[t]).join(" หรือ ")
    const severity = textureSteps > 1 ? " ซึ่งต่างกันมาก" : ""
    reasons.push(`พืชนี้ชอบ${preferred} แปลงนี้เป็น${SOIL_TEXTURE_TH[site.soilTexture]}${severity}`)
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
      const note = nutrient === "nitrogen" && levels.nitrogenEstimated ? " (ประเมินจากอินทรียวัตถุ)" : ""
      reasons.push(
        `${NUTRIENT_TH[nutrient]}${LEVEL_TH[level]}${note} พืชต้องการอย่างน้อยระดับ${LEVEL_TH[minimum]} แก้ได้ด้วยปุ๋ยในฤดูนี้`
      )
    }
  }

  if (difficulty === "not_feasible") {
    reasons.push("ช่องว่าง pH มากเกินกว่าจะปรับให้คุ้มค่าได้จริง ไม่แนะนำให้ปรับดินเพื่อปลูกพืชนี้")
  }

  return reasons
}
