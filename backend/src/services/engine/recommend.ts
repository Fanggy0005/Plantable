import { CATEGORY_GROUP } from "../../constants/crop-categories"
import { normalizeSoilLevels } from "./levels"
import { buildReasons, calculatePenalties, calculateScore, determineDifficulty, getRecommendationLevel } from "./score"
import { checkSite } from "./site-check"
import type {
  CropProfile,
  Difficulty,
  IneligibleCrop,
  NutrientThreshold,
  RankedCrop,
  RecommendationResult,
  SiteInput,
  SoilInput,
} from "./types"

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  not_feasible: 3,
}

function compareRanked(a: RankedCrop, b: RankedCrop): number {
  return (
    b.score - a.score ||
    DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
    a.cropName.localeCompare(b.cropName)
  )
}

/** Answers question 1: which crops fit this plot, best first. */
export function recommendCrops(
  site: SiteInput,
  soil: SoilInput,
  crops: CropProfile[],
  thresholds: NutrientThreshold[]
): RecommendationResult {
  const levels = normalizeSoilLevels(soil, thresholds)
  const ranked: RankedCrop[] = []
  const ineligible: IneligibleCrop[] = []

  for (const crop of crops) {
    const base = { cropId: crop.id, cropName: crop.name, cropNameTh: crop.nameTh }
    const req = crop.requirement

    if (!req) {
      ineligible.push({ ...base, reasons: ["ยังไม่มีข้อมูลความต้องการของพืชชนิดนี้"] })
      continue
    }

    const siteReasons = checkSite(site, req)
    if (siteReasons.length > 0) {
      ineligible.push({ ...base, reasons: siteReasons })
      continue
    }

    const penalties = calculatePenalties(site, soil.ph, levels, req)
    const difficulty = determineDifficulty(soil.ph, levels, req)
    const score = calculateScore(penalties, difficulty)

    ranked.push({
      ...base,
      group: CATEGORY_GROUP[crop.category],
      category: crop.category,
      imageUrl: crop.imageUrl,
      score,
      level: getRecommendationLevel(score),
      difficulty,
      reasons: buildReasons(site, soil.ph, levels, req, difficulty),
      penalties,
    })
  }

  ranked.sort(compareRanked)
  ineligible.sort((a, b) => a.cropName.localeCompare(b.cropName))

  return { levels, ranked, ineligible }
}
