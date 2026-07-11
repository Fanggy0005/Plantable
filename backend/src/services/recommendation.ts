import { plants } from "../data/plants"
import { calculateScore, type SoilInput, type ScoreResult } from "./score"

export interface RecommendationResult {
  soil: SoilInput
  rankings: (ScoreResult & { name: string; nameTh: string; description: string })[]
}

export function recommend(soil: SoilInput): RecommendationResult {
  const rankings = plants
    .map((plant) => ({
      ...calculateScore(soil, plant),
      name: plant.name,
      nameTh: plant.nameTh,
      description: plant.description,
    }))
    .sort((a, b) => b.score - a.score)

  return { soil, rankings }
}
