import { cropRepository } from "../repositories/crop.repository"
import { masterDataRepository } from "../repositories/master-data.repository"
import { recommendCrops, type RecommendationResult, type SiteInput, type SoilInput } from "./engine"
import { SAMPLE_DATA_WARNING, usesSampleData } from "./data-quality"

export interface RecommendationResponse extends RecommendationResult {
  warnings: string[]
}

export class RecommendationService {
  async recommend(site: SiteInput, soil: SoilInput): Promise<RecommendationResponse> {
    const [crops, thresholds] = await Promise.all([
      cropRepository.findAllWithRequirement(),
      masterDataRepository.findThresholds(),
    ])

    const result = recommendCrops(site, soil, crops, thresholds)
    const sources = [
      ...crops.flatMap((c) => (c.requirement ? [c.requirement.source] : [])),
      ...thresholds.map((t) => t.source),
    ]

    return { ...result, warnings: usesSampleData(sources) ? [SAMPLE_DATA_WARNING] : [] }
  }
}

export const recommendationService = new RecommendationService()
